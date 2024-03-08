import { PRIMARY_COLOUR, SECONDARY_COLOUR, TEXT_COLOUR } from "./src/data";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "text-color": TEXT_COLOUR,
        primary: PRIMARY_COLOUR,
        "primary-light": PRIMARY_COLOUR + "22",
        secondary: SECONDARY_COLOUR,
        "secondary-light": SECONDARY_COLOUR + "99",
      },
      fontSize: {
        "2xs": "0.625rem",
        "3xs": "0.5rem",
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Required to prevent Tailwind from interfering with the styling of Ant Design components
  },
};
export default config;
