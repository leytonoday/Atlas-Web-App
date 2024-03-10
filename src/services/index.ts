import {
  IAuthenticationService,
  authenticationService,
} from "./modules/authentication-service";
import { IUserService, userService } from "./modules/user-service";
import { IStripeService, stripeService } from "./modules/stripe-service";

/**
 * Defines services that interact with APIs.
 */
export interface IServicesApi {
  authentication: IAuthenticationService;
  user: IUserService;
  stripe: IStripeService;
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
    stripe: stripeService,
  },
};
