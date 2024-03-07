export interface IStripePaymentMethod {
  id: string;
  object: string;
  created: Date;
  livemode: boolean;
  metadata: object;
  type: string;
  card: IStripePaymentMethodCard;
}

export interface IStripePaymentMethodCard {
  brand: string;
  country: string;
  expMonth: number;
  expYear: number;
  description: string;
  fingerprint: string;
  funding: string;
  last4: string;
  issuer?: string;
}
