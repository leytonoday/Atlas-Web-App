import { SimpleControlledInput, SimpleHead } from "@/components/common";
import { useIsMobileScreen } from "@/hooks";
import { services } from "@/services";
import { useStore } from "@/store";
import { NotificationStatus } from "@/types";
import {
  axiosErrorToServerResponseErrors,
  getSupportEmail,
  signOut,
} from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { Button, Card } from "antd";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { z as zod } from "zod";

const validationSchema = zod.object({
  password: zod.string(),
});
type FormSchema = zod.infer<typeof validationSchema>;

/**
 * Account deletion page
 */
export default function DeleteAccount() {
  const store = useStore();
  const router = useRouter();
  const isMobileScreen = useIsMobileScreen();

  const { getValues, handleSubmit, control, formState, setError } =
    useForm<FormSchema>({
      defaultValues: {
        password: "",
      },
    });

  const onSubmit: SubmitHandler<FormSchema> = () => deleteAccount();

  const { mutate: deleteAccount, isLoading } = useMutation({
    mutationFn: () =>
      services.api.user.deleteAccount({
        password: getValues().password,
        userId: store.whoAmI?.id || "",
      }),
    onSuccess: async () => {
      const signOutResult = await signOut();
      if (signOutResult) {
        router.push("/");
      } else {
        store.notification.enqueue({
          status: NotificationStatus.Error,
          description: "Failed to sign out",
        });
      }
    },
    onError: (e) => {
      const errors = axiosErrorToServerResponseErrors(e as AxiosError);
      setError("password", { message: errors[0].message });
    },
  });

  return (
    <>
      <SimpleHead title="Delete Account" />

      <Card
        title="Delete Account"
        className="w-full md:max-w-[35rem]"
        size={isMobileScreen ? "small" : "default"}
      >
        <span className="font-semibold">Account Deletion Impact</span>
        <p>
          By deleting your account, you will permanently lose access to all the
          features, data, and content associated with your account. This action
          is irreversible, and your account cannot be restored once deleted.
        </p>

        <span className="font-semibold">
          No Refund for Current Billing Period
        </span>
        <p>
          Please note that no refunds will be issued for the current billing
          period. We operate on a subscription-based model, and your payment for
          the current billing cycle has already been processed. Deleting your
          account will not entitle you to any reimbursement for the remaining
          days in the billing period.
        </p>

        <span className="font-semibold">Subscription Termination</span>
        <p>
          Upon confirming the deletion of your account, the billing of your
          subscription will be stopped immediately. You will not be charged for
          any subsequent billing cycles.
        </p>

        <span className="font-semibold">Data Deletion</span>
        <p>
          While your account data will be permanently removed from our systems,
          please be aware that certain data may still be retained in our backups
          for a limited period of time. However, this data will not be
          accessible or used in any way.
        </p>

        <span className="font-semibold">Considerations Before Deleting</span>
        <div>
          <p>
            Deleting your account is a significant step, and we encourage you to
            consider the following points before proceeding:
          </p>

          <ul>
            <li>
              If you are facing technical difficulties, please reach out to our
              support team. We're here to help resolve any issues you may be
              experiencing.
            </li>

            <li>
              If you are unhappy with any aspect of our service, we appreciate
              the opportunity to address your concerns and improve your
              experience. Please contact us at{" "}
              <a href={`mailto:${getSupportEmail()}`}>{getSupportEmail()}</a> so
              that we can work towards a solution.
            </li>
          </ul>
        </div>

        <span className="font-semibold">Confirmation</span>
        <p>
          To proceed with deleting your account and confirming that you
          understand and accept the implications mentioned above, please enter
          your password, and click the Confirm Delete button below.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <SimpleControlledInput
            control={control}
            name="password"
            placeholder="Enter password"
            formState={formState}
            label="Password"
            inputType="password"
          />

          <div className="mt-2 flex justify-end">
            <Button
              aria-label="Confirm Delete"
              loading={isLoading}
              disabled={isLoading || !formState.isDirty || !formState.isValid}
              type="primary"
              danger
              htmlType="submit"
            >
              Confirm Delete
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
