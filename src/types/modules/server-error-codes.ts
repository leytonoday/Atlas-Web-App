export enum UserErrorCodes {
  InvalidCredentials = "User.InvalidCredentials",
  MustVerifyEmail = "User.EmailMustBeVerifiedBusinessRule",
  OldPasswordMustBeProvidedCorrectlyBusinessRule = "User.OldPasswordMustBeProvidedCorrectlyBusinessRule",
}

export const serverErrorCodes = {
  user: UserErrorCodes,
};
