export interface IQuoteInvoiceRequest {
  planId: string;
  userId: string;
  interval: string;
  promotionCode: string | null;
}
