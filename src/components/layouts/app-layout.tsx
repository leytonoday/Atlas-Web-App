import { IWrapperComponentProps } from "@/types";
import { RootLayout } from "./root-layout/root-layout";
import { Menu } from "antd";
import { useEffect, useMemo, useState } from "react";
import { MenuProps } from "antd/lib";
import { AiOutlineCompress, AiOutlineFileText } from "react-icons/ai";
import { MdOutlineTranslate } from "react-icons/md";
import { useRouter } from "next/router";

/**
 * A layout component that is used for the main functionality of the application. It's called "app" layout because it's used for the main app functionality,
 * not because it's for the entire web application.
 */
export const AppLayout = (props: IWrapperComponentProps) => {
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
        label: "My Documents",
        key: "/app/my-documents",
        icon: <AiOutlineFileText className="mr-2 !text-base" />,
      },
      {
        label: "Document Summariser",
        key: "/app/document-summariser",
        icon: <AiOutlineCompress className="mr-2 !text-base" />,
      },
      {
        label: "Document Translator",
        key: "/app/document-translator",
        icon: <MdOutlineTranslate className="mr-2 !text-base" />,
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
        <div className="w-full flex-1 p-4 md:w-[12rem]">{props.children}</div>
      </div>
    </RootLayout>
  );
};
