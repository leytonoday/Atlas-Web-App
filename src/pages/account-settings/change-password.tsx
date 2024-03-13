import { SimpleControlledInput, SimpleHead } from "@/components/common";
import { useIsMobileScreen } from "@/hooks";
import { services } from "@/services";
import { useStore } from "@/store";
import { NotificationStatus } from "@/types";
import {
  axiosErrorToServerResponseErrors,
  handleApiRequestError,
} from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button, Card } from "antd";
import { AxiosError } from "axios";
import { SubmitHandler, useForm } from "react-hook-form";
import { z as zod } from "zod";

const validationSchema = zod
  .object({
    oldPassword: zod.string(),
    newPassword: zod.string(),
    confirmNewPassword: zod.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    // Check if passwords match
    path: ["confirmNewPassword"],
    message: "Passwords don't match",
  });
type FormSchema = zod.infer<typeof validationSchema>;

/**
 * Change password page
 */
export default function ChangePassword() {
  const store = useStore();
  const isMobileScreen = useIsMobileScreen();

  const { getValues, handleSubmit, control, formState, reset, setError } =
    useForm<FormSchema>({
      defaultValues: {
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      },
      resolver: zodResolver(validationSchema),
    });

  const onSubmit: SubmitHandler<FormSchema> = () => changePassword();

  // Change password mutation
  const { mutate: changePassword, isLoading } = useMutation({
    mutationFn: () =>
      services.api.user.changePassword({
        oldPassword: getValues().oldPassword,
        newPassword: getValues().newPassword,
      }),
    onSuccess: () => {
      store.notification.enqueue({
        status: NotificationStatus.Success,
        description: "Password changed successfully",
      });
      reset();
    },
    onError: (e) => {
      const error = axiosErrorToServerResponseErrors(e as AxiosError).shift();

      if (error?.message) {
        if (error?.message.includes("Incorrect"))
          setError("oldPassword", { message: error.message });
        else {
          setError("newPassword", { message: error?.message });
        }
      } else {
        // Just in case
        handleApiRequestError(e);
      }
    },
  });

  return (
    <>
      <SimpleHead title="Change Password" />

      <Card
        title="Change Password"
        className="w-full md:max-w-[35rem]"
        size={isMobileScreen ? "small" : "default"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <SimpleControlledInput
            control={control}
            name="oldPassword"
            placeholder="Enter old password"
            label="Old Password"
            formState={formState}
            inputType="password"
          />

          <SimpleControlledInput
            control={control}
            name="newPassword"
            placeholder="Enter new password"
            label="New Password"
            formState={formState}
            inputType="password"
          />

          <SimpleControlledInput
            control={control}
            name="confirmNewPassword"
            placeholder="Confirm new password"
            label="Confirm New Password"
            formState={formState}
            inputType="password"
          />

          <div className="flex justify-end">
            <Button
              aria-label="Change Password"
              loading={isLoading}
              disabled={isLoading || !formState.isDirty}
              type="primary"
              htmlType="submit"
            >
              Change Password
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
