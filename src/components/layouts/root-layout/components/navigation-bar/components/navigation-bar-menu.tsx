import { Menu, MenuProps } from "antd";
import { ReactNode } from "react";

interface INavigationBarMenuProps {
  /**
   * The current path of the page
   */
  currentPath: string;

  /**
   * The items of the menu
   */
  items: MenuProps["items"];

  /**
   * The function to call when an item is clicked
   */
  onItemClick: MenuProps["onClick"];
}

/**
 * Used to render a menu in the drawer of the navigation bar when in mobile view.
 */
export const NavigationBarMenu = (
  props: INavigationBarMenuProps,
): ReactNode => (
  <Menu
    onClick={props.onItemClick}
    selectedKeys={[props.currentPath]}
    mode="vertical"
    items={props.items}
    className="w-full !border-none"
  />
);
