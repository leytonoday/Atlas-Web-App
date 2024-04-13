import { Button, Result } from "antd";
import Link from "next/link";

/**
 * Used to display a message to the user when they are not subscribed to a plan.
 */
export const MyPlanNotSubscribed = () => (
  <Result
    title="You are not subscribed to a plan"
    subTitle="You have an account, but your account does not have access to the Legal Lighthouse application. If you have just purchased a plan, please wait one minute for your subscription to be processed."
    status="info"
    extra={
      <Link href="/product/plans">
        <Button type="primary" aria-label="View Plans">
          View Plans
        </Button>
      </Link>
    }
  />
);
