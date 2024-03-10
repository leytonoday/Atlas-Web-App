import { useStore } from "@/store";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { services } from "@/services";
import { SimpleHead } from "@/components/common";
import { deleteCookie } from "cookies-next";
import { API_COOKIE_NAME } from "@/data";

export default function SignOut() {
  const router = useRouter();
  const store = useStore();

  useQuery({
    queryFn: () => services.api.authentication.signOut(),
    onSuccess: () => {
      deleteCookie(API_COOKIE_NAME);
      store.setWhoAmI(undefined);
      router.push("/");
    },
  });

  return (
    <>
      <SimpleHead title="Sign Out" />
      <div className="flex w-full justify-center">Signing out...</div>
    </>
  );
}
