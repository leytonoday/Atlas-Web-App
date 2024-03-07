import Head from "next/head";
import { ReactNode } from "react";
import { useRouter } from "next/router";

interface ISimpleHeadProps {
  /**
   * The tab title of the page
   */
  title: string;

  /**
   * The description of the page
   */
  description?: string;

  /**
   * Whether or not to omit the suffix of the title
   */
  omitSuffix?: boolean;
}

/**
 * A component that sets the head of the page, including the title, description, and OpenGraph tags.
 */
export const SimpleHead = (props: ISimpleHeadProps): ReactNode => {
  const router = useRouter();

  const title = props.omitSuffix ? props.title : `${props.title} | Atlas`;

  const description =
    props.description ||
    "A next-generation AI legal document assistance platform.";

  return (
    <Head>
      <title>{title}</title>

      <meta name="description" content={description} />

      <meta property="og:title" content={title} />

      <meta name="og:description" content={description} />

      <meta property="og:image" content="/icon.png" />
      <meta property="og:url" content={router.pathname} />
      <meta property="og:type" content="website" />
    </Head>
  );
};
