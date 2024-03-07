import React from "react";
import {
  AiOutlineExclamationCircle,
  AiOutlineInfoCircle,
  AiOutlineWarning,
} from "react-icons/ai";
import { SimpleTooltip } from "./simple-tooltip";

export interface IIconTooltipProps {
  /**
   * The content of the tooltip.
   */
  content: string;

  /**
   * The status of the icon.
   */
  status: "info" | "warning" | "danger";
}

/**
 * A component that displays an icon with a tooltip.
 */
export const IconPopover = (props: IIconTooltipProps) => {
  const icon = () => {
    switch (props.status) {
      case "info":
        return <AiOutlineInfoCircle />;
      case "warning":
        return <AiOutlineWarning />;
      case "danger":
        return <AiOutlineExclamationCircle />;
    }
  };

  const iconColour = () => {
    switch (props.status) {
      case "info":
        return undefined;
      case "warning":
        return "#ed9900";
      case "danger":
        return "#FF0000";
    }
  };

  return (
    <SimpleTooltip text={props.content}>
      <span
        style={{
          color: iconColour(),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        {icon()}
      </span>
    </SimpleTooltip>
  );
};
