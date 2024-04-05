import {
  FormattedPrice,
  Heading,
  IconPopover,
  SimpleHead,
  SubscriptionCard,
} from "@/components/common";
import { NewPaymentMethodForm } from "@/components/pages/product/checkout/new-payment-method-form";
import { useApiQuery, useLoadingCombinator } from "@/hooks";
import { services } from "@/services";
import { useStore } from "@/store";
import {
  IPlan,
  IStripeInvoice,
  IStripePaymentMethod,
  IStripeSubscription,
  StripeSubscriptionStatus,
} from "@/types";
import { Alert, Button, Divider, Result, Spin, Tabs } from "antd";
import { TabsProps } from "antd/lib";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import Link from "next/link";
import { handleApiRequestError } from "@/utils";
import { SelectPaymentMethod } from "@/components/pages/product/checkout/select-payment-method";
import { PromotionCodeForm } from "@/components/pages/product/checkout/promotion-code-form";

/**
 * The types of tabs to display
 */
type CheckoutTab = "loading" | "select-payment-method" | "new-payment-method";

/**
 * The checkout page for subscribing to a plan, or changing plans.
 */
export default function Checkout() {
  const router = useRouter();
  const store = useStore();

  const [activeTab, setActiveTab] = useState<CheckoutTab>("loading");
  const [isQuoteInvoiceLoading, setIsQuoteInvoiceLoading] =
    useState<boolean>(false);
  const [quoteInvoice, setQuoteInvoice] = useState<IStripeInvoice | null>(null);

  const planId = router.query.planId as string | undefined;
  const interval = router.query.interval as string | undefined;

  const [promotionCode, setPromotionCode] = useState<string | null>(null);

  // Get the user's current subscription
  const { data: mySubscription, isLoading: isMySubscriptionLoading } =
    useApiQuery<IStripeSubscription>({
      queryKey: ["mySubscription"],
      queryFn: async () => {
        const response = await services.api.stripe.getMySubscription();
        const subscription: IStripeSubscription = response.data;

        // If the user is already on this plan and interval, redirect them to the manage subscription page
        if (
          store.whoAmI?.planId === planId &&
          subscription.items[0].plan.interval === interval
        ) {
          router.push("/account-settings/manage-subscription");
        }

        setPromotionCode(mySubscription?.discount?.promotionCode?.code);

        return response;
      },
      enabled: !!store?.whoAmI && !!planId && !!interval,
    });

  // Get the plan from the ID in the URL
  const { data: plan, isLoading: isPlanLoading } = useApiQuery<IPlan>({
    queryKey: ["plan", planId],
    queryFn: async () => {
      const response = await services.api.plan.getById(planId!);
      return response;
    },
    enabled:
      !!store?.whoAmI && !!planId && !!interval && !isMySubscriptionLoading,
  });

  // Get the publishable key
  const {
    data: stripePublishableKey,
    isLoading: isStripePublishableKeyLoading,
  } = useApiQuery<string>({
    queryKey: ["stripePublishableKey"],
    queryFn: async () => {
      const response = await services.api.stripe.getPublishableKey();
      return response;
    },
    enabled:
      !!store?.whoAmI && !!planId && !!interval && !isMySubscriptionLoading,
  });

  // Get the user's payment methods
  const { data: userPaymentMethods, isLoading: isUserPaymentMethodsLoading } =
    useApiQuery<IStripePaymentMethod[]>({
      queryKey: ["userPaymentMethods"],
      queryFn: async () => {
        const response = await services.api.stripe.getMyPaymentMethods();
        const paymentMethods: IStripePaymentMethod[] = response.data;

        // If the user has no pre-existing payment methods, and this plan does NOT have a trial, then
        // move them to the "non-trial-new-payment-method" tab
        if (paymentMethods.length === 0) {
          setActiveTab("new-payment-method");
        } else {
          setActiveTab("select-payment-method");
        }

        return response;
      },
      enabled:
        !!store?.whoAmI && !!planId && !!interval && !isMySubscriptionLoading,
    });

  // Get the user's default payment method
  const {
    data: userDefaultPaymentMethod,
    isLoading: isUserDefaultPaymentMethodLoading,
  } = useApiQuery<IStripePaymentMethod>({
    queryKey: ["userDefaultPaymentMethod"],
    queryFn: () => services.api.stripe.getMyDefaultPaymentMethod(),
    enabled:
      !!store?.whoAmI && !!planId && !!interval && !isMySubscriptionLoading,
  });

  // Get whether or not the user is eligible for a free trial
  const { data: amIEligibleForTrial, isLoading: amIEligibleForTrialLoading } =
    useApiQuery<boolean>({
      queryKey: ["amIEligibleForTrial"],
      queryFn: () => services.api.stripe.amIEligibleForTrial(),
      enabled: !!store?.whoAmI && !!planId && !!interval,
    });

  // Get the quote invoice
  const getQuoteInvoice = async (promotionCode: string | null) => {
    setIsQuoteInvoiceLoading(true);

    try {
      const quoteInvoiceResponse = await services.api.stripe.getQuoteInvoice({
        planId: planId!,
        userId: store.whoAmI?.id!,
        interval: interval!,
        promotionCode: promotionCode,
      });
      setQuoteInvoice(quoteInvoiceResponse.data);
    } catch (e) {
      handleApiRequestError(e);
    }

    setIsQuoteInvoiceLoading(false);
  };

  useEffect(() => {
    if (planId && interval && store.whoAmI?.id) {
      getQuoteInvoice(null);
    }
  }, [planId, interval, store.whoAmI?.id]);

  // Combine all loading states into one
  const isLoading = useLoadingCombinator(
    isMySubscriptionLoading,
    isPlanLoading,
    isStripePublishableKeyLoading,
    isUserPaymentMethodsLoading,
    isUserDefaultPaymentMethodLoading,
    amIEligibleForTrialLoading,
  );

  // Required to display the Stripe payment form
  const stripePromise = useMemo(() => {
    if (stripePublishableKey) {
      return loadStripe(stripePublishableKey);
    }
  }, [stripePublishableKey]);

  // Switches the tab. Resets the quote invoice, becuase the promotion code state is not shared between the tabs
  const switchTab = (key: CheckoutTab) => {
    getQuoteInvoice(null);
    setActiveTab(key);
  };

  // Tabs to display either the "select payment method" or "new payment method" form
  const tabs = useMemo(
    (): TabsProps["items"] => [
      {
        key: "loading",
        label: "Loading...",
        children: (
          <div className="flex justify-center">
            <Spin />
          </div>
        ),
      },
      {
        key: "select-payment-method",
        label: "Select payment method",
        children: (
          <SelectPaymentMethod
            plan={plan}
            interval={interval}
            onNext={() => switchTab("new-payment-method")}
            userDefaultPaymentMethod={userDefaultPaymentMethod}
            userPaymentMethods={userPaymentMethods}
            amIEligibleForTrial={amIEligibleForTrial}
            promotionCode={promotionCode}
          />
        ),
      },
      {
        key: "new-payment-method",
        label: "New payment method",
        children: (
          <NewPaymentMethodForm
            plan={plan}
            interval={interval}
            onBack={
              (userPaymentMethods || []).length > 0
                ? () => switchTab("select-payment-method")
                : undefined
            }
            amIEligibleForTrial={amIEligibleForTrial}
            promotionCode={promotionCode}
          />
        ),
      },
    ],
    [
      activeTab,
      planId,
      interval,
      userPaymentMethods,
      userDefaultPaymentMethod,
      stripePublishableKey,
      promotionCode,
    ],
  );

  // If loading, show loading spinner
  if (isLoading) {
    return (
      <>
        <SimpleHead title="Checkout" />
        <div className="flex h-full w-full items-center justify-center">
          <Spin />
        </div>
      </>
    );
  }

  // If loading is complete, but the plan is invalid, show error
  if (!isLoading && (!planId || !interval || !plan))
    return (
      <>
        <SimpleHead title="Checkout" />
        <Result
          status="error"
          title="Invalid plan"
          subTitle="This plan does not exist."
        />
      </>
    );

  // If the user's plan is past due, show error
  if (mySubscription?.status === StripeSubscriptionStatus.PastDue)
    return (
      <>
        <SimpleHead title="Checkout" />
        <Result
          status="error"
          title="Current subscription past due"
          subTitle="Your current subscription is past due. Before you can switch to another Plan, you must first cancel your current subscription."
          extra={
            <div className="flex justify-center">
              <Link href="/account-settings/manage-subscription">
                <Button type="primary" aria-label="Go to manage subscription">
                  Go to manage subscription
                </Button>
              </Link>
            </div>
          }
        />
      </>
    );

  return (
    <>
      <SimpleHead title="Checkout" />

      <div className="my-4 flex h-full w-full flex-col items-center justify-evenly p-8 md:my-0 md:flex-row">
        {/* Logo and Subcription Info */}
        <div className="mb-8 flex w-full flex-1 justify-center md:mb-0 md:max-w-[35rem]">
          <div className="flex w-full items-center justify-center gap-6">
            {isLoading || isQuoteInvoiceLoading || !plan ? (
              <Spin />
            ) : (
              <div className="flex w-full flex-col">
                <SubscriptionCard
                  plan={plan}
                  interval={interval as any}
                  title="Subscribe to"
                />

                {/* Invoice line items */}
                <Divider />
                {quoteInvoice && (
                  <div className="text-sm md:text-base">
                    <div className="flex flex-col gap-1">
                      {quoteInvoice.lines.map((line: any, index: number) => (
                        <div key={index} className="flex justify-between">
                          <span>{line.description}</span>
                          <FormattedPrice
                            amount={line.amount}
                            currency={line.currency.toUpperCase()}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Discount */}
                    {quoteInvoice.discount && (
                      <>
                        <Divider />
                        <div className="flex justify-between">
                          <span>Discount</span>
                          <span>
                            {quoteInvoice.discount.coupon?.percentOff !==
                              null && (
                              <span>{`-${quoteInvoice.discount.coupon.percentOff}%`}</span>
                            )}
                            {quoteInvoice.discount.coupon?.amountOff !==
                              null && (
                              <FormattedPrice
                                amount={
                                  quoteInvoice.discount.coupon.amountOff * -1
                                }
                                currency={quoteInvoice.currency.toUpperCase()}
                              />
                            )}
                          </span>
                        </div>
                      </>
                    )}

                    {/* Subtotal */}
                    <Divider />
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <FormattedPrice
                        amount={quoteInvoice.subtotal}
                        currency={quoteInvoice.currency.toUpperCase()}
                      />
                    </div>

                    {/* Total */}
                    <div className="mt-4 flex justify-between">
                      <span>Total</span>
                      <span className="flex gap-2">
                        <FormattedPrice
                          amount={quoteInvoice.total}
                          currency={quoteInvoice.currency.toUpperCase()}
                        />
                        {quoteInvoice.total < 0 && (
                          <span className="-mr-6">
                            <IconPopover
                              status="info"
                              content="This amount will be refunded."
                            />
                          </span>
                        )}
                      </span>
                    </div>
                    {plan.trialPeriodDays && amIEligibleForTrial ? (
                      <Alert
                        className="mt-6"
                        type="info"
                        message={
                          <span>
                            You will not be charged until the end of your trial
                            period, which lasts for {plan.trialPeriodDays} days.
                            You can <b>cancel at any time</b> before then, and{" "}
                            <b>you will not be charged at all</b>.
                          </span>
                        }
                        showIcon
                      />
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Payment */}
        <div className="flex w-full items-center justify-center md:w-fit md:justify-start md:p-8">
          <div className="flex w-full flex-col gap-2 md:w-[25rem]">
            <Heading level={4}>Pay with card</Heading>

            {!stripePublishableKey || !stripePromise ? (
              <div className="flex justify-center">
                <Spin />
              </div>
            ) : (
              <>
                <Elements
                  stripe={stripePromise!}
                  options={{
                    paymentMethodCreation: "manual",
                    mode: "subscription",
                    paymentMethodTypes: ["card"],
                    // We don't actually rely on this amount specified here. We set the price server-side. So some malicious user can't change the price
                    amount:
                      interval === "year"
                        ? plan!.annualPrice!
                        : plan!.monthlyPrice!,
                    currency: plan?.isoCurrencyCode.toLowerCase(),
                  }}
                >
                  <Tabs
                    activeKey={activeTab}
                    defaultActiveKey="1"
                    centered
                    tabBarStyle={{ display: "none" }}
                    items={tabs}
                  />
                </Elements>

                <PromotionCodeForm
                  initialPromotionCode={
                    mySubscription?.discount?.promotionCode?.code
                  }
                  getQuoteInvoice={(promotionCode: string | null) => {
                    getQuoteInvoice(promotionCode);
                    setPromotionCode(promotionCode);
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context: any) {
  const interval = context.query.interval as string | undefined;

  // Redirect to checkout/result if the interval is invalid
  if (interval !== "month" && interval !== "year") {
    return {
      redirect: {
        destination:
          "/product/checkout/result?success=false&reason=invalid-interval",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
