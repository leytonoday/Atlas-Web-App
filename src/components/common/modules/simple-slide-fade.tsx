import React, { useState, useEffect, ReactNode } from "react";
import Reveal from "react-awesome-reveal";
import { keyframes } from "@emotion/react";
import { IWrapperComponentProps } from "@/types";

export type SlideDirection =
  | "left-to-right"
  | "right-to-left"
  | "top-to-bottom"
  | "bottom-to-top";

// See link for docs on props https://www.npmjs.com/package/react-awesome-reveal
interface ISimpleSlideFadeProps extends IWrapperComponentProps {
  /**
   * The direction of the slide animation
   */
  direction: SlideDirection;

  /**
   * The distance to slide in pixels. Defaults to 50px.
   */
  slideDistance?: string;

  /**
   * A flag to indicate whether or not the component should fade in. Defaults to false.
   */
  fadeOpacity?: boolean;

  /**
   * A  factor that affects the delay that each animated component in a cascade animation will be assigned.
   */
  damping?: number;

  /**
   * Time in milliseconds to wait before the animation starts.
   */
  delay?: number;

  /**
   * Time in milliseconds for the animation to complete.
   */
  duration?: number;
}

/**
 * This component is used to gracefully animate the entrance of a component into the viewport. It is a wrapper around react-awesome-reveal.
 */
export const SimpleSlideFade = (props: ISimpleSlideFadeProps): ReactNode => {
  // This state and useEffect are an attempt to fix the issue of flickering on page load
  const [visibility, setVisibility] = useState<"hidden" | "visible">("hidden");
  useEffect(() => {
    setVisibility("visible");
  }, []);

  // Convert to minus
  const slideDistance = props.slideDistance?.replaceAll("-", "") || "50px"; // Remove minus sign if any

  const xDirection =
    props.direction === "left-to-right"
      ? `-${slideDistance}`
      : props.direction === "right-to-left"
        ? slideDistance
        : "0";
  const yDirection =
    props.direction === "top-to-bottom"
      ? `-${slideDistance}`
      : props.direction === "bottom-to-top"
        ? slideDistance
        : "0";

  const delay = props.delay || 50;
  const duration = props.duration || 1000;

  const customAnimation = keyframes`
    from {
      ${props.fadeOpacity ? "opacity: 0;" : ""}
      transform: translate3d(${xDirection}, ${yDirection}, 0);
    }

    to {
      ${props.fadeOpacity ? "opacity: 1;" : ""}
      transform: translate3d(0, 0, 0);
    }
  `;

  return (
    <Reveal
      className={props.className}
      style={{ display: visibility }}
      keyframes={customAnimation}
      triggerOnce
      cascade
      damping={props.damping}
      delay={delay}
      duration={duration}
    >
      {props.children}
    </Reveal>
  );
};
