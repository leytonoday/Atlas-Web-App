import { getApiBaseUrl, isOnClient } from "@/utils";
import { IApiBaseService } from "../api-base.service";
import {
  IAttachPaymentMethodRequest,
  IInvoiceHistoryRequest,
  IServerResponse,
} from "@/types";
import axios from "axios";
import { IQuoteInvoiceRequest } from "@/types/modules/api/quote-invoice-request";

/**
 * For all Stripe related API calls
 */
export interface IStripeService extends IApiBaseService {
  /**
   * Gets the user's subscription
   * @returns The server response, containing the user's subscription
   */
  getMySubscription: () => Promise<IServerResponse>;

  /**
   * Updates the user's subscription payment method
   * @param paymentMethodId The ID of the payment method to use for the user's subscription
   * @returns The server response
   */
  updateMySubscriptionPaymentMethod: (
    paymentMethodId: string,
  ) => Promise<IServerResponse>;

  /**
   * Sets the user's subscription to cancel at the end of the current billing period
   * @returns The server response
   */
  cancelMySubscription: () => Promise<IServerResponse>;

  /**
   * Sets the user's subscription to cancel immediately, rather than at the end of the current billing period
   * @returns The server response
   */
  cancelMySubscriptionImmediately: () => Promise<IServerResponse>;

  /**
   * Reactivates the user's subscription. Effectively undoes the effect of cancelMySubscription
   * @returns The server response
   */
  reactivateMySubscription: () => Promise<IServerResponse>;

  /**
   * Gets all of the user's payment methods
   * @returns The server response, containing all of the user's payment methods
   */
  getMyPaymentMethods: () => Promise<IServerResponse>;

  /**
   * Gets a link to the Stripe customer portal, where the user can manage their payment methods
   * @returns The server response, containing the customer portal link
   */
  getCustomerPortalLink: () => Promise<IServerResponse>;

  /**
   * Gets the user's default payment method
   * @returns The server response, containing the user's default payment method
   */
  getMyDefaultPaymentMethod: () => Promise<IServerResponse>;

  /**
   * Attaches a predefined payment method to the user's Stripe account
   * @param request The request, containing the payment method ID, and whether or not to set the payment method as the default
   * @returns The server response
   */
  attachPaymentMethod: (
    request: IAttachPaymentMethodRequest,
  ) => Promise<IServerResponse>;

  /**
   * Gets the user's upcoming invoice. Used to determine how much the user will be charged on their next billing date.
   * @returns The server response, containing the user's upcoming invoice
   */
  getMyUpcomingInvoice: () => Promise<IServerResponse>;

  /**
   * Gets the user's invoice history
   * @param request The request, containing the limit and startingAfter parameters
   * @returns The server response, containing the user's invoice history
   */
  getMyInvoiceHistory: (
    request: IInvoiceHistoryRequest,
  ) => Promise<IServerResponse>;

  /**
   * Gets a quote invoice for a Subscription. Used in the Checkout process to display the price to the user before they pay.
   * @param request The request
   * @returns The server response, containing the quote invoice
   */
  getQuoteInvoice: (request: IQuoteInvoiceRequest) => Promise<IServerResponse>;

  /**
   * Determines if the given promotion code is valid
   * @param promotionCode The promotion code to check
   * @returns The server response, containing a boolean indicating if the promotion code is valid or not
   */
  isPromotionCodeValid: (promotionCode: string) => Promise<IServerResponse>;

  /**
   * Determines if the given payment method has been used before. If so, the user is not eligible for a free trial.
   * @param paymentMethodId The ID of the payment method to check
   * @returns The server response, containing a boolean indicating if the payment method has been used before or not
   */
  hasCardPaymentMethodBeenUsedBefore: (
    paymentMethodId: string,
  ) => Promise<IServerResponse>;

  /**
   * The Stripe publishable key is used to initialize the Stripe client-side library. This is used to create a Stripe Checkout Session.
   * @returns The server response, containing the Stripe publishable key
   */
  getPublishableKey: () => Promise<IServerResponse>;
}

export const stripeService: IStripeService = {
  baseUrl: isOnClient() ? "/api/stripe" : `${getApiBaseUrl()}/stripe`,

  getMySubscription: async function () {
    const response = await axios.get<IServerResponse>(
      `${this.baseUrl}/my-subscription`,
    );
    return response.data;
  },

  updateMySubscriptionPaymentMethod: async function (
    paymentMethodId: string,
  ): Promise<IServerResponse> {
    const response = (
      await axios.put<IServerResponse>(
        `${this.baseUrl}/my-subscription/payment-method/${paymentMethodId}`,
      )
    ).data;
    return response;
  },

  reactivateMySubscription: async function (): Promise<IServerResponse> {
    const response = (
      await axios.post<IServerResponse>(
        `${this.baseUrl}/my-subscription/reactivate`,
      )
    ).data;
    return response;
  },

  cancelMySubscription: async function (): Promise<IServerResponse> {
    const response = (
      await axios.post<IServerResponse>(
        `${this.baseUrl}/my-subscription/cancel`,
      )
    ).data;
    return response;
  },

  cancelMySubscriptionImmediately: async function (): Promise<IServerResponse> {
    const response = (
      await axios.post<IServerResponse>(
        `${this.baseUrl}/my-subscription/cancel-immediately`,
      )
    ).data;
    return response;
  },

  getMyPaymentMethods: async function (): Promise<IServerResponse> {
    const response = (
      await axios.get<IServerResponse>(
        `${this.baseUrl}/my-subscription/payment-methods`,
      )
    ).data;
    return response;
  },

  getCustomerPortalLink: async function (): Promise<IServerResponse> {
    const response = (
      await axios.get<IServerResponse>(`${this.baseUrl}/customer-portal-link`)
    ).data;
    return response;
  },

  getMyDefaultPaymentMethod: async function (): Promise<IServerResponse> {
    const response = (
      await axios.get<IServerResponse>(
        `${this.baseUrl}/payment-methods/default`,
      )
    ).data;
    return response;
  },

  attachPaymentMethod: async function (
    request: IAttachPaymentMethodRequest,
  ): Promise<IServerResponse> {
    const response = (
      await axios.post<IServerResponse>(
        `${this.baseUrl}/payment-methods/attach`,
        request,
      )
    ).data;
    return response;
  },

  getMyUpcomingInvoice: async function (): Promise<IServerResponse> {
    const response = (
      await axios.get<IServerResponse>(
        `${this.baseUrl}/my-subscription/upcomingInvoice`,
      )
    ).data;
    return response;
  },

  getMyInvoiceHistory: async function (
    request: IInvoiceHistoryRequest,
  ): Promise<IServerResponse> {
    let queryString = "";
    if (request.limit) queryString += `limit=${request.limit}&`;
    if (request.startingAfter)
      queryString += `startingAfter=${request.startingAfter}`;

    const response = (
      await axios.get<IServerResponse>(
        `${this.baseUrl}/my-subscription/invoice-history?${queryString}`,
      )
    ).data;
    return response;
  },

  getQuoteInvoice: async function (
    request: IQuoteInvoiceRequest,
  ): Promise<IServerResponse> {
    const response = (
      await axios.post<IServerResponse>(
        `${this.baseUrl}/quote-invoice`,
        request,
      )
    ).data;
    return response;
  },

  isPromotionCodeValid: async function (
    promotionCode: string,
  ): Promise<IServerResponse> {
    const response = (
      await axios.get<IServerResponse>(
        `${this.baseUrl}/is-promotion-code-valid/${promotionCode}`,
      )
    ).data;
    return response;
  },

  hasCardPaymentMethodBeenUsedBefore: async function (
    paymentMethodId: string,
  ): Promise<IServerResponse> {
    const response = (
      await axios.get<IServerResponse>(
        `${this.baseUrl}/has-card-payment-method-been-used-before/${paymentMethodId}`,
      )
    ).data;
    return response;
  },

  getPublishableKey: async function () {
    const response = await axios.get<IServerResponse>(
      `${this.baseUrl}/publishable-key`,
    );
    return response.data;
  },
};
