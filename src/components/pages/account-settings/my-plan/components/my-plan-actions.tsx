import { IStripeSubscription } from "@/types";
import { Button } from "antd";

interface IMyPlanActionsProps {
  /**
   * The subscription that is being displayed.
   */
  mySubscription?: IStripeSubscription;

  /**
   * Determines if the subscription is loading.
   */
  isLoading: boolean;

  /**
   * Opens the update plan details drawer.
   */
  setUpdatePlanDetailsDrawerOpen: (open: boolean) => void;

  /**
   * Shows the cancel subscription confirm modal.
   */
  showCancelSubscriptionConfirm: () => void;

  /**
   * Shows the reactivate subscription confirm modal.
   */
  showReactivateSubscriptionConfirm: () => void;
}

/**
 * Used to display the actions that can be taken on the My Plan component, such as cancelling a plan, or updating the plan details.
 */
export const MyPlanActions = (props: IMyPlanActionsProps) => (
  <div className="flex w-full flex-row justify-end gap-4">
    <Button
      danger={props.mySubscription?.cancelAtPeriodEnd == false}
      type={props.mySubscription?.cancelAtPeriodEnd ? "primary" : "default"}
      disabled={props.isLoading}
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
      disabled={props.isLoading || props.mySubscription?.cancelAtPeriodEnd}
      type="primary"
      onClick={() => props.setUpdatePlanDetailsDrawerOpen(true)}
      aria-label="Update Plan details"
    >
      Update Plan details
    </Button>
  </div>
);
