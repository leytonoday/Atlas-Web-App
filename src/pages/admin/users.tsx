import { SimpleHead } from "@/components/common";
import { Result } from "antd";

export default function Users() {
  return (
    <>
      <SimpleHead title="Users" />

      <Result
        status="404"
        title="Coming Soon"
        subTitle="Sorry, the page you visited is under construction."
      />
    </>
  );
}
