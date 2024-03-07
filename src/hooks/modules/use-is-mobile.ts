import { isOnClient } from "@/utils";
import { useEffect, useState } from "react";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "@/../tailwind.config";

const fullConfig = resolveConfig(tailwindConfig);

/**
 * Programmatically checks if the screen is mobile size.
 * Uses the Tailwind md breakpoint to determine the screen size.
 * @returns true if the screen is mobile size
 */
export const useIsMobileScreen = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  const breakpoint = parseInt(
    // @ts-ignore
    fullConfig.theme.screens.md.replace("px", ""),
    10,
  );
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!isOnClient()) {
      setIsMobile(false);
      return;
    }

    const checkIsMobile = () => setIsMobile(window.innerWidth <= breakpoint);
    checkIsMobile(); // Check initial screen width

    window.addEventListener("resize", checkIsMobile);
    // eslint-disable-next-line consistent-return
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, [breakpoint]);

  return isMobile;
};
