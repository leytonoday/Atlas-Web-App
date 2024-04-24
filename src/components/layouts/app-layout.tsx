import { IWrapperComponentProps } from "@/types";
import { RootLayout } from "./root-layout/root-layout";
import { Button, Menu, Result } from "antd";
import { useEffect, useMemo, useState } from "react";
import { MenuProps } from "antd/lib";
import { AiOutlineFileText, AiOutlineSetting } from "react-icons/ai";
import { usePathname, useRouter } from "next/navigation";
import { useCreditTracker } from "@/hooks/modules/use-credit-tracker";
import { useStore } from "@/store";
import Link from "next/link";

/**
 * A layout component that is used for the main functionality of the application. It's called "app" layout because it's used for the main app functionality,
 * not because it's for the entire web application.
 */
export const AppLayout = (props: IWrapperComponentProps) => {
  useCreditTracker();

  const store = useStore();
  const router = useRouter();
  const pathname = usePathname();

  const [currentPath, setCurrentPath] = useState(pathname);
  const onMenuItemClick: MenuProps["onClick"] = (e) => {
    const path = e.key;
    router.push(path);
  };

  useEffect(() => {
    setCurrentPath(pathname);
  }, [pathname]);

  const getChildren = () => {
    if (store.whoAmI?.planId === null) {
      return (
        <Result
          title="You are not subscribed to a plan"
          subTitle="You have an account, but your account does not have access to the Legal Lighthouse application. If you have just purchased a plan, please wait one minute for your subscription to be processed."
          status="info"
          extra={
            <Link href="/product/plans">
              <Button type="primary" aria-label="View Plans">
                View Plans
              </Button>
            </Link>
          }
        />
      );
    }

    return props.children;
  };

  const menuItems = useMemo<MenuProps["items"]>(
    () => [
      {
        label: "My Documents",
        key: "/app/my-legal-documents",
        icon: <AiOutlineFileText className="mr-2 !text-base" />,
      },
      {
        label: "Settings",
        key: "/app/settings",
        icon: <AiOutlineSetting className="mr-2 !text-base" />,
      },
    ],
    [],
  );

  return (
    <RootLayout>
      <div className="flex flex-col px-4 md:flex-row">
        <div className="w-full pt-4 md:w-[14rem]">
          <Menu
            onClick={onMenuItemClick}
            selectedKeys={[currentPath]}
            mode="vertical"
            items={menuItems}
            style={{
              border: "none",
              width: "100%",
            }}
          />
        </div>
        <div className="w-full flex-1 p-4 md:w-[12rem]">{getChildren()}</div>
      </div>
    </RootLayout>
  );
};
