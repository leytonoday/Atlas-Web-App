/**
 * Used to capitalize the first letter of a string.
 * @param string The string to capitalize the first letter of.
 * @returns The string with the first letter capitalized.
 */
export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
