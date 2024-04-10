import { IWrapperComponentProps } from "@/types";
import { cn } from "@/utils";
import { ReactNode } from "react";

interface IHeadingProps extends IWrapperComponentProps {
  /**
   * HTML heading level to use. 1 is the largest, 5 is the smallest.
   */
  level: 1 | 2 | 3 | 4 | 5;
}

/**
 * A heading that has a consistent font weight and size depending on the size prop. Used as titles or subtitles.
 */
export const Heading = (props: IHeadingProps): ReactNode => {
  const sizeClasses: Record<number, string> = {
    1: "text-2xl md:text-3xl lg:text-4xl",
    2: "text-xl md:text-2xl lg:text-3xl",
    3: "text-lg md:text-xl lg:text-2xl",
    4: "text-base md:text-lg lg:text-xl",
    5: "text-sm md:text-base lg:text-lg",
  };

  const completeClassName = cn(
    sizeClasses[props.level],
    "font-semibold",
    props.className,
  );

  switch (props.level) {
    case 1:
      return <h1 className={completeClassName}>{props.children}</h1>;
    case 2:
      return <h2 className={completeClassName}>{props.children}</h2>;
    case 3:
      return <h3 className={completeClassName}>{props.children}</h3>;
    case 4:
      return <h4 className={completeClassName}>{props.children}</h4>;
    case 5:
      return <h5 className={completeClassName}>{props.children}</h5>;
  }
};
