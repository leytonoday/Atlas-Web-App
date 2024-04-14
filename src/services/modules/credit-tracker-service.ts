import { getApiBaseUrl, isOnClient } from "@/utils";
import { IApiBaseService } from "../api-base.service";
import axios from "axios";
import { ICreditTracker, IServerResponse } from "@/types";

export interface ICreditTrackerService extends IApiBaseService {
  getCreditTracker: () => Promise<IServerResponse<ICreditTracker>>;
}

export const creditTrackerService: ICreditTrackerService = {
  baseUrl: isOnClient()
    ? "/api/credit-tracker"
    : `${getApiBaseUrl()}/credit-tracker`,

  getCreditTracker: async function () {
    const response = await axios.get<IServerResponse>(`${this.baseUrl}`);
    return response.data;
  },
};
