import { BoxButton, SimpleTooltip } from "@/components/common";
import {
  ILegalDocument,
  ILegalDocumentSummary,
  LegalDocumentProcessingStatus,
  NotificationStatus,
} from "@/types";
import { Button, Modal, notification, Result, Spin } from "antd";
import {
  AiOutlineCheckCircle,
  AiOutlineCompress,
  AiOutlineReload,
  AiOutlineTranslation,
} from "react-icons/ai";
import { mimeTypeToIcon } from "./common/mime-type-to-icon";
import { useApiQuery, useLoadingCombinator } from "@/hooks";
import { services } from "@/services";
import { useMutation } from "@tanstack/react-query";
import { cn, handleApiRequestError } from "@/utils";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/store";

interface ILegalDocumentModalProps {
  isModalOpen: boolean;
  onClose: () => void;
  legalDocument: ILegalDocument | null;
}

export const LegalDocumentModal = (props: ILegalDocumentModalProps) => {
  const store = useStore();
  const [createSummaryStarted, setCreateSummaryStarted] = useState(false);
  const [notificationApi, context] = notification.useNotification();

  const [innerModalOpen, setInnerModalOpen] = useState(false);
  const [innerModalMode, setInnerModalMode] = useState<
    "summary" | "translation"
  >("summary");

  useEffect(() => {
    setCreateSummaryStarted(false);
  }, [props.isModalOpen]);

  const {
    isLoading: isLegalDocumentSummaryLoading,
    data: legalDocumentSummary,
    refetch: refetchLegalDocumentSummary,
  } = useApiQuery<ILegalDocumentSummary | null>({
    queryKey: [
      "getLegalDocumentSummary",
      props.legalDocument?.id,
      props.isModalOpen,
    ],
    queryFn: () =>
      services.api.document.getLegalDocumentSummary(
        props.legalDocument?.id || "",
      ),
    enabled: props.legalDocument !== null && props.isModalOpen,
  });

  const {
    mutate: createLegalDocumentSummary,
    isLoading: isCreateLegalDocumentSummaryLoading,
  } = useMutation({
    mutationFn: (legalDocumentId: string) =>
      services.api.document.createLegalDocumentSummary(legalDocumentId),
    onSuccess: () => {
      refetchLegalDocumentSummary();
    },
    onError: handleApiRequestError,
  });

  const isSummaryLoading = useLoadingCombinator(
    isLegalDocumentSummaryLoading,
    isCreateLegalDocumentSummaryLoading,
    legalDocumentSummary?.processingStatus ===
      LegalDocumentProcessingStatus.NOT_STARTED ||
      legalDocumentSummary?.processingStatus ===
        LegalDocumentProcessingStatus.PROCESSING,
  );

  const summaryButtonLabel = useMemo(() => {
    switch (legalDocumentSummary?.processingStatus) {
      case LegalDocumentProcessingStatus.NOT_STARTED:
        return "Summary Pending...";
      case LegalDocumentProcessingStatus.PROCESSING:
        return "Summary Processing...";
      case LegalDocumentProcessingStatus.COMPLETE:
        return "Open Summary";
      default:
        return "Create Summary";
    }
  }, [legalDocumentSummary?.processingStatus]);

  const innerModalTitle = useMemo(() => {
    switch (innerModalMode) {
      case "summary":
        return legalDocumentSummary?.summarizedTitle;
      case "translation":
        return "Translation";
    }
  }, [innerModalMode, legalDocumentSummary, props.legalDocument]);

  return (
    <>
      <Modal
        title={props.legalDocument?.name || ""}
        open={props.isModalOpen}
        onCancel={props.onClose}
        footer={null}
      >
        {context}
        {props.legalDocument === null ? (
          <Spin />
        ) : (
          <div>
            <div className="flex flex-wrap justify-between py-4">
              <BoxButton innerClassName="flex items-center justify-center flex-col text-center">
                {mimeTypeToIcon(props.legalDocument.mimeType)}
                <span className="text-xs">Open Original</span>
              </BoxButton>

              <BoxButton innerClassName="flex items-center justify-center flex-col text-center">
                <AiOutlineTranslation className="text-2xl md:text-4xl" />
                <span className="text-xs">Create Translation</span>
              </BoxButton>

              <Spin spinning={isSummaryLoading || createSummaryStarted}>
                <BoxButton
                  disabled={isSummaryLoading}
                  innerClassName="flex items-center justify-center flex-col text-center"
                  className={cn({
                    "border-dashed border-gray-300": !legalDocumentSummary,
                  })}
                  onClick={() => {
                    if (!legalDocumentSummary) {
                      createLegalDocumentSummary(props.legalDocument!.id);
                      setCreateSummaryStarted(true);
                      notificationApi.success({
                        message: "Success",
                        description: "Summary queued for creation",
                      });
                    } else {
                      setInnerModalOpen(true);
                      setInnerModalMode("summary");
                    }
                  }}
                >
                  {createSummaryStarted ? (
                    <>
                      <AiOutlineCheckCircle className="!text-primary text-2xl md:text-4xl" />
                      <span className="text-xs">Creating...</span>
                    </>
                  ) : (
                    <>
                      <AiOutlineCompress className="text-2xl md:text-4xl" />
                      <span className="text-xs">{summaryButtonLabel}</span>
                    </>
                  )}
                </BoxButton>
              </Spin>
            </div>
            <div className="flex justify-center">
              <Button danger>Delete</Button>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        title={innerModalTitle}
        open={innerModalOpen}
        onCancel={() => setInnerModalOpen(false)}
        footer={null}
        className="!w-11/12 md:!w-8/12"
      >
        {innerModalMode === "summary" ? (
          <span>{legalDocumentSummary?.summarisedText}</span>
        ) : (
          <span>Translation</span>
        )}
      </Modal>
    </>
  );
};
