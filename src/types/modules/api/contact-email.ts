export enum ContactEmailType {
  GENERAL_INQUIRY = "GENERAL_ENQUIRY",
  FEEDBACK = "FEEDBACK",
  TECHNICAL_SUPPORT = "TECHNICAL_SUPPORT",
  SALES = "SALES",
  BILLING = "BILLING",
  PARTNERSHIP = "PARTNERSHIP",
  MEDIA = "MEDIA",
  LEGAL = "LEGAL",
  MARKETING = "MARKETING",
  OTHER = "OTHER",
}

export interface IContactEmail {
  name: string;
  email: string;
  type: ContactEmailType;
  message: string;
}
