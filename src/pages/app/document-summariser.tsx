import type { UploadProps } from "antd";
import { Button, message, Upload } from "antd";
import { UploadFile } from "antd/lib";
import { useState } from "react";
import { AiOutlineInbox } from "react-icons/ai";

const { Dragger } = Upload;

export default function DocumentSummariser() {
  return (
    <div className="flex justify-center md:justify-start">
      <div className="w-11/12 xl:w-6/12">
        <br />
        {/* <div className="flex justify-center">
          <Button type="primary" disabled={fileList.length === 0}>
            Summarise Files {fileList.length > 0 && `(${fileList.length} files selected)`}
          </Button>
        </div> */}
      </div>
    </div>
  );
}
