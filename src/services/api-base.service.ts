/**
 * Represents the base service, which all services that make API requests should implement.
 * Other non-API services should not implement this interface.
 */
export interface IApiBaseService {
  /**
   * The common base URL for all API requests within the service.
   */
  baseUrl: string;
}
