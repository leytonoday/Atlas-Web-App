import { SimpleHead } from "@/components/common";
import { Result } from "antd";

export default function Features() {
  return (
    <>
      <SimpleHead title="Features" />

      <Result
        status="404"
        title="Coming Soon"
        subTitle="Sorry, the page you visited is under construction."
      />
    </>
  );
}
