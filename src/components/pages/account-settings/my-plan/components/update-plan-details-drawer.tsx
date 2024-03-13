import { useIsMobileScreen } from "@/hooks";
import { IPlan, IStripePaymentMethod, IStripeSubscription } from "@/types";
import { Button, Divider, Drawer, Spin } from "antd";
import { useState } from "react";
import Link from "next/link";
import { PaymentMethod, SubscriptionCard } from "@/components/common";
import { ChangePaymentMethodDrawer } from "./change-payment-method-drawer";

export interface IUpdatePlanDetailsDrawerProps {
  /**
   * Determines if the drawer is open or not.
   */
  isOpen: boolean;

  /**
   * Callback to close the drawer.
   */
  onClose: () => void;

  /**
   * The plan to display.
   */
  plan?: IPlan;

  /**
   * The subscription to display.
   */
  subscription: IStripeSubscription;

  /**
   * The payment method used for the subscription.
   */
  paymentMethod?: IStripePaymentMethod;

  /**
   * All the payment methods for the user.
   */
  paymentMethods?: IStripePaymentMethod[];

  /**
   * The user's default payment method.
   */
  defaultPaymentMethod?: IStripePaymentMethod;

  /**
   * Reloads the data on the page.
   */
  reload: () => void;
}

/**
 * Presents the user with options to update their plan, or it's payment method.
 */
export const UpdatePlanDetailsDrawer = (
  props: IUpdatePlanDetailsDrawerProps,
) => {
  const isMobileScreen = useIsMobileScreen();

  const [isChangePaymentMethodDrawerOpen, setIsChangePaymentMethodDrawerOpen] =
    useState(false);

  return (
    <Drawer
      title="Update Plan Details"
      placement="right"
      open={props.isOpen}
      onClose={() => props.onClose()}
      width={isMobileScreen ? "90%" : "50%"}
    >
      <div className="flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
        {props.plan ? (
          <SubscriptionCard
            plan={props.plan}
            interval={props.subscription?.items[0].plan.interval as any}
            title="Subscription to"
          />
        ) : (
          <div className="flex w-full justify-center">
            <Spin />
          </div>
        )}
        <Link href="/product/plans">
          <Button aria-label="Change Plan">Change Plan</Button>
        </Link>
      </div>

      <Divider />

      <div className="flex flex-col items-center justify-between gap-4 p-0 md:flex-row md:px-4">
        <PaymentMethod paymentMethod={props.paymentMethod} />

        <Button
          onClick={() => setIsChangePaymentMethodDrawerOpen(true)}
          aria-label="Change payment method"
        >
          Change payment method
        </Button>
      </div>

      <ChangePaymentMethodDrawer
        isOpen={isChangePaymentMethodDrawerOpen}
        onClose={() => setIsChangePaymentMethodDrawerOpen(false)}
        paymentMethod={props.paymentMethod}
        paymentMethods={props.paymentMethods}
        reload={props.reload}
        defaultPaymentMethod={props.defaultPaymentMethod}
      />
    </Drawer>
  );
};
