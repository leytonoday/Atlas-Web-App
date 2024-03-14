import { SimpleHead } from "@/components/common";
import { Result } from "antd";

export default function NotFound() {
  return (
    <>
      <SimpleHead title="404 Not Found" />
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
      />
    </>
  );
}
