export interface ICreateOrUpdateSubscriptionRequest {
  planId: string;
  interval: "month" | "year";
  stripePaymentMethodId?: string;
  promotionCode: string | null;
}
