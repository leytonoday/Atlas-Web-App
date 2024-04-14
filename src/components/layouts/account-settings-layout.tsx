import { IWrapperComponentProps } from "@/types";
import { Menu, MenuProps } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  AiOutlineCreditCard,
  AiOutlineIdcard,
  AiOutlineUnlock,
  AiOutlineUserDelete,
} from "react-icons/ai";
import { RootLayout } from "./root-layout/root-layout";

export const AccountSettingsLayout = (props: IWrapperComponentProps) => {
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

  const menuItems = useMemo<MenuProps["items"]>(
    () => [
      {
        label: "Account information",
        key: "/account-settings/account-information",
        icon: <AiOutlineIdcard className="mr-2 !text-base" />,
      },
      {
        label: "Manage subscription",
        key: "/account-settings/manage-subscription",
        icon: <AiOutlineCreditCard className="mr-2 !text-base" />,
      },
      {
        label: "Change password",
        key: "/account-settings/change-password",
        icon: <AiOutlineUnlock className="mr-2 !text-base" />,
      },
      {
        label: "Delete account",
        key: "/account-settings/delete-account",
        icon: <AiOutlineUserDelete className="mr-2 !text-base" />,
        danger: true,
      },
    ],
    [],
  );

  return (
    <RootLayout>
      <div className="flex flex-col px-4 md:flex-row">
        <div className="w-full pt-4 md:w-[13rem]">
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
        <div className="w-full flex-1 p-4 md:w-[12rem]">{props.children}</div>
      </div>
    </RootLayout>
  );
};
