import { IServerResponseError } from "./server-response-error";

export interface IServerResponse<TData = any> {
  isSuccess: boolean;
  errors: IServerResponseError[] | null;
  data?: TData;
}
