import { BoxButton, SimpleTooltip } from "@/components/common";
import {
  Button,
  message,
  Modal,
  notification,
  Spin,
  Upload,
  UploadFile,
  UploadProps,
} from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AiOutlineFileAdd, AiOutlineUpload } from "react-icons/ai";
import { RcFile, UploadChangeParam } from "antd/lib/upload";
import { useMutation } from "@tanstack/react-query";
import { services } from "@/services";
import { ICreateLegalDocument, NotificationStatus } from "@/types";
import { handleApiRequestError } from "@/utils";
import { useStore } from "@/store";

function readFileToBuffer(file: File): Promise<ArrayBuffer | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) {
        resolve(null);
      }

      resolve(e.target?.result as ArrayBuffer);
    };
    reader.onerror = (e) => {
      reject(e);
    };
    reader.readAsArrayBuffer(file);
  });
}

interface ILegalDocumentUploaderProps {
  onUploadSuccess: () => void;
}

export const LegalDocumentUploader = (props: ILegalDocumentUploaderProps) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const store = useStore();
  const maxFiles = 3;

  const {
    mutateAsync: createLegalDocuments,
    isLoading: isCreateLegalDocumentsLoading,
  } = useMutation({
    mutationFn: (createDocumentRequests: ICreateLegalDocument[]) =>
      services.api.document.createLegalDocuments({
        documents: createDocumentRequests,
      }),
    onError: handleApiRequestError,
  });

  // Whenever the modal is closed, reset the fileList
  useEffect(() => {
    if (!isUploadModalOpen) {
      setFileList([]);
    }
  }, [isUploadModalOpen]);

  /**
   * When the file list changes, update the fileList state
   */
  const handleChange: UploadProps["onChange"] = useCallback(
    (info: UploadChangeParam<UploadFile<any>>) => {
      let newFileList = [...info.fileList];

      // 1. Limit the number of uploaded files
      // Only to show maxFiles recent uploaded files, and old ones will be replaced by the new
      newFileList = newFileList.slice(-maxFiles);

      // 2. Read from response and show file link
      newFileList = newFileList.map((file) => {
        if (file.response) {
          // Component will show file.url as link
          file.url = file.response.url;
        }
        return file;
      });

      setFileList(newFileList);
    },
    [setFileList],
  );

  /**
   * Before the upload, check the file type and size
   */
  const handleUpload: UploadProps["beforeUpload"] = useCallback(
    (file: RcFile) => {
      // Mime types for pdf, docx, txt
      const allowedMimeTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];
      const isAllowed = allowedMimeTypes.includes(file.type);
      if (!isAllowed) {
        message.error("You can only upload PDF, DOCX, TXT files!");
        return Upload.LIST_IGNORE;
      }

      // Check size of file. Max size is 10MB
      const fileSize = file.size / 1024 / 1024;
      if (fileSize > 10) {
        message.error("File must be smaller than 10MB!");
        return Upload.LIST_IGNORE;
      }

      // Check for duplicate files
      const isDuplicate = fileList.some((f) => f.name === file.name);
      if (isDuplicate) {
        message.error("File already uploaded!");
        return Upload.LIST_IGNORE;
      }
    },
    [],
  );

  const uploadProps: UploadProps = useMemo(
    () => ({
      onChange: handleChange,
      beforeUpload: handleUpload,
      multiple: true,
      maxCount: maxFiles,
      accept: ".pdf,.docx,.txt",
    }),
    [handleChange, handleUpload],
  );

  /**
   * Before the upload, extract text from the documents, and then upload them
   */
  const uploadLegalDocuments = useCallback(async () => {
    const createLegalDocumentsData: ICreateLegalDocument[] = [];

    // Extract text from the documents
    for (const file of fileList) {
      const buffer = await readFileToBuffer(file.originFileObj as File);
      if (buffer === null) {
        continue;
      }

      const base64Data = Buffer.from(buffer).toString("base64");
      const mimeType = file.type!;

      createLegalDocumentsData.push({
        mimeType,
        base64Data,
        fileName: file.name,
      });
    }

    if (createLegalDocumentsData.length === 0) {
      message.error("No files to upload!");
      return;
    }

    const response = await createLegalDocuments(createLegalDocumentsData);
    const failedFiles = response.data as string[];

    // Show failed messages
    for (const file of failedFiles) {
      store.notification.enqueue({
        status: NotificationStatus.Error,
        description: `Failed to upload ${file}`,
      });
    }

    const successfullFiles = fileList.filter(
      (file) => !failedFiles.includes(file.name),
    );

    // Show success message
    if (successfullFiles.length > 0) {
      store.notification.enqueue({
        status: NotificationStatus.Success,
        description: `Successfully uploaded ${successfullFiles.length} files`,
      });

      props.onUploadSuccess();
      setIsUploadModalOpen(false);
    }
  }, [fileList]);

  return (
    <>
      <Modal
        title="Upload Document"
        open={isUploadModalOpen}
        closeIcon={true}
        onCancel={() => setIsUploadModalOpen(false)}
        footer={[
          <div className="flex flex-wrap justify-end gap-1" key="1">
            <Button
              aria-label="Upload documents"
              type="primary"
              onClick={uploadLegalDocuments}
              loading={isCreateLegalDocumentsLoading}
              disabled={fileList.length === 0}
            >
              Upload
            </Button>
          </div>,
        ]}
      >
        <Spin spinning={isCreateLegalDocumentsLoading}>
          <p className="text-sm text-gray-500">
            Supports PDF, DOCX, TXT files up to 10MB each.
          </p>
          <Upload {...uploadProps} fileList={fileList}>
            <Button icon={<AiOutlineUpload />}>Upload</Button>
          </Upload>
        </Spin>
      </Modal>
      <SimpleTooltip text="Upload new document">
        <BoxButton
          className="border-dashed border-gray-300"
          onClick={() => setIsUploadModalOpen(true)}
          innerClassName="flex items-center justify-center flex-col"
        >
          <AiOutlineFileAdd className="text-2xl md:text-4xl" />
          <span className="text-xs text-gray-500 text-center">Upload</span>
        </BoxButton>
      </SimpleTooltip>
    </>
  );
};
