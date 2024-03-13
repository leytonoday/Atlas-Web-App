import { PaymentMethod } from "@/components/common";
import { useApiQuery, useIsMobileScreen } from "@/hooks";
import { services } from "@/services";
import { IStripePaymentMethod } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { Button, Drawer, Radio, Spin } from "antd";
import { useState, useEffect } from "react";

interface IChangePaymentMethodDrawerProps {
  /**
   * Determines if the drawer is open or not.
   */
  isOpen: boolean;

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
  onClose: () => void;

  /**
   * Reloads the data on the page.
   */
  reload: () => void;
}

/**
 * Used to change the payment method for a subscription.
 */
export const ChangePaymentMethodDrawer = (
  props: IChangePaymentMethodDrawerProps,
) => {
  const isMobileScreen = useIsMobileScreen();
  const [paymentMethodRadioValue, setPaymentMethodRadioValue] = useState(
    props.paymentMethod?.id,
  );

  // Gets a link to the stripe customer portal, to allow for the user to manage their payment methods
  const {
    refetch: goToCustomerPortalLink,
    isFetching: isCustomerPortalLinkFetching,
  } = useApiQuery<string>({
    queryKey: ["getCustomerPortalLink-ChangePaymentMethodDrawer"],
    queryFn: () => services.api.stripe.getCustomerPortalLink(),
    enabled: false,
    onSuccess: (serverResponse) => {
      window.location.href = serverResponse.data;
    },
  });

  const {
    mutateAsync: changeSubscriptionPaymentMethod,
    isLoading: isChangeSubscriptionPaymentMethodLoading,
  } = useMutation({
    mutationFn: () =>
      services.api.stripe.updateMySubscriptionPaymentMethod(
        paymentMethodRadioValue!,
      ),
    onSuccess: () => {
      props.reload();
      props.onClose();
    },
  });

  useEffect(() => {
    setPaymentMethodRadioValue(props.paymentMethod?.id);
  }, [props.paymentMethod?.id]);

  return (
    <Drawer
      title="Change Payment Method"
      placement="right"
      open={props.isOpen}
      onClose={() => {
        setPaymentMethodRadioValue(props.paymentMethod?.id);
        props.onClose();
      }}
      width={isMobileScreen ? "90%" : "50%"}
      footer={
        <div className="flex justify-end">
          <Button
            onClick={() => changeSubscriptionPaymentMethod()}
            type="primary"
            disabled={paymentMethodRadioValue === props.paymentMethod?.id}
            aria-label="Save payment method"
          >
            Save
          </Button>
        </div>
      }
    >
      <Spin
        spinning={
          isCustomerPortalLinkFetching ||
          isChangeSubscriptionPaymentMethodLoading
        }
      >
        <Radio.Group value={paymentMethodRadioValue} className="w-full">
          <div className="flex flex-col gap-2">
            <Radio
              value={"new-card"}
              className="selectable w-full rounded-sm p-4"
              onClick={() => goToCustomerPortalLink()}
            >
              <div className="ml-4">Add new payment method</div>
            </Radio>

            {props.paymentMethods?.map((paymentMethod, index) => (
              <Radio
                value={paymentMethod.id}
                key={index}
                className="selectable w-full rounded-sm p-4"
                onClick={() => setPaymentMethodRadioValue(paymentMethod.id)}
              >
                <div className="ml-4">
                  <PaymentMethod
                    paymentMethod={paymentMethod}
                    defaultPaymentMethod={props.defaultPaymentMethod}
                  />
                </div>
              </Radio>
            ))}
          </div>
        </Radio.Group>
      </Spin>
    </Drawer>
  );
};
