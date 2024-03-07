import { useMemo } from "react";

type UseLoadingCombinatorArg =
  | boolean
  | {
      /**
       * Whether the loading state is active.
       */
      loading: boolean;

      /**
       * Whether or not to include the loading state in the combined loading state.
       */
      enabled: boolean;
    };

/**
 * This hook is used to combine multiple loading states into one.
 * @param args An arbitrary number of loading states.
 * @returns Whether any of the loading states is true.
 */
export const useLoadingCombinator = (...args: UseLoadingCombinatorArg[]) => {
  const isLoading = useMemo(() => {
    return args.some((arg) => {
      // If the argument is a boolean, return it.
      if (typeof arg === "boolean") {
        return arg;
      }

      // If the argument is an object, return the loading state if it is enabled.
      return arg.enabled && arg.loading;
    });
  }, [args]);

  return isLoading;
};
