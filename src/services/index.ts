import {
  IAuthenticationService,
  authenticationService,
} from "./modules/authentication-service";
import { IUserService, userService } from "./modules/user-service";

/**
 * Defines services that interact with APIs.
 */
export interface IServicesApi {
  authentication: IAuthenticationService;
  user: IUserService;
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
    user: userService,
  },
};
