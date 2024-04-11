import { CenteredContainer, PageTitle, SimpleHead } from "@/components/common";
import {
  GetAllLegalDocumentsDocument,
  GetAllLegalDocumentsQuery,
  GetLegalDocumentBySlugDocument,
  GetLegalDocumentBySlugQuery,
  LegalDocument,
} from "@/graphql/generated/graphql";
import { getCmsClient } from "@/utils";
import { GetStaticProps } from "next";
import dateFormat from "dateformat";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";

/**
 * Creates all the paths for the legal documents
 * @returns All legal documents
 */
export const getStaticPaths = async () => {
  const cmsClient = getCmsClient();

  const { data } = await cmsClient.query<GetAllLegalDocumentsQuery>({
    query: GetAllLegalDocumentsDocument,
  });

  const paths = data.legalDocumentCollection?.items.map((legalDocument) => ({
    params: {
      slug: legalDocument?.slug ?? "/",
    },
  }));

  return {
    paths,
    fallback: false,
  };
};

/**
 * Returns the legal document by slug
 */
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;

  const cmsClient = getCmsClient();

  // Get the legal document by slug
  const { data } = await cmsClient.query<GetLegalDocumentBySlugQuery>({
    query: GetLegalDocumentBySlugDocument,
    variables: {
      slug,
    },
  });

  // If no legal document is found, return 404
  if (!data.legalDocumentCollection?.items?.length) {
    return {
      notFound: true,
    };
  }

  // Return the legal document
  const legalDocument = data.legalDocumentCollection?.items[0];
  return {
    props: {
      legalDocument,
    },
  };
};

interface IPageProps {
  /**
   * The legal document
   */
  legalDocument: LegalDocument;
}

/**
 * Shows the details of a legal document
 */
export default function LegalPage({ legalDocument }: IPageProps) {
  return (
    <>
      <SimpleHead title={legalDocument.title!} />

      <CenteredContainer>
        <PageTitle
          title={legalDocument.title!}
          subtitle={legalDocument.description!}
        />

        <div>
          <span>Last Updated: {dateFormat(legalDocument.sys.publishedAt)}</span>
          <div>{documentToReactComponents(legalDocument.body?.json)}</div>
        </div>
      </CenteredContainer>
    </>
  );
}
