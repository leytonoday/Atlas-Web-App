/**
 * Used to check if the code is running on the client side.
 * @returns Returns true if the code is running on the client side.
 */
export function isOnClient(): boolean {
  return typeof window !== "undefined";
}
