export interface IWhoAmI {
  userName: string;
  email: string;
  id: string;
  roles: string[];
  planId?: string;
  dateCreated: Date;
  phoneNumber?: string;
}
