import { PlanCard, SimpleHead, SimpleTooltip } from "@/components/common";
import { ManagePlanFeatures } from "@/components/pages/admin/plans/manage-plan-features";
import { ManagePlanUsers } from "@/components/pages/admin/plans/manage-plan-users";
import { PlanForm } from "@/components/pages/admin/plans/plan-form";
import { useApiQuery } from "@/hooks";
import { services } from "@/services";
import { FormMode, IPlan, PricingMode } from "@/types";
import { handleApiRequestError } from "@/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Modal, Spin, Switch } from "antd";
import { useState } from "react";
import {
  AiOutlineAppstore,
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlineUndo,
  AiOutlineUser,
} from "react-icons/ai";

const { confirm } = Modal;

/**
 * A page that allows the admin the create, update, and archive plans, and their features.
 */
export default function Plans() {
  const queryClient = useQueryClient();

  const [showInactive, setShowInactive] = useState<boolean>(false);

  const [selectedPlan, setSelectedPlan] = useState<IPlan | null>(null);
  const [pricingMode, setPricingMode] = useState<PricingMode>(
    PricingMode.Month,
  );

  const [isManageFeaturesDrawerOpen, setIsManageFeaturesDrawerOpen] =
    useState<boolean>(false);
  const [isManageUsersDrawerOpen, setIsManageUsersDrawerOpen] =
    useState<boolean>(false);

  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<FormMode | null>(null);

  const { data: plans, isLoading: isLoadingPlans } = useApiQuery<IPlan[]>({
    queryKey: ["allPlans", showInactive],
    queryFn: () => services.api.plan.getAllPlans(showInactive),
    onError: handleApiRequestError,
  });

  const { mutateAsync: setPlanIsActive } = useMutation({
    mutationFn: (args: { plan: IPlan; setToIsActive: boolean }) => {
      const planClone = structuredClone(args.plan);
      planClone.active = args.setToIsActive;
      return services.api.plan.updatePlan(planClone);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["allPlans"]);
    },
  });

  /**
   * Shows a confirmation modal before deactivating a plan.
   * @param plan The plan to deactivate.
   */
  const showDeactivateConfirm = (plan: IPlan) => {
    confirm({
      title: "Deactivate - Are you sure?",
      content: "You're about to deactivate this plan.",
      async onOk() {
        try {
          await setPlanIsActive({ plan, setToIsActive: false });
        } catch (error) {
          handleApiRequestError(error);
        }
      },
      onCancel() {
        setSelectedPlan(null);
      },
    });
  };

  /**
   * Shows a confirmation modal before reactivating a plan.
   * @param plan The plan to reactivate.
   */
  const showReactivateConfirm = (plan: IPlan) => {
    confirm({
      title: "Reactivate - Are you sure?",
      content: "You're about to reactivate this plan.",
      async onOk() {
        try {
          await setPlanIsActive({ plan, setToIsActive: true });
        } catch (error) {
          handleApiRequestError(error);
        }
      },
      onCancel() {
        setSelectedPlan(null);
      },
    });
  };

  return (
    <>
      <SimpleHead title="Plans" />

      <PlanForm
        isOpen={isCreateDrawerOpen}
        plan={selectedPlan}
        mode={formMode}
        allPlans={plans}
        onClose={() => {
          setIsCreateDrawerOpen(false);
          setSelectedPlan(null);
        }}
        onSubmit={() => queryClient.invalidateQueries(["allPlans"])}
      />

      <ManagePlanFeatures
        isOpen={isManageFeaturesDrawerOpen}
        plan={selectedPlan}
        onClose={(editsMade: boolean) => {
          setIsManageFeaturesDrawerOpen(false);
          setSelectedPlan(null);

          // If anything changed, refetch the plans
          if (editsMade) {
            queryClient.invalidateQueries(["allPlans"]);
          }
        }}
        onSubmit={() => {
          setIsManageFeaturesDrawerOpen(false);
          queryClient.invalidateQueries(["allPlans"]);
        }}
      />

      <ManagePlanUsers
        isOpen={isManageUsersDrawerOpen}
        plan={selectedPlan}
        onClose={() => {
          setIsManageUsersDrawerOpen(false);
          setSelectedPlan(null);
        }}
      />

      <div className="mb-3 flex items-center justify-end gap-4">
        <Switch
          checked={pricingMode === PricingMode.Year}
          checkedChildren="Yearly"
          unCheckedChildren="Monthly"
          onChange={() =>
            setPricingMode(
              pricingMode === PricingMode.Year
                ? PricingMode.Month
                : PricingMode.Year,
            )
          }
        />
        <Switch
          checked={showInactive}
          checkedChildren="Hide inactive"
          unCheckedChildren="Show inactive"
          onChange={() => {
            setShowInactive(!showInactive);
          }}
        />
        <Button
          onClick={() => {
            setFormMode(FormMode.Create);
            setIsCreateDrawerOpen(true);
          }}
        >
          Add Plan
        </Button>
      </div>

      {isLoadingPlans || !plans ? (
        <div className="flex justify-center">
          <Spin />
        </div>
      ) : (
        <div className="flex flex-wrap justify-around gap-8">
          {plans!.map((plan) => (
            <div key={plan.id} className="flex flex-col gap-2">
              <PlanCard
                plan={plan}
                amIEligibleForTrial={false}
                pricingMode={pricingMode}
                disabledButton
                parentPlan={plans.find((p) => p.id === plan.inheritsFromId)}
              />
              <div className="flex justify-between px-4">
                {/* Manage buttons */}
                <div className="flex gap-2">
                  <SimpleTooltip text="Manage Features">
                    <Button
                      disabled={!plan.active}
                      shape="circle"
                      className="flex items-center justify-center"
                      onClick={() => {
                        setSelectedPlan(plan);
                        setIsManageFeaturesDrawerOpen(true);
                      }}
                    >
                      <AiOutlineAppstore />
                    </Button>
                  </SimpleTooltip>
                  <SimpleTooltip text="Manage Users">
                    <Button
                      disabled={!plan.active}
                      shape="circle"
                      className="flex items-center justify-center"
                      onClick={() => {
                        setSelectedPlan(plan);
                        setIsManageUsersDrawerOpen(true);
                      }}
                    >
                      <AiOutlineUser />
                    </Button>
                  </SimpleTooltip>
                </div>

                {/* Activate/Deactivate and Edit buttons */}
                <div className="flex gap-2">
                  <SimpleTooltip text="Edit">
                    <Button
                      disabled={!plan.active}
                      shape="circle"
                      className="flex items-center justify-center"
                      onClick={() => {
                        setSelectedPlan(plan);
                        setFormMode(FormMode.Update);
                        setIsCreateDrawerOpen(true);
                      }}
                    >
                      <AiOutlineEdit />
                    </Button>
                  </SimpleTooltip>
                  <SimpleTooltip
                    text={plan.active ? "Deactivate" : "Reactivate"}
                  >
                    <Button
                      danger={plan.active}
                      shape="circle"
                      className="flex items-center justify-center"
                      onClick={() => {
                        if (plan.active) {
                          showDeactivateConfirm(plan);
                        } else {
                          showReactivateConfirm(plan);
                        }
                      }}
                    >
                      {plan.active ? <AiOutlineDelete /> : <AiOutlineUndo />}
                    </Button>
                  </SimpleTooltip>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
