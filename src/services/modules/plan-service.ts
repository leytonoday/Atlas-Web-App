import { getApiBaseUrl, isOnClient } from "@/utils";
import { IApiBaseService } from "../api-base.service";
import axios from "axios";
import { IPlan, IPlanFeature, IServerResponse } from "@/types";

/**
 * For all Plan related API calls. A "Plan" is a subscription tier that a User can subscribe to, to gain access to the application.
 */
export interface IPlanService extends IApiBaseService {
  /**
   * Gets all the Plans, optionally including archived Plans
   * @param includeArchived Determines if archived Plans should be included in the response
   * @returns The server response, containing all Plans
   */
  getAllPlans: (includeArchived: boolean) => Promise<IServerResponse>;

  /**
   * Updates a Plan
   * @param plan The plan to update with the new values
   * @returns The server response
   */
  updatePlan: (plan: Partial<IPlan>) => Promise<IServerResponse>;

  /**
   * Creates a new Plan
   * @param plan The plan to create
   * @returns The server response
   */
  createPlan: (plan: Partial<IPlan>) => Promise<IServerResponse>;

  /**
   * Gets the Features that are assigned to the Plan with the given ID. It also recursively gets the Features that are assigned to the Plan's parent Plans.
   * @param planId The ID of the Plan to get the Features for
   * @returns The server response, containing the features that are @ IPlanFeature
   */
  getFeatures: (planId: string) => Promise<IServerResponse>;

  /**
   * Adds a Feature to a Plan
   * @param planFeature The PlanFeature, containing the Plan ID and Feature ID
   * @returns The server response
   */
  addFeature: (planFeature: IPlanFeature) => Promise<IServerResponse>;

  /**
   * Removes a Feature from a Plan
   * @param planFeature The PlanFeature, containing the Plan ID and Feature ID
   * @returns The server response
   */
  removeFeature: (planFeature: IPlanFeature) => Promise<IServerResponse>;

  /**
   * Updates a Feature on a Plan. PlanFeature is the weak-entity that represents the many-to-many relationship between Plan and Feature.
   * There is a "value" column on the table, which is the value associated with the relationship. For example, if the Feature
   * is "Max Character Count", then the value could be "1000".
   * @param planFeature The PlanFeature, containing the Plan ID and Feature ID
   * @returns The server response
   */
  updateFeature: (planFeature: IPlanFeature) => Promise<IServerResponse>;

  /**
   * Gets the Plan with the given ID
   * @param planId The ID of the Plan to get
   * @returns The server response, containing the Plan
   */
  getById: (planId: string) => Promise<IServerResponse>;

  /**
   * Gets the Plan that the current user is subscribed to
   * @returns The server response, containing the Plan
   */
  getMyPlan: () => Promise<IServerResponse>;
}

export const planService: IPlanService = {
  baseUrl: isOnClient() ? "/api/plan" : `${getApiBaseUrl()}/plan`,

  getAllPlans: async function (includeInactive: boolean) {
    const response = await axios.get<IServerResponse>(
      `${this.baseUrl}?includeInactive=${includeInactive}`,
    );
    return response.data;
  },

  updatePlan: async function (plan: Partial<IPlan>) {
    const response = await axios.put<IServerResponse>(this.baseUrl, plan);
    return response.data;
  },

  createPlan: async function (plan: Partial<IPlan>) {
    const response = await axios.post<IServerResponse>(this.baseUrl, plan);
    return response.data;
  },

  getFeatures: async function (planId: string) {
    const response = await axios.get<IServerResponse>(
      `${this.baseUrl}/${planId}/features`,
    );
    return response.data;
  },

  addFeature: async function (planFeature: IPlanFeature) {
    const response = await axios.post<IServerResponse>(
      `${this.baseUrl}/features`,
      planFeature,
    );
    return response.data;
  },

  removeFeature: async function (planFeature: IPlanFeature) {
    const response = await axios.delete<IServerResponse>(
      `${this.baseUrl}/features`,
      {
        data: planFeature,
      },
    );
    return response.data;
  },

  updateFeature: async function (planFeature: IPlanFeature) {
    const response = await axios.put<IServerResponse>(
      `${this.baseUrl}/features`,
      planFeature,
    );
    return response.data;
  },

  getById: async function (planId: string) {
    const response = await axios.get<IServerResponse>(
      `${this.baseUrl}/${planId}`,
    );
    return response.data;
  },

  getMyPlan: async function () {
    const response = await axios.get<IServerResponse>(
      `${this.baseUrl}/my-plan`,
    );
    return response.data;
  },
};
