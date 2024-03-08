import {
  Heading,
  SimpleControlledInput,
  SimpleHead,
  SimpleSlideFade,
  SimpleTooltip,
} from "@/components/common";
import { axiosErrorToServerResponseErrors, getCmsClient } from "@/utils";
import { Button, Checkbox, Form, Result } from "antd";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { AiOutlineUserAdd } from "react-icons/ai";
import { z as zod } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ISignUpRequest } from "@/types";
import { services } from "@/services";
import { AxiosError } from "axios";
import {
  GetAllLegalDocumentsDocument,
  GetAllLegalDocumentsQuery,
  LegalDocument,
} from "@/graphql/generated/graphql";
import { useMutation } from "@tanstack/react-query";

// Form validation schema
const formValidationSchema = zod
  .object({
    username: zod.string().min(1, { message: "Required" }).max(100),
    email: zod.string().email().min(1, { message: "Required" }),
    password: zod.string().min(1, { message: "Required" }),
    confirmPassword: zod.string().min(1, { message: "Required" }),
    agreeToAll: zod
      .boolean()
      .refine((value) => value === true, { message: "Required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    // Check if passwords match
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

type FormSchema = zod.infer<typeof formValidationSchema>;

interface ISignUpProps {
  legalDocuments: LegalDocument[];
}

/**
 * The sign up page
 */
export default function SignUp(props: ISignUpProps) {
  const [isSignUpComplete, setIsSignUpComplete] = useState(false);

  // Sign up mutation
  const { mutateAsync: signUp, isLoading: isSignUpLoading } = useMutation({
    mutationFn: (request: ISignUpRequest) => services.api.user.signUp(request),
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
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToAll: false,
    },
    resolver: zodResolver(formValidationSchema),
  });

  /**
   * Handles the form submission
   * @param data The form data
   */
  const onSubmit: SubmitHandler<FormSchema> = async (data: FormSchema) => {
    try {
      await signUp({
        userName: data.username,
        email: data.email,
        password: data.password,
      });
      setIsSignUpComplete(true);
    } catch (error) {
      const errors = axiosErrorToServerResponseErrors(error as AxiosError);

      // If an error includes the name of a field, set that field's error to the error message
      for (const field of ["username", "email", "password"]) {
        const error = errors.find((x) =>
          x.message.toLowerCase().includes(field),
        );
        if (!error) continue;

        setError(field as keyof FormSchema, { message: error.message });
      }
    }
  };

  /**
   * If sign up is complete, show a message telling the user to check for verification email
   */
  if (isSignUpComplete) {
    return (
      <Result
        status={"info"}
        title={"Verify your email"}
        subTitle={`Check email inbox for '${
          getFormValues().email
        }', and click 'Confirm Email' to complete sign up.`}
      />
    );
  }

  return (
    <>
      <SimpleHead title="Sign up" />

      <SimpleSlideFade
        direction="bottom-to-top"
        slideDistance="50px"
        fadeOpacity
        damping={0.1}
        delay={250}
      >
        <div className="flex w-full justify-center">
          <div className="mt-4 flex w-11/12 flex-col md:mt-16 md:flex-row lg:w-[65rem]">
            {/* Right */}
            <div className="flex w-full flex-col items-center justify-center rounded-t-3xl bg-secondary-light px-2 py-8 md:h-full md:w-1/2 md:rounded-l-3xl md:rounded-tr-none md:px-4">
              <AiOutlineUserAdd className="text-7xl" />
              <Heading level={1} className="mb-4">
                Sign up
              </Heading>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-4 flex w-11/12 flex-col items-center gap-4"
              >
                <SimpleControlledInput
                  control={control}
                  name="username"
                  label="Username"
                  placeholder="Enter username"
                  formState={formState}
                />

                <SimpleControlledInput
                  control={control}
                  name="email"
                  label="Email"
                  placeholder="Enter email"
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

                <SimpleControlledInput
                  control={control}
                  name="confirmPassword"
                  label="Confirm password"
                  placeholder="Confirm password"
                  formState={formState}
                  inputType="password"
                />

                <Controller
                  name="agreeToAll"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      validateStatus={
                        formState.errors.agreeToAll ? "error" : "success"
                      }
                      help={formState.errors?.agreeToAll?.message}
                    >
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      >
                        <span>I agree to the </span>
                        {props.legalDocuments.map((link, index) => (
                          <span key={link.slug}>
                            <Link
                              href={`/company/legal/${link.slug}`}
                              key={link.slug}
                              className="text-inherit no-underline hover:underline"
                            >
                              {link.title}
                            </Link>
                            {index !== props.legalDocuments.length - 1 && (
                              <span>, </span>
                            )}
                          </span>
                        ))}
                      </Checkbox>
                    </Form.Item>
                  )}
                />

                <div className="flex w-full justify-center">
                  <Button
                    type="primary"
                    htmlType="submit"
                    disabled={!formState.isDirty}
                    aria-label="Sign up"
                    loading={isSignUpLoading}
                  >
                    Sign up
                  </Button>
                </div>
              </form>
            </div>

            {/* Left */}
            <div
              className="flex h-fit w-full flex-col items-start justify-center rounded-b-3xl md:h-full md:w-1/2 md:rounded-r-3xl md:rounded-bl-none"
              style={{
                background:
                  "linear-gradient(90deg, rgba(138, 80, 196, 1) 0%, rgba(194, 152, 237, 0.9) 100%)",
              }}
            >
              <div className="flex-1 px-6 py-2 text-white">
                <Heading level={3}>Benefits</Heading>
                <Heading level={5} className="-mt-5">
                  AI Assisted Learning
                </Heading>
              </div>
            </div>
          </div>
        </div>
      </SimpleSlideFade>

      <SimpleSlideFade
        direction="bottom-to-top"
        slideDistance="50px"
        fadeOpacity
        damping={0.1}
        delay={350}
      >
        <div className="mt-12 flex justify-center">
          <span>Already have an account?</span>
          <Link href="/auth/sign-in" className="ml-1">
            Sign in
          </Link>
        </div>
      </SimpleSlideFade>
    </>
  );
}

export async function getStaticProps() {
  const cmsClient = getCmsClient();

  const cmsResponse = await cmsClient.query<GetAllLegalDocumentsQuery>({
    query: GetAllLegalDocumentsDocument,
  });

  const legalDocuments = cmsResponse.data.legalDocumentCollection?.items;

  return {
    props: {
      legalDocuments,
    },
  };
}
