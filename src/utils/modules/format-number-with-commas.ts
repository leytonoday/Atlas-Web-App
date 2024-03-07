/**
 * Formats a number to include commas to separate thousands.
 * @param x The number to format.
 * @returns The formatted number.
 */
export function formatNumberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
