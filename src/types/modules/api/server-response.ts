import { IServerResponseError } from "./server-response-error";

export interface IServerResponse<TData = any> {
  statusCode: number;
  errors: IServerResponseError[] | null;
  data?: TData;
}
