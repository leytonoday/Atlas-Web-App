/**
 * Sleep for a given amount of time synchronously
 * @param ms - Time to sleep in milliseconds
 * @returns Promise that resolves after the given time
 */
export function synchronousSleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
