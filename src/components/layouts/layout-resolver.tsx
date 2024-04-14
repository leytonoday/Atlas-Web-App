import { IWrapperComponentProps } from "@/types";
import { RootLayout } from "./root-layout/root-layout";
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { AccountSettingsLayout } from "./account-settings-layout";
import { AdminLayout } from "./admin-layout";
import { AppLayout } from "./app-layout";
import { PageTransition } from "./root-layout/components/page-transition";

/**
 * This component is responsible for resolving the layout to be used based on the current route.
 * For example, if the user is in the /admin route,
 * perhaps we'd want to use a different layout than the default one.
 */

export const LayoutResolver = (props: IWrapperComponentProps) => {
  const pathname = usePathname();

  /**
   * Depending on the route, return the layout component to be used.
   */
  const routeToLayout = useCallback(() => {
    // If the route is account-settings, use the AccountSettingsLayout
    if (pathname.startsWith("/account-settings")) {
      return AccountSettingsLayout;
    } else if (pathname.startsWith("/admin")) {
      return AdminLayout;
    } else if (pathname.startsWith("/app")) {
      return AppLayout;
    }
    return RootLayout;
  }, [pathname]);

  const Layout = routeToLayout();

  return (
    <Layout>
      <PageTransition>{props.children}</PageTransition>
    </Layout>
  );
};
