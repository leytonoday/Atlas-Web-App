import {
  IServerResponse,
  IServerResponseError,
  NotificationStatus,
} from "@/types";
import { AxiosError } from "axios";
import { useStore } from "@/store";

/**
 * Determines if an object is an IServerResponse
 * @param object The object to check if it is an IServerResponse
 * @returns True if the object is an IServerResponse, false otherwise
 */
export function isIServerResponse(object: any): object is IServerResponse {
  return (
    typeof object === "object" && "errors" in object && "statusCode" in object
  );
}

/**
 * Handles an API error, showing an error notification.
 * @param e The error.
 */
export const handleApiRequestError = (error: any) => {
  const store = useStore.getState();

  const defaultErrorMessage = "An unknown error has occurred";

  const data = (error as AxiosError).response?.data;

  if (data && isIServerResponse(data)) {
    // An error from the API
    const response = data as IServerResponse;
    const error: IServerResponseError | undefined = response.errors?.shift();

    store.notification.enqueue({
      status: NotificationStatus.Error,
      description: error?.message || defaultErrorMessage,
    });
  } else {
    store.notification.enqueue({
      status: NotificationStatus.Error,
      description: error?.message || defaultErrorMessage,
    });
  }
};
