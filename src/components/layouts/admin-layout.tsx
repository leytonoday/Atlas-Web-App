import { IWrapperComponentProps } from "@/types";
import { Menu, MenuProps } from "antd";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import {
  AiOutlineAppstore,
  AiOutlineCreditCard,
  AiOutlineIdcard,
  AiOutlineTag,
  AiOutlineTeam,
  AiOutlineUnlock,
  AiOutlineUserDelete,
} from "react-icons/ai";
import { RootLayout } from "./root-layout/root-layout";

export const AdminLayout = (props: IWrapperComponentProps) => {
  const router = useRouter();

  const [currentPath, setCurrentPath] = useState(router.pathname);
  const onMenuItemClick: MenuProps["onClick"] = (e) => {
    const path = e.key;
    router.push(path);
  };

  useEffect(() => {
    setCurrentPath(router.pathname);
  }, [router.pathname]);

  const menuItems = useMemo<MenuProps["items"]>(
    () => [
      {
        label: "Plans",
        key: "/admin/plans",
        icon: <AiOutlineTag className="mr-2 !text-base" />,
      },
      {
        label: "Features",
        key: "/admin/features",
        icon: <AiOutlineAppstore className="mr-2 !text-base" />,
      },
      {
        label: "Users",
        key: "/admin/users",
        icon: <AiOutlineTeam className="mr-2 !text-base" />,
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
