export interface IResetPasswordRequest {
  newPassword: string;
  token: string;
  username: string;
}
