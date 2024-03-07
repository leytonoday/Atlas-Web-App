import { theme } from "antd";
import { PRIMARY_COLOUR, TEXT_COLOUR } from "@/data";
import { type AliasToken } from "antd/lib/theme/internal";
import { type OverrideToken } from "antd/lib/theme/interface";

export const token: Partial<AliasToken> = {
  colorPrimary: PRIMARY_COLOUR,
  colorText: TEXT_COLOUR,
};

// Incase you need to override any component. Some components don't follow the theme config. See https://ant.design/docs/react/customize-theme
export const components: OverrideToken = {
  Layout: {
    colorBgHeader: token.colorBgContainer,
  },
};

export const themeConfig = {
  algorithm: theme.defaultAlgorithm,
  token,
  components,
};
