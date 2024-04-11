import { SimpleHead } from "@/components/common";
import { Result } from "antd";

export default function Contact() {
  return (
    <>
      <SimpleHead title="Contact" />

      <Result
        status="404"
        title="Coming Soon"
        subTitle="Sorry, the page you visited is under construction."
      />
    </>
  );
}
