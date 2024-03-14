export interface IAttachPaymentMethodRequest {
  userId: string;
  stripePaymentMethodId: string;
  setAsDefaultPaymentMethod: boolean;
}
