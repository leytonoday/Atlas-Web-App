import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useIsMobileScreen } from "@/hooks";
import { useMemo, useState, useEffect, ReactNode } from "react";
import { Button, Divider, Drawer, Dropdown, Menu, MenuProps } from "antd";
import { NavigationBarMenu } from "./components/navigation-bar-menu";
import { NavigationBarDropDown } from "./components/navigation-bar-drop-down";
import { RiScalesLine } from "react-icons/ri";
import { IoExtensionPuzzleOutline } from "react-icons/io5";
import {
  AiOutlineAppstore,
  AiOutlineBars,
  AiOutlineCreditCard,
  AiOutlineIdcard,
  AiOutlineLogout,
  AiOutlineMail,
  AiOutlineTag,
  AiOutlineTeam,
  AiOutlineUser,
} from "react-icons/ai";
import { useStore } from "@/store";
import { Heading, SimpleTooltip } from "@/components/common";
import { PiToolbox } from "react-icons/pi";
import { NotificationStatus, UserRole } from "@/types";
import { signOut } from "@/utils";
import { GoToAppButton } from "./components/go-to-app-button";
import Image from "next/image";

/**
 * Navigation bar component. Handles the navigation bar for desktop and mobile screens.
 */
export const NavigationBar = (): ReactNode => {
  const router = useRouter();
  const store = useStore();

  const pathname = usePathname();
  const isMobileScreen = useIsMobileScreen();

  const [currentPath, setCurrentPath] = useState<string>("/");
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const isUserAdmin = store.whoAmI
    ? store.whoAmI.roles.includes(UserRole.Administrator)
    : false;

  const userHasPlanId = store.whoAmI ? store.whoAmI.planId : false;

  /**
   * Close the drawer when the screen size is changed to desktop
   */
  useEffect(() => {
    if (!isMobileScreen) {
      setIsDrawerOpen(false);
    }
  }, [isMobileScreen]);

  /**
   * Update the current path when the route is changed externally
   */
  useEffect(() => {
    setCurrentPath(pathname);
  }, [pathname]);

  const onMenuItemClick: MenuProps["onClick"] = (e) => {
    router.push(e.key);
    setIsDrawerOpen(false);
    setCurrentPath(e.key);
  };
  const productMenuItems = useMemo<MenuProps["items"]>(
    () => [
      {
        label: "Features",
        key: "/product/features",
        icon: <PiToolbox className="mr-2 !text-base" />,
      },
      {
        label: "Plans",
        key: "/product/plans",
        icon: <AiOutlineTag className="mr-2 !text-base" />,
      },
    ],
    [],
  );

  const companyMenuItems = useMemo<MenuProps["items"]>(
    () => [
      {
        label: "Contact",
        key: "/company/contact",
        icon: <AiOutlineMail className="mr-2 !text-base" />,
      },
      {
        label: "Legal",
        key: "/company/legal",
        icon: <RiScalesLine className="mr-2 !text-base" />,
      },
    ],
    [isMobileScreen],
  );

  const accountMenuItems = useMemo<MenuProps["items"]>(
    () => [
      isUserAdmin
        ? null
        : {
            label: "Account Settings",
            type: "group",
            children: [
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
            ],
          },
      !isUserAdmin
        ? null
        : {
            label: "Admin Settings",
            type: "group",
            children: [
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
          },
      {
        label: "Sign out",
        key: "/auth/sign-out",
        icon: <AiOutlineLogout className="mr-2 !text-base" />,
        danger: true,
      },
    ],
    [isUserAdmin],
  );

  return (
    <>
      {/* Navigation bar */}
      <nav
        role="navigation"
        className="relative z-10 flex justify-between px-4 py-2"
      >
        <div className="flex items-center justify-start flex-1">
          <div className="mx-4 flex h-full items-center justify-center text-xl gap-4 md:gap-0">
            <Link
              href="/"
              className="text-inherit no-underline hover:text-inherit text-center flex items-center gap-2"
            >
              <Image
                src="/logo.png"
                alt="Legal Lighthouse"
                width={150}
                height={150}
                className="w-auto h-12"
              />
              <span className="hidden md:block">Legal Lighthouse</span>
            </Link>

            {userHasPlanId && (
              <div className="md:hidden flex items-end w-full">
                <GoToAppButton />
              </div>
            )}
          </div>

          {/* Drop-down menus. Displayed in desktop mode */}
          <div className="hidden items-center justify-center gap-1 md:flex">
            <NavigationBarDropDown
              items={productMenuItems}
              label="Product"
              onItemClick={onMenuItemClick}
            />

            <NavigationBarDropDown
              items={companyMenuItems}
              label="Company"
              onItemClick={onMenuItemClick}
            />

            {userHasPlanId && <GoToAppButton />}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          {store.whoAmI ? (
            <div className="hidden items-center gap-4 md:flex">
              <SimpleTooltip text={store.whoAmI.userName}>
                <div className="max-w-[11rem] truncate text-right font-semibold">
                  {store.whoAmI.userName}
                </div>
              </SimpleTooltip>

              <Dropdown
                menu={{
                  items: accountMenuItems,
                  onClick: async (menuInfo) => {
                    if (menuInfo.key === "/auth/sign-out") {
                      const signOutResult = await signOut();
                      if (signOutResult) {
                        setTimeout(() => {
                          router.push("/");
                        }, 2000);
                      } else {
                        store.notification.enqueue({
                          status: NotificationStatus.Error,
                          description: "Failed to sign out",
                        });
                      }
                    }
                    onMenuItemClick(menuInfo);
                  },
                }}
                placement="bottomRight"
              >
                <Button
                  shape="circle"
                  className="!flex !h-9 !w-9 !items-center !justify-center !text-lg"
                >
                  <AiOutlineUser />
                </Button>
              </Dropdown>
            </div>
          ) : (
            <Link href="/auth/sign-in">
              <Button shape="round" type="primary" aria-label="Sign In">
                Sign in
              </Button>
            </Link>
          )}

          {/* Hamburger menu. Displayed in mobile mode */}
          <AiOutlineBars
            className="ml-2 block cursor-pointer text-2xl md:hidden"
            onClick={() => setIsDrawerOpen(true)}
          />
        </div>

        {/* Drawer. Displayed in mobile mode, opened by Hamburger menu button */}
        <Drawer
          placement="right"
          width="20rem"
          onClose={() => setIsDrawerOpen(false)}
          open={isDrawerOpen}
        >
          {store.whoAmI ? (
            <>
              <div className="flex flex-col items-center justify-center gap-4">
                <AiOutlineUser className="text-6xl" />

                <Heading className="max-w-full" level={2}>
                  {store.whoAmI.userName}
                </Heading>
              </div>

              <Divider />

              <NavigationBarMenu
                items={accountMenuItems}
                onItemClick={onMenuItemClick}
                currentPath={currentPath}
              />

              <Divider />
            </>
          ) : null}

          <NavigationBarMenu
            items={productMenuItems}
            onItemClick={onMenuItemClick}
            currentPath={currentPath}
          />

          <Divider />

          <NavigationBarMenu
            items={companyMenuItems}
            onItemClick={onMenuItemClick}
            currentPath={currentPath}
          />
        </Drawer>
      </nav>
    </>
  );
};
