import { isOnClient } from "@/utils";
import { useEffect, useState } from "react";

/**
 * Returns the current href. There's a use-effect because we want this to run on the client side
 * @returns The current href
 */
export const useCurrentHref = () => {
  const [currentHref, setCurrentHref] = useState<string>("");

  useEffect(() => {
    if (isOnClient()) {
      setCurrentHref(window.location.href);
    }
  }, []);

  return currentHref;
};
