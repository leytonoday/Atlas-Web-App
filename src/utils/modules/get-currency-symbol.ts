import { getAllISOCodes } from "iso-country-currency";

/**
 * Returns the currency symbol for a given ISO code.
 * @param isoCode The ISO code to get the currency symbol for.
 * @returns The currency symbol for the given ISO code.
 */
export const getCurrencySymbol = (isoCode: string) =>
  getAllISOCodes().find((x) => x.currency === isoCode)?.symbol || "Unknown";
