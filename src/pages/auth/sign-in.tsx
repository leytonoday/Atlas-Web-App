import {
  Heading,
  SimpleControlledInput,
  SimpleHead,
} from "@/components/common";
import { useApiQuery } from "@/hooks";
import { services } from "@/services";
import {
  IServerResponse,
  ISignInRequest,
  UserRole,
  serverErrorCodes,
} from "@/types";
import {
  axiosErrorToServerResponseErrors,
  handleApiRequestError,
} from "@/utils";
import { Button, Modal, notification } from "antd";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import { AiOutlineLogin } from "react-icons/ai";
import { AxiosError } from "axios";
import { useState } from "react";
import { z as zod } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useStore } from "@/store";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";

// Form validation schema
const formValidationSchema = zod.object({
  identifier: zod.string().min(1, { message: "Required" }),
  password: zod.string().min(1, { message: "Required" }),
});

type FormSchema = zod.infer<typeof formValidationSchema>;

export default function SignIn() {
  const router = useRouter();
  const [notificationApi] = notification.useNotification();

  const store = useStore();

  const [emailVerificationRequired, setEmailVerificationRequired] =
    useState(false);

  // Sign up mutation
  const {
    mutateAsync: signIn,
    isLoading: isSignInLoading,
    status: signInStatus,
  } = useMutation({
    mutationFn: (request: ISignInRequest) =>
      services.api.authentication.signIn(request),
  });

  useApiQuery({
    queryKey: ["whoAmI"],
    queryFn: async () => {
      const response = await services.api.authentication.whoAmI();
      store.setWhoAmI(response.data);
      return response;
    },
    enabled: signInStatus === "success", // Only fetch the user if the user is signed in
  });

  // Refresh confirm email mutation
  const {
    mutateAsync: refreshConfirmEmail,
    isLoading: isRefreshConfirmEmailLoading,
  } = useMutation({
    mutationFn: () =>
      services.api.user.refreshConfirmEmail(getFormValues().identifier),
    onSuccess: () => {
      notificationApi.success({
        message: "Success",
        description: `Verification email has been re-sent.`,
      });
    },
    onError: handleApiRequestError,
  });

  const {
    handleSubmit,
    control,
    formState,
    setError,
    getValues: getFormValues,
  } = useForm<FormSchema>({
    defaultValues: {
      identifier: "",
      password: "",
    },
    resolver: zodResolver(formValidationSchema),
  });

  const onSubmit: SubmitHandler<FormSchema> = async (data) => {
    try {
      await signIn(data);

      const response: PromiseSettledResult<IServerResponse>[] =
        (await Promise.allSettled([
          services.api.authentication.whoAmI(),
          services.api.stripe.getMySubscription(),
        ])) || [];

      const [whoAmI, mySubscription] = response.map(
        (result) => result.status === "fulfilled" && result.value.data,
      );

      // If the user is an admin, then redirect them to the admin dashboard
      if (whoAmI.roles.includes(UserRole.Administrator)) {
        router.push("/admin/plans");
        return;
      }

      // If the user doesn't have a planId, AND they don't have a subscription, then they need to select a plan
      else if (whoAmI.planId === null && mySubscription === null) {
        router.push("/product/plans");
        return;
      }

      // If the user doesn't have a planId, but they DO have a subscription, then this will mean that their planId has been revoked because of an past_due payment
      else if (whoAmI.planId === null && whoAmI !== null) {
        router.push("/account-settings/manage-subscription");
        return;
      }

      // If the user has a planId, and they have a subscription, but they aren't an admin, then they can go to their subscription page
      else {
        router.push("/account-settings/manage-subscription");
      }
    } catch (error) {
      const errors = axiosErrorToServerResponseErrors(error as AxiosError);

      // Check if the error is about email verification
      if (errors[0]?.code === serverErrorCodes.user.MustVerifyEmail)
        setEmailVerificationRequired(true);
      else {
        // If not, then it'll be an error about incorrect credentials
        setError("identifier", { message: errors[0]?.message });
        setError("password", { message: errors[0]?.message });
      }
    }
  };

  return (
    <>
      {/* Email verification required modal */}
      <Modal
        title="Email verification required"
        open={emailVerificationRequired}
        closeIcon={false}
        footer={[
          <div className="flex flex-wrap justify-end gap-1" key="1">
            <Button
              aria-label="Resend verification email"
              style={{ width: "fit-content" }}
              onClick={() => refreshConfirmEmail()}
              loading={isRefreshConfirmEmailLoading}
            >
              Resend verification email
            </Button>

            <Button
              aria-label="I've verified my email"
              type="primary"
              style={{ width: "fit-content" }}
              onClick={() => {
                setEmailVerificationRequired(false);
                onSubmit(getFormValues());
              }}
            >
              I've verified my email
            </Button>
          </div>,
        ]}
      >
        <p>
          A verification email has already been sent to{" "}
          {getFormValues().identifier}. Please check your inbox and follow the
          instructions to verify your email.
        </p>
      </Modal>

      <SimpleHead title="Sign in" />

      <div className="mt-16 flex flex-col items-center">
        <AiOutlineLogin className="text-7xl" />
        <Heading level={1} className="mb-4">
          Sign in
        </Heading>

        {/* The sign in form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 flex w-10/12 flex-col items-center gap-4 sm:w-6/12 md:w-[22rem]"
        >
          <SimpleControlledInput
            control={control}
            name="identifier"
            label="Username or email"
            placeholder="Enter username or email"
            formState={formState}
          />

          <SimpleControlledInput
            control={control}
            name="password"
            label="Password"
            placeholder="Enter password"
            formState={formState}
            inputType="password"
          />

          <div className="w-full text-left">
            <Link href="/auth/forgot-password">Forgot password?</Link>
          </div>

          <div className="flex w-full justify-center">
            <Button
              type="primary"
              htmlType="submit"
              disabled={!formState.isDirty}
              aria-label="Sign in"
              loading={isSignInLoading}
            >
              Sign in
            </Button>
          </div>
        </form>

        <div className="mt-16">
          <span>Don't have an account yet?</span>
          <Link href="/auth/sign-up" className="ml-1">
            Sign up
          </Link>
        </div>
      </div>
    </>
  );
}
