export enum ContactEmailType {
  GENERAL_INQUIRY = "GENERAL_ENQUIRY",
  TECHNICAL_SUPPORT = "TECHNICAL_SUPPORT",
  SALES = "SALES",
  FEEDBACK = "FEEDBACK",
  OTHER = "OTHER",
}

export interface IContactEmail {
  name: string;
  email: string;
  type: ContactEmailType;
  message: string;
}
