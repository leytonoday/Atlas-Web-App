import { getApiBaseUrl, isOnClient } from "@/utils";
import { IApiBaseService } from "../api-base.service";
import {
  IServerResponse,
  ISignInRequest,
  ISignInWithTokenRequest,
  IWhoAmI,
} from "@/types";
import axios from "axios";
import * as EmailValidator from "email-validator";

/**
 * For all authentication related API calls
 */
export interface IAuthenticationService extends IApiBaseService {
  /**
   * Signs in a user. API returns a cookie
   * @param request The sign in request
   * @returns The server response
   */
  signIn: (request: ISignInRequest) => Promise<IServerResponse>;

  /**
   * Signs in a user using a token rather than a password. This is used for when the user verifies their email. The API returns this token,
   * so that the user can be signed in immediately after verifying their email.
   * @param request The sign in request
   * @returns The server response
   */
  signInWithToken: (
    request: ISignInWithTokenRequest,
  ) => Promise<IServerResponse>;

  /**
   * Signs out a user.
   * @returns The server response
   */
  signOut: () => Promise<IServerResponse>;

  /**
   * Determines if the user is authenticated or not.
   * @returns The server response, containing a boolean indicating if the user is authenticated or not
   */
  isAuthenticated: () => Promise<IServerResponse>;

  /**
   * Gets the user's identifying information.
   * @returns The server response, containing the user's identifying information
   */
  whoAmI: () => Promise<IServerResponse<IWhoAmI>>;
}

export const authenticationService: IAuthenticationService = {
  baseUrl: isOnClient()
    ? "/api/authentication"
    : `${getApiBaseUrl()}/authentication`,

  signIn: async function (request: ISignInRequest) {
    const isValidEmail = EmailValidator.validate(request.identifier);

    const response = await axios.post<IServerResponse>(
      `${this.baseUrl}/sign-in`,
      {
        username: isValidEmail ? undefined : request.identifier,
        email: isValidEmail ? request.identifier : undefined,
        password: request.password,
      },
      {
        withCredentials: true,
      },
    );

    return response.data;
  },

  signInWithToken: async function (request: ISignInWithTokenRequest) {
    const response = await axios.post<IServerResponse>(
      `${this.baseUrl}/sign-in-with-token`,
      request,
    );

    return response.data;
  },

  signOut: async function () {
    const response = await axios.post<IServerResponse>(
      `${this.baseUrl}/sign-out`,
    );
    return response.data;
  },

  isAuthenticated: async function () {
    const response = await axios.get<IServerResponse>(
      `${this.baseUrl}/is-authenticated`,
    );
    return response.data;
  },

  whoAmI: async function () {
    const response = await axios.get<IServerResponse<IWhoAmI>>(
      `${this.baseUrl}/who-am-i`,
    );
    return response.data;
  },
};
