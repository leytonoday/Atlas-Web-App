import { IStripeSubscription } from "@/types";
import { Button, Result } from "antd";
import { useApiQuery } from "@/hooks";
import { services } from "@/services";

interface IMyPlanPastDueProps {
  /**
   * The user's subscription.
   */
  mySubscription?: IStripeSubscription;

  /**
   * Shows the subscription cancellation modal.
   */
  showCancelSubscriptionConfirm: () => void;

  /**
   * Shows the subscription re-activation modal.
   */
  showReactivateSubscriptionConfirm: () => void;
}

/**
 * Used to display a message to the user when their subscription is past due.
 */
export const MyPlanPastDue = (props: IMyPlanPastDueProps) => {
  // Gets a link to the stripe customer portal, to allow for the user to manage their payment methods
  const {
    refetch: goToCustomerPortalLink,
    isFetching: isCustomerPortalLinkFetching,
  } = useApiQuery<string>({
    queryKey: ["getCustomerPortalLink-MyPlanPastDue"],
    queryFn: () => services.api.stripe.getCustomerPortalLink(),
    enabled: false,
    onSuccess: (serverResponse) => {
      window.location.href = serverResponse.data;
    },
  });

  return (
    <Result
      title="Past Due"
      subTitle="Payment for your subscription is past due. Please update your payment method to continue using Legal Lighthouse."
      status="error"
      extra={
        <div className="flex justify-center gap-4">
          <Button
            danger={props.mySubscription?.cancelAtPeriodEnd == false}
            type={
              props.mySubscription?.cancelAtPeriodEnd ? "primary" : "default"
            }
            disabled={isCustomerPortalLinkFetching}
            onClick={() => {
              if (props.mySubscription?.cancelAtPeriodEnd) {
                props.showReactivateSubscriptionConfirm();
              } else {
                props.showCancelSubscriptionConfirm();
              }
            }}
            aria-label={
              props.mySubscription?.cancelAtPeriodEnd
                ? "Reactivate subscription"
                : "Cancel subscription"
            }
          >
            {props.mySubscription?.cancelAtPeriodEnd
              ? "Reactivate subscription"
              : "Cancel subscription"}
          </Button>

          <Button
            type="primary"
            onClick={() => goToCustomerPortalLink()}
            loading={isCustomerPortalLinkFetching}
            aria-label="Update payment method"
          >
            Update payment method
          </Button>
        </div>
      }
    />
  );
};
