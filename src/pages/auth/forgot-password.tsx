import { z as zod } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useStore } from "@/store";
import { useMutation } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  Heading,
  SimpleControlledInput,
  SimpleHead,
} from "@/components/common";
import { Button } from "antd";
import { services } from "@/services";
import { NotificationStatus } from "@/types";
import Link from "next/link";
import { AiOutlineLock } from "react-icons/ai";
import { AxiosError } from "axios";
import { axiosErrorToServerResponseErrors } from "@/utils";

// Form validation schema
const formValidationSchema = zod.object({
  identifier: zod.string().min(1, { message: "Required" }),
});

type FormSchema = zod.infer<typeof formValidationSchema>;

/**
 * Page to request a forgot password email
 */
export default function ForgotPassword() {
  const store = useStore();

  const { mutateAsync: forgotPassword, isLoading: isForgotPasswordLoading } =
    useMutation({
      mutationFn: (request: { identifier: string }) =>
        services.api.user.forgotPassword(request.identifier),
    });

  const {
    handleSubmit,
    control,
    formState,
    setError,
    reset: resetForm,
  } = useForm<FormSchema>({
    defaultValues: {
      identifier: "",
    },
    resolver: zodResolver(formValidationSchema),
  });

  const onSubmit: SubmitHandler<FormSchema> = async (data) => {
    try {
      await forgotPassword({ identifier: data.identifier });
      store.notification.enqueue({
        status: NotificationStatus.Success,
        description: "Forgot password email sent",
      });
      resetForm();
    } catch (error) {
      const errors = axiosErrorToServerResponseErrors(error as AxiosError);
      setError("identifier", { message: errors[0]?.message });
    }
  };

  return (
    <>
      <SimpleHead title="Forgot Password" />
      <div className="mt-16 flex flex-col items-center">
        <AiOutlineLock className="text-7xl" />
        <Heading level={1} className="mb-4">
          Forgot Password
        </Heading>
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

          <div className="flex w-full justify-center">
            <Button
              type="primary"
              htmlType="submit"
              disabled={!formState.isDirty}
              aria-label="Send forgot password email"
              loading={isForgotPasswordLoading}
            >
              Send
            </Button>
          </div>
        </form>

        <div className="mt-16">
          <span>Know your password?</span>
          <Link href="/auth/sign-in" className="ml-1">
            Sign in
          </Link>
        </div>
      </div>
    </>
  );
}
