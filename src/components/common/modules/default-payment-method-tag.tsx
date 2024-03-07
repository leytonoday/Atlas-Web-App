import { Tag } from "antd";
import { IconPopover } from "./icon-popover";

/**
 * Displays a tag indicating that the payment method is the user's default payment method
 */
export const DefaultPaymentMethodTag = () => {
  return (
    <Tag color="green" className="!flex !flex-row gap-2">
      <span>Default</span>
      <div className="text-lg">
        <IconPopover
          content="This payment method is automatically suggested when purchasing or changing your Plan.
            It is not necessarily the payment method used for your Subscription."
          status="info"
        />
      </div>
    </Tag>
  );
};
