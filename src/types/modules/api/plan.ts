import { IFeature } from "./feature";
import { IPlanFeature } from "./plan-feature";

export interface IPlan {
  id?: string;
  stripeProductId?: string;
  name: string;
  description: string;
  isoCurrencyCode: string;
  monthlyPrice: number;
  annualPrice: number;
  trialPeriodDays: number;
  tag?: string;
  icon: string;
  iconColour?: string;
  backgroundColour?: string;
  textColour?: string;
  active: boolean;
  inheritsFromId?: string;

  planFeatures?: IPlanFeature[];
  features?: IFeature[];

  inheritedPlanFeatures?: IPlanFeature[];
  inheritedFeatures?: IFeature[];
}
