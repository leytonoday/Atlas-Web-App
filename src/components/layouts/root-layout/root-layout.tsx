import React, { ReactNode } from "react";
import NextNProgress from "nextjs-progressbar";
import { theme } from "antd";
import { Footer } from "./components/footer/footer";
import { NavigationBar } from "./components/navigation-bar/navigation-bar";
import { IWrapperComponentProps } from "@/types";
import { useWhoAmI } from "@/hooks";

/**
 * The root layout for the application, which is on all pages.
 * Contains components that are on all pages, such as the navigation bar and footer.
 */
export const RootLayout = (props: IWrapperComponentProps): ReactNode => {
  useWhoAmI();

  const { token: themeToken } = theme.useToken();

  return (
    <div className="flex h-screen flex-col text-text-color">
      <NextNProgress
        color={themeToken.colorPrimary}
        options={{ showSpinner: false }}
      />

      <NavigationBar />

      <div className="flex-1">
        <main role="main" className="h-full w-full">
          {props.children}
        </main>
      </div>

      <Footer />
    </div>
  );
};
