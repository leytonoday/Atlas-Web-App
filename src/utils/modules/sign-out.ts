import { services } from "@/services";
import { useStore } from "@/store";

export const signOut = async (): Promise<boolean> => {
  try {
    // This could fail if the user has already signed out.
    const result = await services.api.authentication.signOut();
    if (!result.isSuccess) {
      return false;
    }
  } catch {
    return false;
  }

  const store = useStore.getState();
  store.setWhoAmI(undefined);

  return true;
};
