import { IServerResponseError } from "./server-response-error";

export interface IServerResponse {
  statusCode: number;
  errors: IServerResponseError[] | null;
}

export interface IServerResponseWithData<TData> extends IServerResponse {
  data: TData;
}
