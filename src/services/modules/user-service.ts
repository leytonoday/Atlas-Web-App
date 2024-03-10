import { getApiBaseUrl, isOnClient } from "@/utils";
import { IApiBaseService } from "../api-base.service";
import {
  IChangePasswordRequest,
  IConfirmUserEmailRequest,
  IDeleteAccountRequest,
  IResetPasswordRequest,
  IServerResponse,
  ISignUpRequest,
  IUpdateUserRequest,
} from "@/types";
import axios, { AxiosHeaders } from "axios";

/**
 * For all user related API calls
 */
export interface IUserService extends IApiBaseService {
  /**
   * Registers a user and sends them a confirmation email
   * @param request The sign up request
   * @returns The server response
   */
  signUp: (request: ISignUpRequest) => Promise<IServerResponse>;

  /**
   * Send's the user a forgot password email
   * @param identifier A username or email address
   * @returns The server response
   */
  forgotPassword: (identifier: string) => Promise<IServerResponse>;

  /**
   * Resets the user's password
   * @param request The reset password request
   * @returns The server response
   */
  resetPassword: (request: IResetPasswordRequest) => Promise<IServerResponse>;

  /**
   * Confirms a user's email address
   * @param request The confirm user email request
   * @returns The server response
   */
  confirmUserEmail: (
    request: IConfirmUserEmailRequest,
  ) => Promise<IServerResponse>;

  /**
   * Refreshes the confirmation email for a user, in the event that their original one has expired
   * @param identifier The user's username or email address
   * @returns The server response
   */
  refreshConfirmEmail: (identifier: string) => Promise<IServerResponse>;

  /**
   * Update some information about the user. For example, their name or email address.
   * @param request The update user request
   * @returns The server response
   */
  updateUser: (request: IUpdateUserRequest) => Promise<IServerResponse>;

  /**
   * Determines if the user is eligible for a trial or not
   * @param cookie The user's cookie
   * @returns The server response, containing a boolean indicating if the user is eligible for a trial or not
   */
  amIEligibleForTrial: (cookie?: string) => Promise<IServerResponse>;

  /**
   * Changes the user's password
   * @param request The change password request
   * @returns The server response
   */
  changePassword: (request: IChangePasswordRequest) => Promise<IServerResponse>;

  /**
   * Deletes the user's account
   * @param request The delete account request
   * @returns The server response
   */
  deleteAccount: (request: IDeleteAccountRequest) => Promise<IServerResponse>;

  /**
   * Gets all users that are subscribed to the given plan
   * @param planId The ID of the plan to get the users for
   * @returns The server response, containing the users
   */
  getAllUsersOnPlan: (planId: string) => Promise<IServerResponse>;
}

export const userService: IUserService = {
  baseUrl: isOnClient() ? "/api/user" : `${getApiBaseUrl()}/user`,

  signUp: async function (request: ISignUpRequest) {
    const response = await axios.post<IServerResponse>(this.baseUrl, request);
    return response.data;
  },

  forgotPassword: async function (identifier: string) {
    const response = await axios.post<IServerResponse>(
      `${this.baseUrl}/forgot-password/${identifier}`,
    );
    return response.data;
  },

  resetPassword: async function (request: IResetPasswordRequest) {
    const response = await axios.post<IServerResponse>(
      `${this.baseUrl}/reset-password`,
      request,
    );
    return response.data;
  },

  confirmUserEmail: async function (request: IConfirmUserEmailRequest) {
    const response = await axios.post<IServerResponse>(
      `${this.baseUrl}/confirm-email`,
      request,
    );
    return response.data;
  },

  refreshConfirmEmail: async function (identifier: string) {
    const response = await axios.post<IServerResponse>(
      `${this.baseUrl}/refresh-confirm-email/${identifier}`,
    );
    return response.data;
  },

  updateUser: async function (request: IUpdateUserRequest) {
    const response = await axios.put<IServerResponse>(this.baseUrl, request);
    return response.data;
  },

  amIEligibleForTrial: async function (cookie?: string) {
    const response = await axios.get<IServerResponse>(
      `${this.baseUrl}/trial/eligible`,
      {
        headers: {
          cookie: cookie,
        },
      },
    );
    return response.data;
  },

  changePassword: async function (request: IChangePasswordRequest) {
    const response = await axios.put<IServerResponse>(
      `${this.baseUrl}/change-password`,
      request,
    );
    return response.data;
  },

  deleteAccount: async function (request: IDeleteAccountRequest) {
    const response = await axios.delete<IServerResponse>(`${this.baseUrl}`, {
      data: request,
    });
    return response.data;
  },

  getAllUsersOnPlan: async function (planId: string) {
    const response = await axios.get<IServerResponse>(
      `${this.baseUrl}/plan/${planId}`,
    );
    return response.data;
  },
};
