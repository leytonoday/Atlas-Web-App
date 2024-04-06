export enum UserErrorCodes {
  InvalidCredentials = "User.InvalidCredentials",
  MustVerifyEmail = "User.MustVerifyEmail",
  OldPasswordMustBeProvidedCorrectlyBusinessRule = "User.OldPasswordMustBeProvidedCorrectlyBusinessRule",
}

export const serverErrorCodes = {
  user: UserErrorCodes,
};
