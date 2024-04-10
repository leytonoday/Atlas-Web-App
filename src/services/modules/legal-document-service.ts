import { getApiBaseUrl, isOnClient } from "@/utils";
import { IApiBaseService } from "../api-base.service";
import axios from "axios";
import {
  ICreateLegalDocumentsRequest,
  ILegalDocument,
  ILegalDocumentSummary,
  IServerResponse,
} from "@/types";

/**
 * For all Document related API calls, such as uploading, translating and summarizing documents.
 */
export interface IDocumentService extends IApiBaseService {
  /**
   * Creates documents from the given base64 data
   * @param request The documents to create
   * @returns The server response
   */
  createLegalDocuments: (
    request: ICreateLegalDocumentsRequest,
  ) => Promise<IServerResponse>;

  /**
   * Gets all legal documents
   * @returns The server response, containing the legal documents
   */
  getLegalDocuments: () => Promise<IServerResponse<ILegalDocument[]>>;

  /**
   * Gets the summary of a legal document
   * @param legalDocumentId The ID of the legal document to get the summary for
   * @returns The server response, containing the legal document summary
   */
  getLegalDocumentSummary: (
    legalDocumentId: string,
  ) => Promise<IServerResponse<ILegalDocumentSummary>>;

  /**
   * Creates a summary of a legal document
   * @param legalDocumentId The ID of the legal document to summarize
   */
  createLegalDocumentSummary: (
    legalDocumentId: string,
  ) => Promise<IServerResponse>;
}

export const documentService: IDocumentService = {
  baseUrl: isOnClient()
    ? "/api/legal-document"
    : `${getApiBaseUrl()}/legal-document`,

  createLegalDocuments: async function (request: ICreateLegalDocumentsRequest) {
    const response = await axios.post<IServerResponse>(
      `${this.baseUrl}`,
      request,
    );
    return response.data;
  },

  getLegalDocuments: async function () {
    const response = await axios.get<IServerResponse<ILegalDocument[]>>(
      `${this.baseUrl}`,
    );
    return response.data;
  },

  getLegalDocumentSummary: async function (legalDocumentId: string) {
    const response = await axios.get<IServerResponse<ILegalDocumentSummary>>(
      `${this.baseUrl}/summary/${legalDocumentId}`,
    );
    return response.data;
  },

  createLegalDocumentSummary: async function (legalDocumentId: string) {
    const response = await axios.post<IServerResponse>(
      `${this.baseUrl}/summary/${legalDocumentId}`,
    );
    return response.data;
  },
};
