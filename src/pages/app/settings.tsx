import { SimpleHead } from "@/components/common";
import { Result } from "antd";

export default function Settings() {
  return (
    <>
      <SimpleHead title="Settings" />

      <Result
        status="404"
        title="Coming Soon"
        subTitle="Sorry, the page you visited is under construction."
      />
    </>
  );
}
