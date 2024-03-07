import { getCurrencySymbol } from "@/utils/modules/get-currency-symbol";

interface IFormattedPriceProps {
  /**
   * A number representing the amount in cents
   */
  amount: number;

  /**
   * An ISO currency code
   */
  currency: string;
}

/**
 * Displays an amount with the correct currency symbol, and also handles negative amounts
 */
export const FormattedPrice = (props: IFormattedPriceProps) => {
  if (props.amount < 0)
    return (
      <span>{`-${getCurrencySymbol(props.currency)}${Math.abs(
        props.amount / 100,
      ).toFixed(2)}`}</span>
    );
  return (
    <span>{`${getCurrencySymbol(props.currency)}${(props.amount / 100).toFixed(
      2,
    )}`}</span>
  );
};
