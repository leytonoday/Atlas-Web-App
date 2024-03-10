import {
  Heading,
  SimpleControlledInput,
  SimpleHead,
} from "@/components/common";
import { services } from "@/services";
import { IServerResponseError } from "@/types";
import {
  axiosErrorToServerResponseErrors,
  handleApiRequestError,
} from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button, Result } from "antd";
import { ResultStatusType } from "antd/lib/result";
import { AxiosError } from "axios";
import Link from "next/link";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { AiOutlineCloseCircle, AiOutlineLock } from "react-icons/ai";
import { z as zod } from "zod";

// Form validation schema
const formValidationSchema = zod
  .object({
    password: zod.string().min(1, { message: "Required" }),
    confirmPassword: zod.string().min(1, { message: "Required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    // Check if passwords match
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

type FormSchema = zod.infer<typeof formValidationSchema>;

interface IResetPasswordProps {
  /**
   * Determines if the initial error should be shown, rather than the form
   */
  showInitialError: boolean;

  /**
   * The errors to show
   */
  errors?: IServerResponseError[];

  /**
   * The username of the user to reset the password for
   */
  username?: string;

  /**
   * The token to reset the password with
   */
  token?: string;
}

/**
 * Used to reset a user's password
 */
export default function ResetPassword(props: IResetPasswordProps) {
  const [errors, _] = useState<IServerResponseError[]>(props.errors || []);
  const [status, setStatus] = useState<ResultStatusType | null>(
    props.showInitialError ? "error" : null,
  );

  const { mutateAsync: resetPassword, isLoading: isResetPasswordLoading } =
    useMutation({
      mutationFn: () =>
        services.api.user.resetPassword({
          username: props.username!,
          token: props.token!,
          newPassword: getFormValues().password,
        }),
    });

  // Form
  const {
    handleSubmit,
    control,
    formState,
    setError,
    getValues: getFormValues,
  } = useForm<FormSchema>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(formValidationSchema),
  });

  /**
   * Handles the form submission
   * @param data The form data
   */
  const onSubmit: SubmitHandler<FormSchema> = async () => {
    try {
      await resetPassword();
      setStatus("success");
    } catch (error) {
      debugger;
      const errors = axiosErrorToServerResponseErrors(error as AxiosError);
      if (errors[0].message.includes("password")) {
        setError("password", { message: errors[0].message });
      } else {
        handleApiRequestError(error);
      }
    }
  };

  return (
    <>
      <SimpleHead title="Reset Password" />

      {status === null && (
        <div className="mt-16 flex flex-col items-center">
          <AiOutlineLock className="text-7xl" />
          <Heading level={1} className="mb-4">
            Reset Password
          </Heading>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-4 flex w-10/12 flex-col items-center gap-4 sm:w-6/12 md:w-[22rem]"
          >
            <SimpleControlledInput
              control={control}
              name="password"
              label="Password"
              placeholder="Enter password"
              formState={formState}
            />

            <SimpleControlledInput
              control={control}
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Confirm password"
              formState={formState}
            />

            <div className="flex w-full justify-center">
              <Button
                type="primary"
                htmlType="submit"
                disabled={!formState.isDirty}
                aria-label="Reset password"
                loading={isResetPasswordLoading}
              >
                Reset password
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
      )}

      {status === "success" && (
        <Result
          status={status}
          title={"Password Reset"}
          subTitle={"Your password has been reset."}
        />
      )}

      {errors.length && status === "error" ? (
        <>
          <Result
            status={status}
            title={"Error Resetting Password"}
            subTitle={"Your password has been not reset."}
          />
        </>
      ) : null}

      {errors.length > 0 && (
        <div>
          {(errors || [])?.map((error, i) => (
            <div key={i} className="flex items-center justify-center gap-2">
              <AiOutlineCloseCircle style={{ color: "red" }} />
              <div>{error.message}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export async function getServerSideProps(
  context: any,
): Promise<{ props: IResetPasswordProps }> {
  const token = context.query.token || "";
  const username = context.query.username || "";

  console.log(token);

  // If the URL doesn't have a token or username, show an error
  if (!token || !username)
    return {
      props: {
        showInitialError: true,
        username,
        token,
        errors: [
          {
            code: "TokenOrUsernameNotProvided",
            message: "Token or Username not provided, this link is invalid.",
          },
        ],
      },
    };

  return {
    props: {
      showInitialError: false,
      username,
      token,
    },
  };
}
