import { SimpleHead } from "@/components/common";
import { Result } from "antd";

export default function Home() {
  return (
    <>
      <SimpleHead
        title="Legal Lighthouse - Empowering Legal Accessibility"
        omitSuffix
      />

      <Result
        status="404"
        title="Coming Soon"
        subTitle="Sorry, the page you visited is under construction."
      />
    </>
  );
}
