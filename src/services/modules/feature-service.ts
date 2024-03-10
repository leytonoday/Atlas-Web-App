import { getApiBaseUrl, isOnClient } from "@/utils";
import { IApiBaseService } from "../api-base.service";
import { IFeature, IServerResponse } from "@/types";
import axios from "axios";

/**
 * For all Feature related API calls. A "Feature" is a characteristic that can be attributed to a Plan. For example, a "Feature" could be "Highlighting".
 */
export interface IFeatureService extends IApiBaseService {
  /**
   * Gets all Features
   * @returns The server response, containing all features
   */
  getAllFeatures: () => Promise<IServerResponse>;

  /**
   * Updates a Feature
   * @param feature The feature to update
   * @returns The server response
   */
  updateFeature: (feature: Partial<IFeature>) => Promise<IServerResponse>;

  /**
   * Creates a Feature
   * @param feature The feature to create
   * @returns The server response
   */
  addFeature: (feature: Partial<IFeature>) => Promise<IServerResponse>;

  /**
   * Deletes a Feature with the given ID
   * @param featureId The ID of the feature to delete
   * @returns The server response
   */
  deleteFeature: (featureId: string) => Promise<IServerResponse>;
}

export const featureService: IFeatureService = {
  baseUrl: isOnClient() ? "/api/feature" : `${getApiBaseUrl()}/feature`,

  getAllFeatures: async function () {
    const response = await axios.get<IServerResponse>(this.baseUrl);
    return response.data;
  },

  updateFeature: async function (feature: Partial<IFeature>) {
    const response = await axios.put<IServerResponse>(this.baseUrl, feature);
    return response.data;
  },

  addFeature: async function (feature: Partial<IFeature>) {
    const response = await axios.post<IServerResponse>(this.baseUrl, feature);
    return response.data;
  },

  deleteFeature: async function (featureId: string) {
    const response = await axios.delete<IServerResponse>(
      `${this.baseUrl}/${featureId}`,
    );
    return response.data;
  },
};
