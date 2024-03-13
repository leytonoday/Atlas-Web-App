import { useApiQuery, useIsMobileScreen, useLoadingCombinator } from "@/hooks";
import { services } from "@/services";
import {
  IPlan,
  IStripeInvoice,
  IStripePaymentMethod,
  IStripeSubscription,
  NotificationStatus,
  StripeSubscriptionStatus,
} from "@/types";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import dateFormat from "dateformat";
import { handleApiRequestError } from "@/utils";
import { Card, Divider, Modal, Spin } from "antd";
import {
  DynamicIcon,
  FormattedPrice,
  PaymentMethod,
  SimpleHead,
} from "@/components/common";
import { MyPlanStatusTag } from "./components/my-plan-status-tag";
import { MyPlanNotSubscribed } from "./components/my-plan-not-subscribed";
import { MyPlanPastDue } from "./components/my-plan-past-due";
import { MyPlanActions } from "./components/my-plan-actions";
import { UpdatePlanDetailsDrawer } from "./components/update-plan-details-drawer";
import { useStore } from "@/store";

const { confirm } = Modal;

interface IMyPlanProps {
  /**
   * The user's payment methods.
   */
  paymentMethods?: IStripePaymentMethod[];

  /**
   * The user's default payment method.
   */
  defaultPaymentMethod?: IStripePaymentMethod;

  /**
   * Determines if the user's payment methods are loading.
   */
  isLoading: boolean;
}

export const MyPlan = (props: IMyPlanProps) => {
  const store = useStore();
  const isMobileScreen = useIsMobileScreen();

  const [subscriptionPaymentMethod, setSubscriptionPaymentMethod] = useState<
    IStripePaymentMethod | undefined
  >(undefined);

  const [updatePlanDetailsDrawerOpen, setUpdatePlanDetailsDrawerOpen] =
    useState(false);

  // Get my upcoming invoice
  const {
    isLoading: isMyUpcomingInvoiceLoading,
    data: myUpcomingInvoice,
    refetch: refetchMyUpcomingInvoice,
  } = useApiQuery<IStripeInvoice>({
    queryKey: ["myUpcomingInvoice"],
    queryFn: () => services.api.stripe.getMyUpcomingInvoice(),
    enabled: false,
  });

  // Get my subscription
  const {
    isLoading: isMySubscriptionLoading,
    isFetching: isMySubscriptionFetching,
    data: mySubscription,
    refetch: refetchMySubscription,
  } = useApiQuery<IStripeSubscription>({
    queryKey: ["mySubscription"],
    queryFn: () => services.api.stripe.getMySubscription(),
  });

  // Get my plan
  const {
    isLoading: isMyPlanLoading,
    isFetching: isMyPlanFetching,
    data: myPlan,
    refetch: refetchMyPlan,
  } = useApiQuery<IPlan>({
    queryKey: ["myPlan"],
    queryFn: () => services.api.plan.getMyPlan(),
  });

  const isLoading = useLoadingCombinator(
    props.isLoading,
    isMySubscriptionLoading,
    isMySubscriptionFetching,
    isMyPlanFetching,
    isMyPlanLoading,
    {
      // Only include this in the loading combinator if the user's subscription is not cancelled.
      loading: isMyUpcomingInvoiceLoading,
      enabled: mySubscription?.cancelAtPeriodEnd === false,
    },
  );

  // Reactivate subscription
  const { mutateAsync: reactivateMySubscription } = useMutation({
    mutationFn: () => services.api.stripe.reactivateMySubscription(),
    onSuccess: () => {
      refetchMySubscription();
    },
  });

  // Cancel subscription at the end of the current billing period
  const { mutateAsync: cancelMySubscription } = useMutation({
    mutationFn: () => services.api.stripe.cancelMySubscription(),
    onSuccess: () => {
      refetchMySubscription();
    },
  });

  // Cancel subscription immediately
  const { mutateAsync: cancelMySubscriptionImmediately } = useMutation({
    mutationFn: () => services.api.stripe.cancelMySubscriptionImmediately(),
    onSuccess: async () => {
      refetchMySubscription();
      await refetchMyPlanUntilChanged();
    },
  });

  /**
   * Will repeatedly fetch the user's plan until it changes. Need to do this because the plan updates come from Stripe Webhooks, and so
   * it's entirely asynchronous. We don't know when the plan will be updated, so we need to keep polling until it changes.
   */
  const refetchMyPlanUntilChanged = () =>
    new Promise(async (resolve) => {
      const initial = structuredClone(mySubscription);
      let failCount = 0;

      const interval = setInterval(async () => {
        try {
          const { data: newPlan } = await refetchMyPlan();

          // If the plan has changed, then stop and resolve.
          if (JSON.stringify(initial) !== JSON.stringify(newPlan)) {
            clearInterval(interval);
            resolve(newPlan);
          }
        } catch (error) {
          handleApiRequestError(error);
          failCount++;

          // If the request fails 5 times, then we're gonna stop trying. Let the user know that they can refresh the page in a minute or two.
          if (failCount > 5) {
            clearInterval(interval);
            resolve(initial);

            store.notification.enqueue({
              status: NotificationStatus.Error,
              description:
                "Failed to fetch updated plan. Please refresh the page in a minute or two.",
            });
          }
        }
      }, 1000);
    });

  // Gets the payment method that is used on the user's subscription.
  useEffect(() => {
    if (mySubscription && mySubscription?.defaultPaymentMethodId) {
      // If the subscription has a default payment method directly on it, then use that.
      const defaultPaymentMethod =
        props.paymentMethods?.find(
          (x) => x.id === mySubscription!.defaultPaymentMethodId,
        ) || undefined;
      setSubscriptionPaymentMethod(defaultPaymentMethod);
    }
    // If the subscription doesn't have a default payment method directly on it, then use the users default payment method that
    // is configured on thier invoice_settings
    else {
      setSubscriptionPaymentMethod(props.defaultPaymentMethod);
    }
  }, [mySubscription, props.paymentMethods, props.defaultPaymentMethod]);

  useEffect(() => {
    if (mySubscription?.cancelAtPeriodEnd === false) {
      refetchMyUpcomingInvoice();
    }
  }, [mySubscription]);

  /**
   * Returns the current period end date in the format dd/mm/yyyy.
   */
  const currentPeriodEnd = useMemo(
    () => dateFormat(mySubscription?.currentPeriodEnd, "dd/mm/yyyy"),
    [mySubscription?.currentPeriodEnd],
  );

  /**
   * Shows the cancel subscription confirmation modal.
   */
  const showCancelSubscriptionConfirm = useCallback(() => {
    confirm({
      title: "Are you sure you want to cancel your subscription?",
      width: "50em",
      content: (
        <div>
          We're sorry to see you go! Before you proceed, please take a moment to
          review the following:
          <br />
          <br />
          <ul>
            <li>You will no longer be billed for your subscription.</li>
            {mySubscription?.status === StripeSubscriptionStatus.Trialing ||
            mySubscription?.status === StripeSubscriptionStatus.PastDue ? (
              <>
                <li>Your access to Atlas will end immediately.</li>
              </>
            ) : (
              <>
                <li>
                  You will continue to have full access to Atlas until{" "}
                  <span className="font-semibold">{currentPeriodEnd}</span>,
                  which is the end of your current billing period.
                </li>
                <li>
                  If you change your mind before{" "}
                  <span className="font-semibold">{currentPeriodEnd}</span>, you
                  can still continue using Atlas as usual.
                </li>
                <li>
                  Please note that any unused portion of the current billing
                  period cannot be refunded.
                </li>
              </>
            )}
          </ul>
        </div>
      ),
      async onOk() {
        try {
          // If the user's subscription is past due, then we're gonna cancel it immediately.
          if (
            mySubscription?.status === StripeSubscriptionStatus.PastDue ||
            mySubscription?.status === StripeSubscriptionStatus.Trialing
          ) {
            await cancelMySubscriptionImmediately();
          }
          // Otherwise, we're gonna cancel it at the end of the current billing period.
          else {
            await cancelMySubscription();
          }
        } catch (error) {
          handleApiRequestError(error);
        }
      },
      okButtonProps: {
        danger: true,
      },
      okText: "Cancel subscription",
    });
  }, [currentPeriodEnd, mySubscription?.status]);

  /**
   * Shows the reactivate subscription confirmation modal.
   */
  const showReactivateSubscriptionConfirm = useCallback(() => {
    confirm({
      title: "Welcome back to Atlas!",
      width: "50em",
      content: (
        <div>
          We're excited to have you continue your subscription. Here's what you
          need to know:
          <br />
          <br />
          <ul>
            <li>
              Your access to Atlas will remain uninterrupted, and you can
              continue using the service as before.
            </li>
            <li>
              Your subscription will automatically resume it's regular billing
              cycle.
            </li>
          </ul>
        </div>
      ),
      async onOk() {
        try {
          await reactivateMySubscription();
        } catch (error) {
          handleApiRequestError(error);
        }
      },
      okText: "Reactivate subscription",
    });
  }, []);

  /* Past Due. User hasn't paid */
  if (mySubscription?.status === StripeSubscriptionStatus.PastDue)
    return (
      <>
        <SimpleHead title="Manage Subscription" />
        <MyPlanPastDue
          showCancelSubscriptionConfirm={showCancelSubscriptionConfirm}
          showReactivateSubscriptionConfirm={showReactivateSubscriptionConfirm}
          mySubscription={mySubscription}
        />
      </>
    );

  /* No Plan */
  if (!isMyPlanLoading && !myPlan) {
    return (
      <>
        <SimpleHead title="Manage Subscription" />
        <MyPlanNotSubscribed />
      </>
    );
  }

  return (
    <>
      <SimpleHead title="Manage Subscription" />
      <div className="flex w-full flex-col gap-4">
        {/* My Plan */}
        <Card
          size={isMobileScreen ? "small" : "default"}
          style={{ width: "100%" }}
          title={
            <div className="flex justify-between">
              <div className="font-semibold">My Subscription Plan</div>
              <MyPlanStatusTag
                mySubscription={mySubscription}
                isLoading={isMySubscriptionLoading}
              />
            </div>
          }
        >
          <Spin spinning={isLoading}>
            <div className="flex flex-col items-start justify-between">
              {/* Plan information */}
              <div>
                {/* Icon, name and description */}
                <div className="flex gap-4">
                  <div className="flex items-center text-3xl">
                    {myPlan && <DynamicIcon iconName={myPlan!.icon} />}
                  </div>

                  <div className="flex flex-col">
                    <div className="text-lg font-semibold">{myPlan?.name}</div>
                    <div className="text-gray-400">{myPlan?.description}</div>
                  </div>
                </div>

                {/* Date subscribed */}
                <div className="mt-2">
                  <span>You're a Atlas {myPlan?.name} user, since</span>{" "}
                  {dateFormat(mySubscription?.created, "dd/mm/yyyy")}.
                </div>
              </div>

              <Divider className="my-4 md:my-6" />

              {/* Next payment information */}
              <div className="flex w-full flex-col justify-between gap-4 lg:flex-row">
                <div className="text-xs">
                  <PaymentMethod paymentMethod={subscriptionPaymentMethod} />
                </div>

                <div className="flex flex-row items-start justify-start gap-1 lg:flex-col">
                  {mySubscription?.cancelAtPeriodEnd ? (
                    <span>Active until</span>
                  ) : (
                    <span>Next payment on</span>
                  )}
                  <span className="font-semibold">{currentPeriodEnd}</span>
                </div>

                {myUpcomingInvoice &&
                  myPlan &&
                  !mySubscription?.cancelAtPeriodEnd && (
                    <div>
                      <span>Amount due: </span>
                      <span className="font-semibold">
                        <FormattedPrice
                          currency={myPlan?.isoCurrencyCode}
                          amount={myUpcomingInvoice?.amountDue}
                        />
                      </span>
                    </div>
                  )}
              </div>
            </div>
          </Spin>
        </Card>

        {/* Buttons */}
        <MyPlanActions
          setUpdatePlanDetailsDrawerOpen={setUpdatePlanDetailsDrawerOpen}
          showCancelSubscriptionConfirm={showCancelSubscriptionConfirm}
          showReactivateSubscriptionConfirm={showReactivateSubscriptionConfirm}
          mySubscription={mySubscription}
          isLoading={isMySubscriptionLoading}
        />

        {/* Update Plan Details Drawer */}
        <UpdatePlanDetailsDrawer
          isOpen={updatePlanDetailsDrawerOpen}
          onClose={() => setUpdatePlanDetailsDrawerOpen(false)}
          plan={myPlan}
          subscription={mySubscription!}
          paymentMethod={subscriptionPaymentMethod!}
          paymentMethods={props.paymentMethods}
          reload={() => {
            refetchMyPlan();
            refetchMySubscription();
          }}
          defaultPaymentMethod={props.defaultPaymentMethod}
        />
      </div>
    </>
  );
};
