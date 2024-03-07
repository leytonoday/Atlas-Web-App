import { IStripePaymentMethod } from "@/types";
import { Spin } from "antd";
import clsx from "clsx";
import { SimpleTooltip } from "./simple-tooltip";
import Image from "next/image";
import { BsAsterisk } from "react-icons/bs";
import { DefaultPaymentMethodTag } from "./default-payment-method-tag";

/**
 * Used to display a row of asterisks to indicate hidden card details
 */
const AsteriskRow = () => (
  <div className="flex gap-2 text-2xs">
    <BsAsterisk />
    <BsAsterisk />
    <BsAsterisk />
    <BsAsterisk />
  </div>
);

interface IPaymentMethodProps {
  /**
   * The payment method to display
   */
  paymentMethod?: IStripePaymentMethod;

  /**
   * The user's default payment method
   */
  defaultPaymentMethod?: IStripePaymentMethod;
}

/**
 * Displays a payment method
 */
export const PaymentMethod = (props: IPaymentMethodProps) => {
  if (!props.paymentMethod) {
    return (
      <div className="flex justify-center">
        <Spin />
      </div>
    );
  }

  const card = props.paymentMethod.card;

  return (
    <div className="flex items-center gap-4 text-xs">
      {/* The card icon */}
      <div className={clsx("flex")}>
        <SimpleTooltip text={card.brand}>
          <Image
            alt={`${card.brand} card logo`}
            src={`/card-logos/${props.paymentMethod?.card.brand}.png`}
            height={50}
            width={50}
            className="h-auto w-8 md:w-12"
          />
        </SimpleTooltip>
      </div>

      {/* Card details */}
      <div className="flex flex-1 flex-col">
        {/* Card number */}
        <div className="flex w-full items-center justify-start gap-3 font-semibold">
          <AsteriskRow />
          <div>{card.last4}</div>
          {props.paymentMethod.id === props.defaultPaymentMethod?.id ? (
            <DefaultPaymentMethodTag />
          ) : null}
        </div>

        <div className={clsx("opacity-75")}>
          Expires {card.expMonth}/{card.expYear.toString().substring(2, 4)}
        </div>
      </div>
    </div>
  );
};
