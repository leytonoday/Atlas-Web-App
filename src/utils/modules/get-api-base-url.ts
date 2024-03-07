import { PROD_API_BASE_URL, DEV_API_BASE_URL } from "@/data";

/**
 * Gets the base URL for the API depending on the environment.
 * @returns The base URL for the API.
 */
export function getApiBaseUrl(): string {
  return process.env.NODE_ENV === "development"
    ? DEV_API_BASE_URL
    : PROD_API_BASE_URL;
}
