export interface IStripeSubscription {
  id: string;
  object: string;
  applicationId?: string;
  application?: IStripeApplication;
  applicationFeePercent?: number;
  automaticTax?: IStripeSubscriptionAutomaticTax;
  billingCycleAnchor: Date;
  billingThresholds?: IStripeSubscriptionBillingThresholds;
  cancelAt?: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  cancellationDetails?: IStripeSubscriptionCancellationDetails;
  collectionMethod?: string;
  created: Date;
  currency: string;
  currentPeriodEnd: Date;
  currentPeriodStart: Date;
  customerId?: string;
  customer?: IStripeCustomer;
  daysUntilDue?: number;
  defaultPaymentMethodId?: string;
  defaultPaymentMethod?: any; // TODO - add type
  defaultSourceId?: string;
  defaultSource?: any; // TODO - add type
  defaultTaxRates?: IStripeTaxRate[];
  description?: string;
  discount?: any; // TODO - add type
  endedAt?: Date;
  items: any; // TODO - add type
  latestInvoiceId?: string;
  latestInvoice?: IStripeInvoice; // TODO - add type
  livemode: boolean;
  metadata?: { [key: string]: string };
  nextPendingInvoiceItemInvoice?: Date;
  paymentSettings?: any; // TODO - add type
  pendingInvoiceItemInterval?: any; // TODO - add type
  pendingUpdate?: any; // TODO - add type
  pendingSetupIntent?: any; // TODO - add type
  startDate?: Date;
  status: StripeSubscriptionStatus;
  transferData?: any; // TODO - add type
  trialEnd?: Date;
  trialSettings?: any; // TODO - add type
  trialStart?: Date;
}

export interface IStripeSlimInvoice {
  id: string;
  currency: string;
  created: Date;
  hostedInvoiceUrl: string;
  status: StripeInvoiceStatus;
  total: number;
  lines: any; // TODO - add type
}

export interface IStripeInvoice {
  id: string;
  object: string;
  accountCountry: string;
  accountName: string;
  amountDue: number;
  amountPaid: number;
  amountRemaining: number;
  amountShipping: number;
  applicationFeeAmount?: number;
  attemptCount: number;
  attempted: boolean;
  autoAdvance: boolean;
  automaticTax?: IStripeSubscriptionAutomaticTax;
  billingReason: string;
  collectionMethod: string;
  created: Date;
  currency: string;
  customFields?: any; // TODO - add type
  customerAddress?: any; // TODO - add type
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  customerShipping?: any; // TODO - add type
  customerTaxExempt: string;
  customerTaxIds?: any; // TODO - add type
  defaulTaxRates?: IStripeTaxRate[];
  deleted: boolean;
  description: string;
  discount?: any; // TODO - add type
  dueDate?: Date;
  endingBalance: number;
  footer?: string;
  fromInvoice?: any; // TODO - add type
  hostedInvoiceUrl: string;
  invoicePdf: string;
  lastFinalizationError?: any; // TODO - add type
  lines: any; // TODO - add type
  livemode: boolean;
  metadata?: object;
  nextPaymentAttempt?: Date;
  number: string;
  paid: boolean;
  paidOutOfBand?: Date;
  paymentIntentId?: string;
  paymentIntent?: any; // TODO - add type
  periodEnd: Date;
  periodStart: Date;
  postPaymentCreditNotesAmount: number;
  prePaymentCreditNotesAmount: number;
  receiptNumber?: string;
  renderingOptions?: any; // TODO - add type
  shippingCost: any; // TODO - add type
  shippingDetails?: any; // TODO - add type
  startingBalance: number;
  statementDescriptor?: string;
  status: StripeInvoiceStatus;
  statusTransitions?: any; // TODO - add type
  subscriptionProrationDate?: Date;
  subtotal: number;
  subtotalExcldingTax: number;
  tax: number;
  thresholdReason?: string;
  total: number;
  totalDiscountAmounts: any; // TODO - add type
  totalExcludingTax: number;
  totalTaxAmounts: any; // TODO - add type
  transferData?: any; // TODO - add type
  webhooksDeliveredAt?: Date;
}

export enum StripeInvoiceStatus {
  Draft = "draft",
  Open = "open",
  Paid = "paid",
  Uncollectible = "uncollectible",
  Void = "void",
}

export enum StripeSubscriptionStatus {
  Active = "active",
  Canceled = "canceled",
  Incomplete = "incomplete",
  IncompleteExpired = "incomplete_expired",
  PastDue = "past_due",
  Trialing = "trialing",
  Unpaid = "unpaid",
  Paused = "paused",
}

export interface IStripeApplication {
  id: string;
  object: string;
  name: string;
}

export interface IStripeSubscriptionAutomaticTax {
  enabled: boolean;
}

export interface IStripeSubscriptionBillingThresholds {
  AmountGte?: number;
  ResetBillingCycleAnchor?: boolean;
}

export interface IStripeSubscriptionCancellationDetails {
  comment: string;
  feedback: string;
  reason: string;
}

export interface IStripeCustomer {
  id: string;
  // Add more properties here as needed
}

export interface IStripeTaxRate {
  id: string;
  object: string;
  active: boolean;
  country: string;
  created: Date;
  description: string;
  displayName: string;
  effectivePercentage?: number;
  inclusive: boolean;
  jurisdiction: string;
  livemode: boolean;
  metadata: object;
  percentage: number;
  state: string;
  taxType: string;
}
