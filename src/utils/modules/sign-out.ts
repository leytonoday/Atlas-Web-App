import { services } from "@/services";
import { useStore } from "@/store";
import { deleteCookie } from "cookies-next";

export const signOut = async (): Promise<boolean> => {
  const result = await services.api.authentication.signOut();
  if (!result.isSuccess) {
    return false;
  }

  const store = useStore.getState();
  store.setWhoAmI(undefined);

  return true;
};
