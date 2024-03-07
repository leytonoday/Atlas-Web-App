export enum NotificationStatus {
  Success = "success",
  Error = "error",
  Info = "info",
  Warning = "warning",
}

export interface NotificationInfo {
  status: NotificationStatus;
  description: string;
}
