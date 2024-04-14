import Head from "next/head";
import { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

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
  const pathname = usePathname();

  const title = props.omitSuffix
    ? props.title
    : `${props.title} | Legal Lighthouse`;

  const description =
    props.description ||
    "A next-generation AI legal document assistance platform.";

  return (
    <Head>
      <title>{title}</title>

      <meta name="description" content={description} />

      <meta property="og:title" content={title} />

      <meta name="og:description" content={description} />

      <meta property="og:image" content="/logo.png" />
      <meta property="og:url" content={pathname} />
      <meta property="og:type" content="website" />
    </Head>
  );
};
