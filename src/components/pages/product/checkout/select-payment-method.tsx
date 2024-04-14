import { PaymentMethod, SimpleSlideFade } from "@/components/common";
import { services } from "@/services";
import {
  IPlan,
  IServerResponse,
  IStripePaymentMethod,
  IStripeSubscription,
} from "@/types";
import {
  axiosErrorToServerResponseErrors,
  getSupportEmail,
  handleApiRequestError,
} from "@/utils";
import { useStripe } from "@stripe/react-stripe-js";
import { Button, Modal, Radio, Spin } from "antd";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Fade } from "react-awesome-reveal";
import { AiOutlineLock } from "react-icons/ai";

interface ISelectPaymentMethodProps {
  /**
   * The plan to subscribe to
   */
  plan?: IPlan;

  /**
   * The interval on which to subscribe to the plan
   */
  interval?: string;

  /**
   * The user's payment methods
   */
  userPaymentMethods?: IStripePaymentMethod[];

  /**
   * The user's default payment method
   */
  userDefaultPaymentMethod?: IStripePaymentMethod;

  /**
   * The function to call when the user clicks the next button
   */
  onNext: () => void;

  /**
   * Determines whether or not the user is eligible for a trial
   */
  amIEligibleForTrial?: boolean;

  /**
   * The promotion code to use for the subscription
   */
  promotionCode: string | null;
}

const { confirm } = Modal;

/**
 * The form for selecting a payment method, and subscribing to the plan with that payment method.
 */
export const SelectPaymentMethod = (props: ISelectPaymentMethodProps) => {
  const [isSubscribeLoading, setIsSubscribeLoading] = useState(false);
  const [isOnNextLoading, setIsOnNextLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const stripe = useStripe();

  const [radioValue, setRadioValue] = useState(
    props.userDefaultPaymentMethod?.id || null,
  );

  /**
   * Subscribes the user to the plan, using the selected payment method.
   * Handles the entire subscription process, including creating/updating the subscription, and confirming 3D Secure if necessary.
   */
  const performSubscriptionFlow = useCallback(async () => {
    setIsSubscribeLoading(true);

    try {
      // Create or update the subscription, depending on the user's current subscription status
      const subscriptionResponse = await createOrUpdateSubscription(
        radioValue!,
      );
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
        return router.push("/product/checkout/result?success=true");
      }
      // If the payment or setup intent requires action, confirm it. Starts the 3D Secure flow
      else if (intent.status === "requires_action") {
        const paymentIntentResult = await confirmCardPayment(
          intent.clientSecret,
          radioValue!,
        );

        if (paymentIntentResult.error)
          return handleError(paymentIntentResult.error.message);

        if (paymentIntentResult.paymentIntent.status === "succeeded") {
          return router.push("/product/checkout/result?success=true");
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
            `An unknown error occurred. Contact ${getSupportEmail()} for help.`,
        );
    } catch (error) {
      console.log(error);
    }

    setIsSubscribeLoading(false);
  }, [radioValue, stripe, props.plan, props.interval, props.promotionCode]);

  const showSubscriptionConfirm = useCallback(() => {
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
        setIsSubscribeLoading(true);
        await performSubscriptionFlow();
        setIsSubscribeLoading(false);
      },
      okText: "Subscribe",
    });
  }, []);

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    if (!stripe || !radioValue || !props.plan) {
      return;
    }

    setIsSubscribeLoading(true);
    try {
      setError(null);

      // If there's a trial, ensure that the card hasn't been used before
      if (props.plan!.trialPeriodDays > 0 && props.amIEligibleForTrial) {
        const hasCardPaymentMethodBeenUsedBeforeResponse =
          await services.api.stripe.hasCardPaymentMethodBeenUsedBefore(
            radioValue,
          );

        // If the given payment method has been used before, then we can't use it for the trial. But first, confirm with the user that they want to proceed and skip the trial.
        const usedBefore = hasCardPaymentMethodBeenUsedBeforeResponse.data;
        if (usedBefore) {
          showSubscriptionConfirm();
        } else {
          await performSubscriptionFlow();
        }
      } else {
        await performSubscriptionFlow();
      }
    } catch (error) {
      handleApiRequestError(error);
    }
    setIsSubscribeLoading(false);
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
            planId: props.plan!.id!,
            stripePaymentMethodId: paymentMethodId,
            interval: props.interval! as any,
            promotionCode: props.promotionCode,
          });
      } else {
        subscriptionCreateOrUpdateResponse =
          await services.api.stripe.createSubscription({
            planId: props.plan!.id!,
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
    setIsSubscribeLoading(false);
  };

  return (
    <>
      <div className="grey-border max-h-[30em] w-full overflow-y-auto rounded-md p-1 md:p-4">
        <Radio.Group onChange={() => {}} value={radioValue} className="w-full">
          <div className="flex flex-col gap-2">
            <Spin spinning={isOnNextLoading}>
              <Radio
                value={"new-card"}
                className="selectable !mr-0 w-full rounded-md p-4"
                onClick={async () => {
                  setIsOnNextLoading(true);
                  props.onNext();
                  setIsOnNextLoading(false);
                }}
              >
                <div className="pl-2">Add new payment method</div>
              </Radio>
            </Spin>

            {props.userPaymentMethods?.map((paymentMethod, index) => (
              <Radio
                value={paymentMethod.id}
                key={index}
                className="selectable w-full rounded-md p-4"
                onClick={() => setRadioValue(paymentMethod.id)}
              >
                <div className="pl-2">
                  <PaymentMethod
                    paymentMethod={paymentMethod}
                    defaultPaymentMethod={props.userDefaultPaymentMethod}
                  />
                </div>
              </Radio>
            ))}
          </div>
        </Radio.Group>
      </div>

      {error && (
        <Fade
          direction="up"
          className="mt-3 flex w-full justify-center text-red-400"
        >
          {error}
        </Fade>
      )}

      <SimpleSlideFade
        direction="bottom-to-top"
        fadeOpacity
        slideDistance="15px"
        delay={0}
      >
        <div className="mt-4 flex items-center justify-center gap-4">
          <Button
            aria-label="Subscribe"
            disabled={radioValue === null}
            type="primary"
            htmlType="submit"
            loading={isSubscribeLoading}
            className="!flex !items-center !justify-center gap-2"
            onClick={handleSubmit}
          >
            <div>Subscribe</div>
            <AiOutlineLock />
          </Button>
        </div>
      </SimpleSlideFade>
    </>
  );
};
