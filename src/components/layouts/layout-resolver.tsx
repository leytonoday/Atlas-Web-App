import { IWrapperComponentProps } from "@/types";
import { RootLayout } from "./root-layout/root-layout";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { AccountSettingsLayout } from "./account-settings-layout";
import { AdminLayout } from "./admin-layout";

/**
 * This component is responsible for resolving the layout to be used based on the current route.
 * For example, if the user is in the /admin route,
 * perhaps we'd want to use a different layout than the default one.
 */

export const LayoutResolver = (props: IWrapperComponentProps) => {
  const router = useRouter();

  /**
   * Depending on the route, return the layout component to be used.
   */
  const routeToLayout = useCallback(() => {
    // If the route is account-settings, use the AccountSettingsLayout
    if (router.pathname.includes("account-settings")) {
      return AccountSettingsLayout;
    } else if (router.pathname.includes("admin")) {
      return AdminLayout;
    }
    return RootLayout;
  }, [router.pathname]);

  const Layout = routeToLayout();

  return <Layout>{props.children}</Layout>;
};
