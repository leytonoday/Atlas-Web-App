import { useStore } from "@/store";
import { z as zod } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { IUpdateUserRequest, NotificationStatus } from "@/types";
import { services } from "@/services";
import { SimpleControlledInput, SimpleHead } from "@/components/common";
import { useEffect } from "react";
import { Button, Card, Divider } from "antd";
import { useIsMobileScreen } from "@/hooks";
import dateFormat from "dateformat";
import { axiosErrorToServerResponseErrors } from "@/utils";
import { AxiosError } from "axios";

const validationSchema = zod.object({
  userName: zod.string(),
  phoneNumber: zod.string().optional(),
});
type FormSchema = zod.infer<typeof validationSchema>;

/**
 * Manages the account information for the user
 */
export default function AccountInformation() {
  const store = useStore();
  const isMobileScreen = useIsMobileScreen();

  const {
    getValues,
    setValue,
    handleSubmit,
    control,
    formState,
    reset,
    setError,
  } = useForm<FormSchema>({
    defaultValues: {
      userName: store.whoAmI?.userName,
      phoneNumber: store.whoAmI?.phoneNumber || "",
    },
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<FormSchema> = (data: FormSchema) => {
    updateUser({
      id: store.whoAmI?.id!,
      userName: data.userName,
      phoneNumber: data.phoneNumber || null,
    });
  };

  // Update the user.
  const { mutate: updateUser, isLoading } = useMutation({
    mutationFn: (values: IUpdateUserRequest) =>
      services.api.user.updateUser(values),
    onSuccess: () => {
      // Update the whoAmI in the store
      store.setWhoAmI({
        ...store.whoAmI!,
        userName: getValues().userName,
        phoneNumber: getValues().phoneNumber || undefined,
      });

      store.notification.enqueue({
        status: NotificationStatus.Success,
        description: "Account updated successfully",
      });

      // Reset the form
      reset({
        userName: getValues().userName,
        phoneNumber: getValues().phoneNumber || "",
      });
    },
    onError: (e) => {
      const errors = axiosErrorToServerResponseErrors(e as AxiosError);

      // If an error includes the name of a field, set that field's error to the error message
      for (const error of errors) {
        if (error.message.toLowerCase().includes("username"))
          setError("userName", { message: error.message });
        else if (error.message.toLowerCase().includes("phone number"))
          setError("phoneNumber", { message: error.message });
      }
    },
  });

  // For when the user loads this page first, and the whoAmI is not yet loaded, we need to reset the form when the whoAmI is loaded
  useEffect(() => {
    if (store.whoAmI?.userName) {
      setValue("userName", store.whoAmI.userName);
      setValue("phoneNumber", store.whoAmI.phoneNumber || "");
    }
  }, [store.whoAmI]);

  return (
    <>
      <SimpleHead title="Account Information" />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card
          title="Account Information"
          size={isMobileScreen ? "small" : "default"}
          className="w-full md:max-w-[35rem]"
        >
          <div className="flex flex-col">
            {/* Id */}
            <div className="flex items-start gap-4">
              <div className="w-28 font-semibold">Id</div>
              <div className="flex-1 text-right md:text-left">
                {store.whoAmI?.id}
              </div>
            </div>

            <Divider className="my-4 md:my-6" />

            {/* Username */}
            <div className="flex items-start gap-4">
              <div className="w-28 font-semibold">Username</div>
              <div className="flex-1 text-right md:text-left">
                <SimpleControlledInput
                  control={control}
                  name="userName"
                  placeholder="Enter username"
                  formState={formState}
                />
              </div>
            </div>

            <Divider className="my-4 md:my-6" />

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="w-28 font-semibold">Email</div>
              <div className="flex-1 text-right md:text-left">
                {store.whoAmI?.email}
              </div>
            </div>

            <Divider className="my-4 md:my-6" />

            {/* Phone number */}
            <div className="flex items-start gap-4">
              <div className="w-28 font-semibold">Phone Number</div>
              <div className="flex-1 text-right md:text-left">
                <SimpleControlledInput
                  control={control}
                  name="phoneNumber"
                  placeholder="Enter phone number"
                  formState={formState}
                />
              </div>
            </div>

            <Divider className="my-4 md:my-6" />

            {/* Date created */}
            <div className="flex items-start gap-4">
              <div className="w-28 font-semibold">Date Created</div>
              <div className="flex-1 text-right md:text-left">
                {dateFormat(store.whoAmI?.dateCreated, "dd/mm/yyyy HH:MM")}
              </div>
            </div>

            <Divider className="my-4 md:my-6" />

            {/* Buttons */}
            <div className="flex justify-end">
              <Button
                aria-label="Update account"
                type="primary"
                htmlType="submit"
                loading={isLoading}
                disabled={
                  !formState.isDirty || !store.whoAmI || !formState.isValid
                }
              >
                Update Account
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </>
  );
}
