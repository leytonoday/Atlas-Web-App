import { getApiBaseUrl, isOnClient } from "@/utils";
import { IApiBaseService } from "../api-base.service";
import { IContactEmail, IServerResponse } from "@/types";
import axios from "axios";

/**
 * For all contact related API calls
 */
export interface IContactService extends IApiBaseService {
  /**
   * Sends an email to the admin with the contact form data
   * @param request The contact form data to send
   * @returns The server response
   */
  sendContactEmail: (request: IContactEmail) => Promise<IServerResponse>;
}

export const contactService: IContactService = {
  baseUrl: isOnClient() ? "/api/contact" : `${getApiBaseUrl()}/contact`,

  sendContactEmail: async function (request: IContactEmail) {
    const response = await axios.post<IServerResponse>(this.baseUrl, request);
    return response.data;
  },
};
