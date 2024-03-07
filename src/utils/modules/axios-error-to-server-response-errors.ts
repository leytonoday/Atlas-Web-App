import { AxiosError } from "axios";
import { IServerResponse, IServerResponseError } from "@/types";

/**
 * Takes an AxiosError and returns the errors from the server response.
 * @param error The AxiosError to get the errors from.
 * @returns An array of errors from the server response.
 */
export function axiosErrorToServerResponseErrors(
  error: AxiosError,
): IServerResponseError[] {
  const response = error.response?.data as IServerResponse;
  return response.errors || [];
}
