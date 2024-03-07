import { IServerResponse } from "@/types";
import { handleApiRequestError } from "@/utils";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

/**
 * A wrapper around @tanstack/react-query's useQuery hook that sets some default options
 * and destructures the data property from the response for immediate use.
 */
export const useApiQuery = <TData = any>(
  options: UseQueryOptions<IServerResponse>,
) => {
  const query = useQuery<IServerResponse, any>({
    onError: (error: any) => handleApiRequestError(error),
    refetchOnWindowFocus: false, // Prevents unnecessary refetches when the user switches back to the tab
    retry: 0, // Don't retry failed requests
    ...options,
  });

  return {
    ...query,
    data: query.data?.data as TData | undefined,
  };
};
