import {
  IAuthenticationService,
  authenticationService,
} from "./modules/authentication-service";

/**
 * Defines services that interact with APIs.
 */
export interface IServicesApi {
  authentication: IAuthenticationService;
}

/**
 * Defines the services available to the application.
 */
export interface IServices {
  api: IServicesApi;
}

/**
 * Implements the services available to the application.
 */
export const services: IServices = {
  api: {
    authentication: authenticationService,
  },
};
