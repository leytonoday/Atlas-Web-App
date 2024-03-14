import { SimpleSlideFade } from "@/components/common";
import { services } from "@/services";
import { IPlan, IServerResponse, IStripeSubscription } from "@/types";
import {
  axiosErrorToServerResponseErrors,
  getSupportEmail,
  handleApiRequestError,
} from "@/utils";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { Button, Checkbox, Modal, Spin } from "antd";
import { AxiosError } from "axios";
import { useCallback, useState } from "react";
import { Fade } from "react-awesome-reveal";
import { AiOutlineLock } from "react-icons/ai";
import { useRouter } from "next/router";
import { useStore } from "@/store";

const { confirm } = Modal;

interface INewPaymentMethodFormProps {
  /**
   * Handles the back button click event
   */
  onBack?: () => void;

  /**
   * The plan to subscribe to
   */
  plan?: IPlan;

  /**
   * The interval on which to subscribe to the plan
   */
  interval?: string;

  /**
   * Determines whether or not the user is eligible for a trial
   */
  amIEligibleForTrial?: boolean;

  /**
   * The promotion code to use for the subscription
   */
  promotionCode: string | null;
}

/**
 * The form for collecting a new payment method and subscribing the user to a plan using that payment method
 */
export const NewPaymentMethodForm = (props: INewPaymentMethodFormProps) => {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const store = useStore();

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [setAsDefaultPaymentMethod, setSetAsDefaultPaymentMethod] =
    useState(true);

  /**
   * Listen for changes in the CardElement and display any errors as the customer types their card details
   * @param event The event object
   */
  const handleChange = async (event: any) =>
    setError(event.error ? event.error.message : "");

  const showSubscriptionConfirm = useCallback((paymentMethodId: string) => {
    confirm({
      title: "Trial will not be applied!",
      type: "warning",
      width: "50em",
      content: (
        <div>
          This card has been used for payments in the past, which means you
          won't be able to use it for the trial. If you'd like to use this card,
          you'll be charged right away.
        </div>
      ),
      async onOk() {
        setIsLoading(true);
        await performSubscriptionFlow(paymentMethodId);
        setIsLoading(false);
      },
      okText: "Subscribe",
    });
  }, []);

  /**
   * Subscribes the user to the plan
   * @param event The event object
   */
  const handleSubmit = async (event: any) => {
    event.preventDefault();

    if (!stripe || !elements || !props.plan) {
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      // Create the payment method
      const paymentMethodResult = await createPaymentMethod();
      if (paymentMethodResult.error)
        return handleError(paymentMethodResult.error.message);

      // If there's a trial, ensure that the card hasn't been used before
      if (props.plan!.trialPeriodDays > 0 && props.amIEligibleForTrial) {
        const hasCardPaymentMethodBeenUsedBeforeResponse =
          await services.api.stripe.hasCardPaymentMethodBeenUsedBefore(
            paymentMethodResult.paymentMethodId!,
          );

        // If the given payment method has been used before, then we can't use it for the trial. But first, confirm with the user that they want to proceed and skip the trial.
        const usedBefore = hasCardPaymentMethodBeenUsedBeforeResponse.data;
        if (usedBefore)
          showSubscriptionConfirm(paymentMethodResult.paymentMethodId!);
        else
          await performSubscriptionFlow(paymentMethodResult.paymentMethodId!);
      } else
        await performSubscriptionFlow(paymentMethodResult.paymentMethodId!);
    } catch (error) {
      handleApiRequestError(error);
    }

    setIsLoading(false);
  };

  /**
   * Performs the payment flow for the subscription. Handles attaching the payment method to the user, and creating or updating the subscription.
   * Also handles 3D Secure authentication if required.
   * @param paymentMethodId The ID of the payment method to use for the subscription
   */
  const performSubscriptionFlow = async (paymentMethodId: string) => {
    // Attach it to the user
    const attachResponse = await attachPaymentMethod(paymentMethodId);
    if (attachResponse.error) return handleError(attachResponse.error.message);

    // Create or update the subscription, depending on the user's current subscription status
    const subscriptionResponse =
      await createOrUpdateSubscription(paymentMethodId);
    if (subscriptionResponse.error)
      return handleError(subscriptionResponse.error.message);

    const subscription = subscriptionResponse.data as IStripeSubscription;

    // If there is no positive TrialPeriodDays value on the Subscription, then the payment is to be taken immediately, and thus an invoice with a payment intent is created.
    // If there is a positive TrialPeriodDays value on the Subscription, then the payment is to be taken at the end of the trial, and thus a setup intent is created instead.
    const intent =
      subscription.latestInvoice?.paymentIntent ||
      subscription.pendingSetupIntent;

    // If the user is now trialing, we've suceeded, or if the subscription is active immediately,
    // we've succeeded (usually if the customer has some balance on their account already) or if the transaction was successful
    // If the subscription is past due, then just redirect the user to the manage subscription page and have them manually update their payment method
    if (
      subscription.status === "trialing" ||
      subscription.status === "active" ||
      subscription.status === "past_due"
    ) {
      router.push("/product/checkout/result?success=true");
      return;
    }
    // If the payment or setup intent requires action, confirm it. Starts the 3D Secure flow
    else if (intent.status === "requires_action") {
      const paymentIntentResult = await confirmCardPayment(
        intent.clientSecret,
        paymentMethodId,
      );

      if (paymentIntentResult.error)
        return handleError(paymentIntentResult.error.message);

      if (paymentIntentResult.paymentIntent.status === "succeeded") {
        router.push("/product/checkout/result?success=true");
      } else {
        return handleError(
          `An unknown error occurred. Contact ${getSupportEmail()} for help.`,
        );
      }
    }

    // If the card declined for whatever reason, show the error
    else if (
      subscription.status === "incomplete" &&
      intent?.status === "requires_payment_method"
    )
      return handleError(
        intent?.lastPaymentError?.message ||
          `An unknown error occurred. Contact ${getSupportEmail()} for help`,
      );
  };

  /**
   * Creates a payment method using the Stripe API
   * @returns The result of the payment method creation
   */
  const createPaymentMethod = async () => {
    // Trigger form validation and wallet collection
    const { error: submitError } = await elements!.submit();
    if (submitError) {
      return { error: submitError };
    }

    const payload = await stripe!.createPaymentMethod({
      elements: elements!,
    });

    return { error: payload.error, paymentMethodId: payload.paymentMethod?.id };
  };

  /**
   * Attaches the given payment method to the user
   * @param paymentMethodId The ID of the payment method to attach
   */
  const attachPaymentMethod = async (paymentMethodId: string) => {
    try {
      await services.api.stripe.attachPaymentMethod({
        stripePaymentMethodId: paymentMethodId,
        setAsDefaultPaymentMethod,
        userId: store.whoAmI?.id || "",
      });
    } catch (e) {
      // In this instance, we want to return the error, rather than passing it to handleApiRequestError
      const errors = axiosErrorToServerResponseErrors(e as AxiosError);
      return { error: errors.shift() };
    }

    return {};
  };

  /**
   * Depending on if the user is already subscribed to the plan, either creates a new subscription, or updates the existing one.
   * @param paymentMethodId The ID of the payment method to use for the subscription
   */
  const createOrUpdateSubscription = async (paymentMethodId: string) => {
    let subscriptionCreateOrUpdateResponse: IServerResponse | null = null;

    try {
      const mySubscriptionResponse =
        await services.api.stripe.getMySubscription();

      if (mySubscriptionResponse.data !== null) {
        subscriptionCreateOrUpdateResponse =
          await services.api.stripe.updateSubscription({
            planId: props.plan?.id!,
            stripePaymentMethodId: paymentMethodId,
            interval: props.interval! as any,
            promotionCode: props.promotionCode,
          });
      } else {
        subscriptionCreateOrUpdateResponse =
          await services.api.stripe.createSubscription({
            planId: props.plan?.id!,
            stripePaymentMethodId: paymentMethodId,
            interval: props.interval! as any,
            promotionCode: props.promotionCode,
          });
      }
    } catch (e) {
      // In this instance, we want to return the error, rather than passing it to handleApiRequestError
      const errors = axiosErrorToServerResponseErrors(e as AxiosError);
      return { error: errors.shift() };
    }

    return { data: subscriptionCreateOrUpdateResponse.data };
  };

  /**
   * Confirms the card payment with Stripe. Starts the 3D Secure flow.
   * @param clientSecret The client secret of the payment intent
   * @param paymentMethodId The ID of the payment method to use for the payment
   * @returns The result of the card confirmation
   */
  const confirmCardPayment = async (
    clientSecret: string,
    paymentMethodId: string,
  ) => {
    return stripe!.confirmCardPayment(clientSecret, {
      payment_method: paymentMethodId,
    });
  };

  const handleError = (errorMessage?: string) => {
    setError(
      errorMessage ||
        `An unknown error occurred. Contact ${getSupportEmail()} for help.`,
    );
    setIsLoading(false);
  };

  try {
    return (
      <form onSubmit={handleSubmit}>
        <Spin spinning={isLoading}>
          <div className="grey-border rounded-md p-6">
            <PaymentElement
              options={{
                wallets: {
                  applePay: "never",
                  googlePay: "never",
                },
              }}
              onChange={handleChange}
            />
          </div>

          {error && (
            <Fade
              direction="up"
              className="mt-3 flex w-full justify-center text-red-400"
            >
              {error}
            </Fade>
          )}

          <div style={{ marginLeft: "0.5em", marginTop: "1em" }}>
            <Checkbox
              checked={setAsDefaultPaymentMethod}
              onChange={(e) => setSetAsDefaultPaymentMethod(e.target.checked)}
            >
              Use as default payment method
            </Checkbox>
          </div>

          <SimpleSlideFade
            direction="bottom-to-top"
            fadeOpacity
            slideDistance="15px"
            delay={0}
          >
            <div className="mt-3 flex items-center justify-center gap-4">
              {props.onBack && (
                <Button
                  aria-label="Go back"
                  onClick={() => {
                    setError(null);
                    props.onBack!();
                  }}
                >
                  Back
                </Button>
              )}
              <Button
                aria-label="Subscribe"
                type="primary"
                htmlType="submit"
                loading={isLoading}
                className="!flex !items-center !justify-center !gap-2"
              >
                <div>Subscribe</div>
                <AiOutlineLock />
              </Button>
            </div>
          </SimpleSlideFade>
        </Spin>
      </form>
    );
  } catch (e) {
    console.log(e);
    return null;
  }
};
