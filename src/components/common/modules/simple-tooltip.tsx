import { IWrapperComponentProps } from "@/types";
import { Tooltip } from "antd";

interface ISimpleTooltipProps extends IWrapperComponentProps {
  /**
   * The text to display in the tooltip
   */
  text: string;

  /**
   * The placement of the tooltip, relative to the target element. Defaults to "bottom"
   */
  placement?: "top" | "bottom" | "left" | "right";

  /**
   * The delay before the tooltip is shown, in seconds. Defaults to 0.3
   */
  delay?: number;
}

/**
 * A wrapper around the Ant Design Tooltip component that makes it easier to use
 */
export const SimpleTooltip = (props: ISimpleTooltipProps) => {
  return (
    <Tooltip
      className={props.className}
      title={props.text}
      placement={props.placement || "bottom"}
      mouseEnterDelay={props.delay || 0.3}
    >
      {props.children}
    </Tooltip>
  );
};
