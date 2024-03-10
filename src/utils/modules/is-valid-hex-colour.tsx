/**
 * Used to get the distinct values from an array of objects.
 * @param hex The hex colour to check.
 * @returns Whether the hex colour is valid.
 */
export function isValidHexColour(hex: string): boolean {
  return /^#([0-9A-F]{3}){1,2}$/i.test(hex);
}
