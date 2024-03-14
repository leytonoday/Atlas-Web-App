import { Result } from "antd";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { SimpleHead } from "@/components/common";

type CheckoutFailureReason = "invalid-interval" | "unknown" | undefined;

interface ICheckoutResultProps {
  /**
   * Whether the checkout was successful.
   */
  success: boolean;

  /**
   * The reason for the checkout failure, if any.
   */
  reason: CheckoutFailureReason | null;
}

/**
 * The result page for the checkout process. Will redirect the user to their subscription page if the checkout was successful.
 */
export default function CheckoutResult(props: ICheckoutResultProps) {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      if (props.success) {
        router.push("/account-settings/manage-subscription");
      }
    }, 3000);
  }, []);

  return (
    <>
      <SimpleHead title="Checkout Result" />
      <div>
        <Result
          status={props.success ? "success" : "error"}
          title={`Checkout ${props.success ? "Successful" : "Failed"}`}
          subTitle={
            props.success
              ? "Redirecting you to your subscription..."
              : props.reason || "Unknown error"
          }
          extra={[]}
        />
      </div>
    </>
  );
}

export async function getServerSideProps(
  context: any,
): Promise<{ props: ICheckoutResultProps }> {
  const success = (context.query.success || false) === "true";
  const reason: CheckoutFailureReason | null = context.query.reason || null;

  return {
    props: {
      success,
      reason: reason,
    },
  };
}
