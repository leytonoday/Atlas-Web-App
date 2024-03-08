import {
  ApolloClient,
  from,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import "dotenv/config";

const {
  CONTENTFUL_SPACE_ID,
  CONTENTFUL_PRODUCTION_ACCESS_TOKEN,
  CONTENTFUL_DEVELOPMENT_ACCESS_TOKEN,
  CONTENTFUL_ENVIRONMENT,
} = process.env;

const accessToken =
  CONTENTFUL_ENVIRONMENT === "dev"
    ? CONTENTFUL_DEVELOPMENT_ACCESS_TOKEN
    : CONTENTFUL_PRODUCTION_ACCESS_TOKEN;

// The URL for the GraphQL endpoint. If in dev, use the preview token. Otherwise, use the public token.
const httpLink = new HttpLink({
  uri: `https://graphql.contentful.com/content/v1/spaces/${CONTENTFUL_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT}?access_token=${accessToken}`,
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.map(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(
          locations,
        )}, Path: ${path}`,
      ),
    );
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

const appLink = from([errorLink, httpLink]);

export const getCmsClient = (): ApolloClient<NormalizedCacheObject> =>
  new ApolloClient({
    link: appLink,
    cache: new InMemoryCache(),
  });
