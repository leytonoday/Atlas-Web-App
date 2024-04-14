import { services } from "@/services";
import { useStore } from "@/store";
import { IServerResponse } from "@/types";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

/**
 * This hook fetches the user's credit tracker information from the server and stores it in the store.
 */
export const useCreditTracker = (
  options?: UseQueryOptions<IServerResponse>,
) => {
  const store = useStore();

  useQuery({
    queryFn: async () => {
      const creditTracker = await services.api.creditTracker.getCreditTracker();
      if (creditTracker.data) {
        store.setCreditTracker(creditTracker.data);
      }
      return creditTracker;
    },
    queryKey: ["creditTracker"],
    enabled: store.whoAmI !== undefined, // Only fetch if the user is logged in
    refetchOnWindowFocus: true,
    retry: 3, // Don't retry failed requests
    ...options,
  });
};
