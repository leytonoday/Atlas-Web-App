import {
  CenteredContainer,
  PageTitle,
  PlanCard,
  SimpleHead,
  SimpleSlideFade,
} from "@/components/common";
import { useApiQuery } from "@/hooks";
import { services } from "@/services";
import { useStore } from "@/store";
import { IPlan, IStripeSubscription, PricingMode } from "@/types";
import { Segmented, Tag } from "antd";
import { GetServerSidePropsContext } from "next";
import { useState } from "react";

interface IPlansProps {
  /**
   * All plans to display.
   */
  plans: IPlan[];

  /**
   * Determines whether or not the user is eligible for a trial. If the user is not authenticated, this will be null.
   */
  amIEligibleForTrial: boolean | null;
}

export default function Plans(props: IPlansProps) {
  const store = useStore();

  const [pricingMode, setPricingMode] = useState(PricingMode.Month);

  const { data: mySubscription } = useApiQuery<IStripeSubscription | null>({
    queryKey: ["mySubscription"],
    queryFn: () => services.api.stripe.getMySubscription(),
    enabled: store.whoAmI !== null,
  });

  return (
    <>
      <SimpleHead title="Plans" />

      <CenteredContainer>
        <PageTitle
          title="Ready to get started?"
          subtitle="Choose a plan tailored to your needs"
        />

        {/* Monthly or yearly pricing switch */}
        <div className="mb-8 flex justify-center">
          <Segmented
            size="large"
            options={["Monthly", "Yearly"]}
            value={pricingMode === PricingMode.Year ? "Yearly" : "Monthly"}
            onChange={(value) =>
              setPricingMode(
                value === "Yearly" ? PricingMode.Year : PricingMode.Month,
              )
            }
          />
          <div className="relative">
            <div className="gap-1/4 absolute -left-2 -top-2 flex flex-col items-start justify-center">
              <Tag color="blue">Discount!</Tag>
            </div>
          </div>
        </div>

        {/* The pricing cards for all plans */}
        <SimpleSlideFade
          direction="bottom-to-top"
          damping={0.3}
          duration={1000}
          fadeOpacity
          slideDistance="25px"
        >
          <div className="flex flex-col items-center gap-8 md:flex-row md:items-stretch md:justify-evenly">
            {props.plans?.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                parentPlan={props.plans.find(
                  (x) => x.id === plan.inheritsFromId,
                )}
                pricingMode={pricingMode}
                isCurrentPlan={
                  store.whoAmI?.planId === plan.id &&
                  mySubscription?.items[0].plan.interval ===
                    pricingMode.toString()
                }
                amIEligibleForTrial={props.amIEligibleForTrial}
                mySubscriptionStatus={mySubscription?.status}
              />
            ))}
          </div>
        </SimpleSlideFade>
      </CenteredContainer>
    </>
  );
}

export async function getServerSideProps(
  context: GetServerSidePropsContext,
): Promise<{ props: IPlansProps }> {
  const cookie = context.req.headers.cookie;

  // Get all plans and whether or not the user is eligible for a trial
  const response =
    (await Promise.allSettled([
      services.api.plan.getAllPlans(false),
      services.api.user.amIEligibleForTrial(cookie),
    ])) || [];

  const [plans, amIEligibleForTrial] = response.map(
    (result) => result.status === "fulfilled" && result.value.data,
  );

  return {
    props: {
      plans: plans || [],
      amIEligibleForTrial: amIEligibleForTrial || null,
    },
  };
}
