import { SimpleHead, SimpleTooltip } from "@/components/common";
import { LegalDocument } from "@/components/pages/app/my-documents/legal-document";
import { LegalDocumentModal } from "@/components/pages/app/my-documents/legal-document-modal";
import { LegalDocumentUploader } from "@/components/pages/app/my-documents/legal-document-uploader";
import { useApiQuery } from "@/hooks";
import { services } from "@/services";
import { useStore } from "@/store";
import { ILegalDocument, NotificationStatus } from "@/types";
import { Button, Card, Spin } from "antd";
import { useCallback, useState } from "react";

export default function MyLegalDocuments() {
  const [isLegalDocumentModalOpen, setIsLegalDocumentModalOpen] =
    useState(false);
  const [selectedLegalDocument, setSelectedLegalDocument] =
    useState<ILegalDocument | null>(null);

  const onLegalDocumentModalClose = useCallback(() => {
    setIsLegalDocumentModalOpen(false);
    setSelectedLegalDocument(null);
  }, []);

  // Get my upcoming invoice
  const {
    isLoading: isLegalDocumentsLoading,
    data: legalDocuments,
    refetch: refetchLegalDocuments,
  } = useApiQuery<ILegalDocument[]>({
    queryKey: ["getLegalDocuments"],
    queryFn: () => services.api.document.getLegalDocuments(),
  });

  return (
    <>
      <SimpleHead title="My Documents" />

      <LegalDocumentModal
        isModalOpen={isLegalDocumentModalOpen}
        onClose={onLegalDocumentModalClose}
        legalDocument={selectedLegalDocument}
        onDeleted={async () => {
          refetchLegalDocuments();
          onLegalDocumentModalClose();
        }}
      />

      <Card title="My Documents" size={"default"} className="w-full">
        <Spin spinning={isLegalDocumentsLoading}>
          <div className="flex flex-wrap gap-4">
            <LegalDocumentUploader
              onUploadSuccess={() => {
                refetchLegalDocuments();
              }}
            />
            {legalDocuments?.map((document, index) => (
              <LegalDocument
                onClick={() => {
                  setSelectedLegalDocument(document);
                  setIsLegalDocumentModalOpen(true);
                }}
                key={index}
                document={document}
              />
            ))}
          </div>
        </Spin>
      </Card>
    </>
  );
}
