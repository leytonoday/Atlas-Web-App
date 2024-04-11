import { CenteredContainer, DynamicIcon, PageTitle } from "@/components/common";
import {
  GetAllLegalDocumentsDocument,
  GetAllLegalDocumentsQuery,
  LegalDocument,
} from "@/graphql/generated/graphql";
import { getCmsClient } from "@/utils";
import { Button, Card, Divider } from "antd";
import Link from "next/link";

/**
 * Returns all legal documents
 */
export const getStaticProps = async () => {
  const cmsClient = getCmsClient();

  const { data } = await cmsClient.query<GetAllLegalDocumentsQuery>({
    query: GetAllLegalDocumentsDocument,
  });

  const legalDocuments = data.legalDocumentCollection?.items;

  return {
    props: {
      legalDocuments,
    },
  };
};

interface IPageProps {
  /**
   * All legal documents
   */
  legalDocuments: LegalDocument[];
}

/**
 * Lists all legal documents
 */
export const LegalPages = ({ legalDocuments }: IPageProps) => {
  return (
    <>
      <PageTitle
        title="Legal Documents"
        subtitle="Foster trust by being transparent; delve into our legal policies."
      />
      <CenteredContainer>
        <div className="flex w-full flex-col items-center gap-8 md:flex-row md:items-stretch md:justify-evenly">
          {legalDocuments.map((legalDocument, index) => (
            <Link
              key={legalDocument.slug}
              href={`/company/legal/${legalDocument.slug}`}
              className="w-11/12 text-inherit no-underline md:w-6/12 lg:w-4/12"
              aria-label={`Read our ${legalDocument.title}`}
            >
              <div className="my-4 text-xl underline">
                {legalDocument.title}
              </div>
              <div className="text-base">{legalDocument.description}</div>
            </Link>
          ))}
        </div>
      </CenteredContainer>
    </>
  );
};
export default LegalPages;
