import { SimpleHead } from "@/components/common";
import { Result } from "antd";

export default function Forbidden() {
  return (
    <>
      <SimpleHead title="403 Forbidden" />
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
      />
    </>
  );
}
