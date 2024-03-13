import { IStripeSubscription, StripeSubscriptionStatus } from "@/types";
import { capitalizeFirstLetter } from "@/utils";
import { Tag, Spin } from "antd";
import { useCallback } from "react";

interface IMyPlanStatusTagProps {
  mySubscription?: IStripeSubscription;
  isLoading: boolean;
}

/**
 * Used to display the status of the user's subscription.
 */
export const MyPlanStatusTag = (props: IMyPlanStatusTagProps) => {
  /**
   * Returns the status colour for the given subscription status.
   */
  const getStatusColour = useCallback(() => {
    switch (props.mySubscription?.status) {
      case StripeSubscriptionStatus.Active:
        return "green";
      case StripeSubscriptionStatus.Trialing:
        return "blue";
      case StripeSubscriptionStatus.PastDue:
        return "red";
      case StripeSubscriptionStatus.Canceled:
        return "red";
    }
  }, [props.mySubscription?.status]);

  /**
   * Returns the number of days left in the trial.
   */
  const getDaysLeftInTrial = useCallback(() => {
    if (
      !props.mySubscription ||
      !props.mySubscription.trialEnd ||
      !props.mySubscription.trialStart
    )
      return "";

    const end = new Date(props.mySubscription.trialEnd);
    const start = new Date(props.mySubscription.trialStart);

    const daysLeft = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 3600 * 24),
    );

    if (daysLeft === 0) return "Ends today";
    else if (daysLeft === 1) return "Ends tomorrow";
    else return `Trial ends in ${daysLeft} days`;
  }, [props.mySubscription?.currentPeriodEnd]);

  if (props.isLoading) <Spin />;

  return (
    <Tag color={getStatusColour()}>
      {capitalizeFirstLetter(
        props.mySubscription?.status.replaceAll("_", " ") || "",
      )}
      {props.mySubscription?.status === StripeSubscriptionStatus.Trialing ? (
        <span>{` - ${getDaysLeftInTrial()}`}</span>
      ) : null}
    </Tag>
  );
};
