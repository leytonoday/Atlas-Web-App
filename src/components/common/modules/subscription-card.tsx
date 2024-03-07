import { IPlan } from "@/types";
import Image from "next/image";
import { DynamicIcon } from "./dynamic-icon";

export interface ISubscriptionCardProps {
  /**
   * The plan to display in the card
   */
  plan: IPlan;

  /**
   * The interval to display in the card
   */
  interval?: "month" | "year";

  /**
   * The title to display in the card
   */
  title: string;
}

export const SubscriptionCard = (props: ISubscriptionCardProps) => (
  <div className="flex items-center gap-4">
    <div>
      <Image
        src="/icon.png"
        alt="Atlas Logo"
        width={150}
        height={150}
        className="h-auto w-20"
      />
    </div>

    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-lg font-semibold opacity-75">
        <span>
          {props.title} {props.plan.name}
        </span>
        <DynamicIcon
          iconName={props.plan.icon}
          iconColour={props.plan.iconColour}
          className="text-2xl"
        />
      </div>

      <div className="text-sm opacity-75">{props.plan.description}</div>
    </div>
  </div>
);
