import { PaymentMethod } from "@/components/common";
import { useApiQuery, useIsMobileScreen } from "@/hooks";
import { services } from "@/services";
import { IStripePaymentMethod } from "@/types";
import { Button, Card, Divider, Result, Spin } from "antd";

export interface IPaymentMethodsProps {
  /**
   * The user's default payment method
   */
  defaultPaymentMethod?: IStripePaymentMethod;

  /**
   * The user's payment methods
   */
  paymentMethods?: IStripePaymentMethod[];

  /**
   * Determines if the payment methods are loading
   */
  isLoading: boolean;
}

/**
 * Displays a list of the users payment methods
 */
export const PaymentMethods = (props: IPaymentMethodsProps) => {
  const isMobileScreen = useIsMobileScreen();

  // Gets a link to the stripe customer portal, to allow for the user to manage their payment methods
  const {
    refetch: goToCustomerPortalLink,
    isFetching: isCustomerPortalLinkFetching,
  } = useApiQuery<string>({
    queryKey: ["customerPortalLink-PaymentMethods"],
    queryFn: () => services.api.stripe.getCustomerPortalLink(),
    enabled: false,
    onSuccess: (serverResponse) => {
      window.location.href = serverResponse.data;
    },
  });

  // No Plan
  if (props.paymentMethods === undefined || props.paymentMethods?.length === 0)
    return (
      <>
        {props.isLoading ? (
          <div className="flex w-full justify-center">
            <Spin />
          </div>
        ) : (
          <Result
            title="No payment methods"
            subTitle="You haven't added any payment methods yet."
            status="info"
            extra={
              <Button
                type="primary"
                onClick={() => goToCustomerPortalLink()}
                aria-label="Add payment method"
              >
                Add payment method
              </Button>
            }
          />
        )}
      </>
    );

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Payment Methods */}
      <Card
        size={isMobileScreen ? "small" : "default"}
        bodyStyle={{ overflowY: "auto", maxHeight: "30em" }}
        title={"Payment Methods"}
      >
        <Spin spinning={props.isLoading}>
          {props.paymentMethods?.map((paymentMethod, index) => (
            <div key={index}>
              <PaymentMethod
                paymentMethod={paymentMethod}
                defaultPaymentMethod={props.defaultPaymentMethod}
              />
              {index !== props.paymentMethods!.length - 1 ? <Divider /> : null}
            </div>
          ))}
        </Spin>
      </Card>

      {/* Buttons */}
      <div className="flex justify-end">
        <Button
          type="primary"
          loading={isCustomerPortalLinkFetching}
          onClick={() => goToCustomerPortalLink()}
          aria-label="Manage payment methods"
        >
          Manage payment methods
        </Button>
      </div>
    </div>
  );
};
