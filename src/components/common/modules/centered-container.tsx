import { ReactNode } from "react";
import { IWrapperComponentProps } from "@/types";
import { cn } from "@/utils";

/**
 * A container that centers it's content and provides a consistent width for pages. Used throughout the site as
 * the primary container for a page. Contains arbitrary content.
 */
export const CenteredContainer = (props: IWrapperComponentProps): ReactNode => (
  <div className={cn("flex w-full justify-center", props.className)}>
    <div className="w-11/12 lg:w-10/12 xl:w-9/12">{props.children}</div>
  </div>
);
