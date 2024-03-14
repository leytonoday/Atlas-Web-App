import { services } from "@/services";
import { useStore } from "@/store";
import { IServerResponse } from "@/types";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

/**
 * This hook fetches the user's information from the server and stores it in the store.
 */
export const useWhoAmI = (options?: UseQueryOptions<IServerResponse>) => {
  const store = useStore();

  useQuery({
    queryFn: async () => {
      const isAuthenticated =
        await services.api.authentication.isAuthenticated();
      if (!isAuthenticated.data) {
        return isAuthenticated;
      }

      const result = await services.api.authentication.whoAmI();
      store.setWhoAmI(result.data);
      return result;
    },
    queryKey: ["whoAmI"],
    refetchOnWindowFocus: false,
    retry: 3, // Don't retry failed requests
    ...options,
  });
};
