import {
  IPlan,
  PricingMode,
  StripeSubscriptionStatus,
  UserRole,
} from "@/types";
import { Button, Tag, theme } from "antd";
import { useStore } from "@/store";
import { SECONDARY_COLOUR, TEXT_COLOUR } from "@/data";
import { formatNumberWithCommas, getCurrencySymbol } from "@/utils";
import { useCallback } from "react";
import clsx from "clsx";
import { DynamicIcon } from "./dynamic-icon";
import TextTransition, { presets } from "react-text-transition";
import Link from "next/link";
import { AiOutlineCheck } from "react-icons/ai";

interface IPlanCardProps {
  /**
   * The plan to display the details of.
   */
  plan: IPlan;

  /**
   * The plan that this plan is a child of.
   */
  parentPlan?: IPlan;

  /**
   * The pricing mode of the plan. This determines whether the price is displayed as a monthly or yearly price.
   */
  pricingMode: PricingMode;

  /**
   * Determines whether or not the plan is the current plan of the user.
   */
  isCurrentPlan?: boolean;

  /**
   * Determines whether or not the user is eligible for a trial. If the user is not authenticated, this will be null.
   */
  amIEligibleForTrial: boolean | null;

  /**
   * The status of the user's subscription to the plan.
   */
  mySubscriptionStatus?: StripeSubscriptionStatus | null;

  /**
   * Indicates whether the card's button should be disabled.
   */
  disabledButton?: boolean;
}

export const PlanCard = (props: IPlanCardProps) => {
  const store = useStore();
  const { token } = theme.useToken();

  const iconColour = props.plan.iconColour || token.colorPrimary;
  const textColour = props.plan.textColour || TEXT_COLOUR;

  const backgroundColour = props.plan.backgroundColour || SECONDARY_COLOUR;

  const price =
    props.pricingMode === PricingMode.Month
      ? props.plan.monthlyPrice
      : props.plan.annualPrice;

  const priceLabel =
    props.pricingMode === PricingMode.Month ? "per month" : "per year";

  /**
   * Gets the text to display on the button.
   */
  const getButtonLabel = () => {
    if (store.whoAmI) {
      if (props.plan.trialPeriodDays === 0) {
        return `Select ${props.plan.name} Plan`;
      }

      if (props.amIEligibleForTrial) {
        return `Start ${props.plan.trialPeriodDays}-day Free Trial`;
      } else {
        return `Select ${props.plan.name} Plan`;
      }
    } else
      return props.plan.trialPeriodDays === 0
        ? "Get Started"
        : `Start ${props.plan.trialPeriodDays}-day Free Trial`;
  };

  /**
   * If the feature value is a number, then format it with commas. Otherwise, return the value as is.
   */
  const formatFeatureValue = (featureValue: string) => {
    const isNumber = !isNaN(Number(featureValue));
    if (isNumber) {
      return formatNumberWithCommas(Number(featureValue));
    } else {
      return featureValue;
    }
  };

  /**
   * Gets the link to redirect the user to when they click on the button.
   */
  const getButtonLink = useCallback(() => {
    // Not authenticated, so redirect to sign in page
    if (!store.whoAmI) {
      return "/auth/sign-in";
    }

    // User is an admin, so redirect to admin plans page
    if (store.whoAmI.roles.includes(UserRole.Administrator)) {
      return "/admin/plans";
    }

    // Is on a plan already, or if their planId has been revoked because of an overdue payment
    if (
      store.whoAmI.planId !== undefined ||
      props.mySubscriptionStatus === "past_due"
    ) {
      // User clicked on their current plan
      if (props.isCurrentPlan) {
        return "/account-settings/manage-subscription";
      }
    }

    return `/product/checkout?planId=${
      props.plan.id
    }&interval=${props.pricingMode.toString()}`;
  }, [store.whoAmI, props.pricingMode, props.isCurrentPlan]);

  /**
   * Returns the labels of the features that are included in the plan
   */
  const getPlanFeatureLabels = () => {
    if (!props.plan.features || !props.plan.planFeatures) {
      return [];
    }

    let planFeatureLabels: string[] = [];

    for (let i = 0; i < props.plan.features.length; i++) {
      const feature = props.plan.features[i];
      if (feature.isHidden) {
        continue;
      }

      const planFeature = props.plan.planFeatures.find(
        (x) => x.featureId === feature.id,
      );

      if (planFeature?.value) {
        planFeatureLabels.push(
          `${feature.name}: ${formatFeatureValue(planFeature.value)}`,
        );
      } else {
        planFeatureLabels.push(feature.name);
      }
    }

    return planFeatureLabels.sort();
  };

  return (
    <div
      className={clsx("w-11/12 md:w-[20rem]", {
        archived: !props.plan.active,
      })}
    >
      <div
        className="w-full rounded-lg p-6"
        style={{
          background: backgroundColour,
          color: textColour,
        }}
      >
        {/* Current Plan Tag */}
        <div className="relative">
          <div className="absolute right-0 top-0 flex flex-col items-end gap-2 text-xs">
            {props.plan.tag && <Tag color="blue">{props.plan.tag}</Tag>}
            {props.isCurrentPlan && <Tag color="green">Current Plan</Tag>}
          </div>
        </div>

        {/* Icon and name */}
        <span className="font-semibold text-2xl">{props.plan.name}</span>

        {/* Subtitle */}
        <div className="mt-1 flex text-sm opacity-75">
          {props.plan.description}
        </div>

        <br />

        {/* Price */}
        <div className="flex gap-2">
          <div className="text-5xl opacity-75">
            {getCurrencySymbol(props.plan.isoCurrencyCode)}
          </div>
          <TextTransition springConfig={presets.default}>
            <div className="flex flex-row">
              <div className="flex items-end text-5xl">
                {(price / 100).toFixed(2)}
              </div>
            </div>
          </TextTransition>
          <div className="flex-1 flex items-center justify-end mr-4 text-5xl">
            <DynamicIcon
              iconName={props.plan.icon}
              iconColour={props.plan.iconColour}
            />
          </div>
        </div>
        <div className="flex items-end text-md opacity-75">{priceLabel}</div>

        {/* Get Started Button */}
        <Link
          href={getButtonLink()}
          className="mt-6 flex w-full justify-center no-underline"
        >
          <Button
            disabled={props.disabledButton}
            size="large"
            className="w-11/12"
            aria-label={props.isCurrentPlan ? "Current Plan" : getButtonLabel()}
            type={props.plan.backgroundColour ? "default" : "primary"}
          >
            {props.isCurrentPlan ? <div>Current Plan</div> : getButtonLabel()}
          </Button>
        </Link>

        {/* Features */}
        <br />
        <div className="font-semibold">
          {props.parentPlan
            ? `Everything in ${props.parentPlan.name}, plus:`
            : "Features:"}
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {getPlanFeatureLabels().map((featureLabel) => (
            <div key={featureLabel} className="flex items-center gap-4">
              <AiOutlineCheck
                style={{ color: iconColour }}
                className="text-lg"
              />
              <span>{featureLabel}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
