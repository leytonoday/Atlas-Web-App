import type { CodegenConfig } from "@graphql-codegen/cli";
import { strict as assert } from "assert";
import "dotenv/config";

const {
  CONTENTFUL_SPACE_ID,
  CONTENTFUL_PRODUCTION_ACCESS_TOKEN,
  CONTENTFUL_DEVELOPMENT_ACCESS_TOKEN,
  CONTENTFUL_ENVIRONMENT,
} = process.env;

// Will be truthy if all environment variables are set. Will be falsey and throw an error if not.
assert(
  CONTENTFUL_SPACE_ID &&
    CONTENTFUL_PRODUCTION_ACCESS_TOKEN &&
    CONTENTFUL_DEVELOPMENT_ACCESS_TOKEN &&
    CONTENTFUL_ENVIRONMENT,
);

const accessToken =
  CONTENTFUL_ENVIRONMENT === "dev"
    ? CONTENTFUL_DEVELOPMENT_ACCESS_TOKEN
    : CONTENTFUL_PRODUCTION_ACCESS_TOKEN;

const config: CodegenConfig = {
  overwrite: true,
  schema: `https://graphql.contentful.com/content/v1/spaces/${CONTENTFUL_SPACE_ID}?access_token=${accessToken}`,
  documents: "src/graphql/**/*.graphql",
  generates: {
    "src/graphql/generated/": {
      preset: "client",
      config: {
        withHooks: false,
        withHOC: false,
        dedupeFragments: true,
      },
    },
    "./graphql.schema.json": {
      plugins: ["introspection"],
    },
  },
};

export default config;
