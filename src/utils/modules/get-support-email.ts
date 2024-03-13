import { DEV_SUPPORT_EMAIL, PROD_SUPPORT_EMAIL } from "@/data";
import { isDevelopmentMode } from "./is-development-mode";

export const getSupportEmail = () => {
  return isDevelopmentMode() ? DEV_SUPPORT_EMAIL : PROD_SUPPORT_EMAIL;
};
