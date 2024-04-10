import { IWrapperComponentProps } from "@/types";
import { cn } from "@/utils";

interface IBoxButtonProps extends IWrapperComponentProps {
  onClick?: () => void;
  children: React.ReactNode;
  innerClassName?: string;
  disabled?: boolean;
}

export const BoxButton = (props: IBoxButtonProps) => {
  return (
    <div
      onClick={props.onClick}
      className={cn(
        "relative w-24 h-24 md:w-32 md:h-32 border border-solid border-gray-200 rounded-lg p-1 cursor-pointer hover:border-gray-300 transition-all duration-200 ease-in-out",
        props.className,
        {
          "pointer-events-none opacity-50": props.disabled,
        },
      )}
    >
      <div
        className={cn(
          "bg-gray-100 hover:bg-gray-200 p-1 w-full h-full rounded-lg gap-2 transition-all duration-200 ease-in-out",
          props.innerClassName,
        )}
      >
        {props.children}
      </div>
    </div>
  );
};
