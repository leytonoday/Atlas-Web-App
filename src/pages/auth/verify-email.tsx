import { SimpleHead } from "@/components/common";
import { useApiQuery } from "@/hooks";
import { services } from "@/services";
import { useStore } from "@/store";
import { IServerResponse, IServerResponseError } from "@/types";
import {
  axiosErrorToServerResponseErrors,
  handleApiRequestError,
} from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { Spin, Result, Button } from "antd";
import { ResultStatusType } from "antd/lib/result";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface IVerifyEmailProps {
  /**
   * Whether the email was verified successfully
   */
  success: boolean;

  /**
   * The errors returned from the server
   */
  errors?: IServerResponseError[];

  /**
   * The username of the user
   */
  username?: string;

  /**
   * The sign in token returned from the server that is generated after the email is verified
   */
  signInToken?: string;
}

export default function VerifyEmail(props: IVerifyEmailProps) {
  const router = useRouter();
  const store = useStore();

  // The status of the result component
  const [status, setStatus] = useState<ResultStatusType>(
    props.success ? "success" : "error",
  );

  // The title of the result component
  const [title, setTitle] = useState(
    props.success ? "Email verified successfully" : "Email verification failed",
  );

  // The subtitle of the result component
  const [subTitle, setSubTitle] = useState(
    props.success
      ? "Your email has been verified successfully. Redirecting you to the product plans page..."
      : props.errors?.map((x) => x.message).join(". ") ||
          "Your email has not been verified.",
  );

  // Signs the user in if the email is verified successfully. Runs immediately after the component is mounted
  useApiQuery({
    queryKey: ["signInWithToken"],
    queryFn: async () => {
      const signInResponse = await services.api.authentication.signInWithToken({
        identifier: props.username!,
        token: props.signInToken!,
      });

      const whoAmIResult = await services.api.authentication.whoAmI();
      store.setWhoAmI(whoAmIResult.data);

      // Redirect the user to the product plans page
      router.push("/product/plans");
      return signInResponse;
    },
    enabled: props.success, // Only sign in if the email is verified successfully
  });

  // Refresh confirm email mutation
  const {
    mutate: refreshConfirmEmail,
    isLoading: isRefreshConfirmEmailLoading,
  } = useMutation({
    mutationFn: () => services.api.user.refreshConfirmEmail(props.username!),
    onSuccess: () => {
      setStatus("info");
      setTitle("Email verification email re-sent");
      setSubTitle(
        `Verification email has been re-sent to email address for ${props.username}.`,
      );
      setExtraContent([]);
    },
    onError: handleApiRequestError,
  });

  // Extra content for the result component, displayed when the email verification fails
  const failedExtraContent = useMemo(
    () => [
      <Button
        aria-label="Re-send verification email"
        type="primary"
        key="continue"
        onClick={() => refreshConfirmEmail()}
        loading={isRefreshConfirmEmailLoading}
        disabled={
          props.errors?.find((x) => x.message.includes("Invalid token.")) ===
          undefined
        } // Only allow re-sending verification email if the token is invalid
      >
        Re-send verification email
      </Button>,
    ],
    [],
  );

  const [extraContent, setExtraContent] = useState(
    props.success ? null : failedExtraContent,
  );

  return (
    <>
      <SimpleHead title="Verify Email" />
      <Spin spinning={isRefreshConfirmEmailLoading}>
        <Result
          status={status}
          title={title}
          subTitle={subTitle}
          extra={extraContent}
        />
      </Spin>
    </>
  );
}

export async function getServerSideProps(
  context: any,
): Promise<{ props: IVerifyEmailProps }> {
  const token = context.query.token;
  const username = context.query.username;

  // If token or username is not provided, return an error
  if (!token || !username)
    return {
      props: {
        success: false,
        errors: [
          {
            code: "TokenOrUsernameNotProvided",
            message: "Token or Username not provided, this link is invalid.",
          },
        ],
      },
    };

  // Confirm the user's email
  let response: IServerResponse | null = null;
  try {
    response = await services.api.user.confirmUserEmail({
      username,
      token,
    });
  } catch (error: any) {
    const errors = axiosErrorToServerResponseErrors(error);
    return {
      props: {
        success: false,
        username,
        errors,
      },
    };
  }

  return {
    props: {
      success: true,
      username,
      signInToken: response.data,
    },
  };
}
