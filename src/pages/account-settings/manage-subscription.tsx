import { SimpleHead } from "@/components/common";
import { InvoiceHistory } from "@/components/pages/account-settings/invoice-history";
import { MyPlan } from "@/components/pages/account-settings/my-plan/my-plan";
import { PaymentMethods } from "@/components/pages/account-settings/payement-methods";
import { useApiQuery, useLoadingCombinator, useWhoAmI } from "@/hooks";
import { services } from "@/services";
import { IStripePaymentMethod, IWhoAmI, UserRole } from "@/types";
import { useRouter } from "next/router";

export default function ManageSubscription() {
  const router = useRouter();

  // Perform additional who am i check on this page in particular, since it's really important
  useWhoAmI({
    onSuccess: (response) => {
      const whoAmI = response.data as IWhoAmI;
      if (whoAmI.roles.includes(UserRole.Administrator)) {
        router.push("/admin/dashboard");
      }
    },
  });

  // Get My Default Payment Method
  const {
    data: myDefaultPaymentMethod,
    isLoading: isMyDefaultPaymentMethodLoading,
  } = useApiQuery<IStripePaymentMethod>({
    queryKey: ["myDefaultPaymentMethod"],
    queryFn: () => services.api.stripe.getMyDefaultPaymentMethod(),
  });

  // Get My Payment Methods
  const { data: myPaymentMethods, isLoading: isMyPaymentMethodsLoading } =
    useApiQuery<IStripePaymentMethod[]>({
      queryKey: ["myPaymentMethods"],
      queryFn: () => services.api.stripe.getMyPaymentMethods(),
    });

  const isLoading = useLoadingCombinator(
    isMyDefaultPaymentMethodLoading,
    isMyPaymentMethodsLoading,
  );

  return (
    <>
      <SimpleHead title="Manage Subscription" />

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="w-full md:w-6/12">
          <MyPlan
            isLoading={isLoading}
            defaultPaymentMethod={myDefaultPaymentMethod}
            paymentMethods={myPaymentMethods}
          />
        </div>
        <div className="w-full md:w-6/12">
          <InvoiceHistory />
        </div>
      </div>

      <br />

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="w-full md:w-6/12">
          <PaymentMethods
            isLoading={isLoading}
            defaultPaymentMethod={myDefaultPaymentMethod}
            paymentMethods={myPaymentMethods}
          />
        </div>
        <div className="w-full md:w-6/12"></div>
      </div>
    </>
  );
}
