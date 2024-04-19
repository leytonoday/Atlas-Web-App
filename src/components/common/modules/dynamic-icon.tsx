import { theme } from "antd";
import React, { useState, useEffect, useMemo, ReactNode } from "react";
import { cn, getAllIcons } from "@/utils";
import { IconType } from "react-icons";

interface IDynamicIconProps {
  /**
   * The name of the icon to render. Should exist in the react-icons library.
   */
  iconName: string;

  /**
   * The colour of the icon.
   */
  iconColour?: string;

  /**
   * The class name to apply to the icon.
   */
  className?: string;
}

/**
 * Used to dynamically render an icon from the react-icons library based on the iconName prop.
 */
export const DynamicIcon = (props: IDynamicIconProps) => {
  const [component, setComponent] = useState<ReactNode | null>(null);
  const { token: themeToken } = theme.useToken();

  const allIcons = useMemo(() => getAllIcons(), []);

  useEffect(() => {
    const importComponent = async () => {
      try {
        const targetIcon = allIcons[props.iconName as keyof typeof allIcons];
        setComponent(React.createElement(targetIcon));
      } catch (error) {
        console.log(error);
      }
    };

    if (props.iconName) {
      importComponent();
    }
  }, [props.iconName]);

  if (!component) {
    // You can show a loading state here if needed
    return null;
  }

  return React.isValidElement(component) ? (
    <div
      className={cn("flex items-center justify-center", props.className)}
      style={{
        color: props.iconColour || themeToken.colorPrimary,
      }}
    >
      {component}
    </div>
  ) : null;
};
