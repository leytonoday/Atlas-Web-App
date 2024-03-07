import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { reportAccessibility } from "@/utils";
import React from "react";
import { LayoutResolver } from "@/components/layouts/layout-resolver";
import { ConfigProvider } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { themeConfig } from "@/misc/themeConfig";
import { NotificationHandler } from "@/components/notification-handler";

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: 0,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <ConfigProvider theme={themeConfig}>
        <NotificationHandler />

        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <LayoutResolver>
            <Component {...pageProps} />
          </LayoutResolver>
        </QueryClientProvider>
      </ConfigProvider>
    </>
  );
}

reportAccessibility(React);
