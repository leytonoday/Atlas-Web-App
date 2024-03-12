import AiIcons from "react-icons/ai/index";
import MdIcons from "react-icons/md/index";

/**
 * Returns an object containing all available icons.
 */
export function getAllIcons() {
  return {
    ...AiIcons,
    ...MdIcons,
  };
}
