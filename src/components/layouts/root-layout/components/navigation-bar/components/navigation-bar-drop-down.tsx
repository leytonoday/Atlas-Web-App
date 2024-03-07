import { Button, Dropdown, MenuProps } from "antd";
import { ReactNode } from "react";
import { AiOutlineDown } from "react-icons/ai";

interface INavigationBarDropDownProps {
  /**
   * The label of the drop-down menu
   */
  label: string;

  /**
   * The items of the drop-down menu
   */
  items: MenuProps["items"];

  /**
   * The function to call when an item is clicked
   */
  onItemClick: MenuProps["onClick"];
}

/**
 * Used to render a drop-down menu in the navigation bar when in desktop view.
 */
export const NavigationBarDropDown = (
  props: INavigationBarDropDownProps,
): ReactNode => (
  <Dropdown
    menu={{
      items: props.items,
      onClick: props.onItemClick,
    }}
    trigger={["hover"]}
  >
    <Button size="large" type="text" aria-label={props.label}>
      <div className="flex items-center justify-center gap-4">
        <div>{props.label}</div>
        <AiOutlineDown className="text-xs" />
      </div>
    </Button>
  </Dropdown>
);
