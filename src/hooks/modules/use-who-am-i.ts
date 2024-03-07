import { services } from "@/services";
import { useStore } from "@/store";
import { IServerResponse } from "@/types";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useRouter } from "next/router";

/**
 * This hook fetches the user's information from the server and stores it in the store.
 */
export const useWhoAmI = (options?: UseQueryOptions<IServerResponse>) => {
  const store = useStore();
  const router = useRouter();

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
    enabled: router.pathname !== "/sign-out",
    queryKey: ["whoAmI"],
    refetchOnWindowFocus: false,
    retry: 3, // Don't retry failed requests
    ...options,
  });
};
