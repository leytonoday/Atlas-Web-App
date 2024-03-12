import { IFeature, IPlan, IPlanFeature } from "@/types";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { Button, Drawer, Form, Modal, Select } from "antd";
import { useState, useMemo, useEffect } from "react";
import {
  AiOutlineCheck,
  AiOutlineClose,
  AiOutlineDelete,
  AiOutlineEdit,
} from "react-icons/ai";
import { useApiQuery, useLoadingCombinator } from "@/hooks";
import { z as zod } from "zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { services } from "@/services";
import { useMutation } from "@tanstack/react-query";
import { handleApiRequestError } from "@/utils";
import {
  ISimpleTableColumn,
  SimpleControlledInput,
  SimpleTable,
  SimpleTooltip,
} from "@/components/common";

const { confirm } = Modal;

// Form validation schema
const formValidationSchema = zod.object({
  planId: zod.string().uuid(),
  featureId: zod.string().uuid(),
  value: zod.string().optional(),
});

type FormSchema = zod.infer<typeof formValidationSchema>;

interface IManagePlanFeaturesProps {
  /**
   * The plan to manage users for.
   */
  plan: IPlan | null;

  /**
   * Whether or not the drawer is open.
   */
  isOpen: boolean;

  /**
   * Callback fired when the drawer is closed.
   * @param editsMade Whether or not edits were made whilst the drawer was open.
   */
  onClose: (editsMade: boolean) => void;

  /**
   * Callback fired when the form is submitted.
   */
  onSubmit: () => void;
}

/**
 * A form for managing the features of a plan.
 */
export const ManagePlanFeatures = (props: IManagePlanFeaturesProps) => {
  const [selectedPlanFeatureId, setSelectedPlanFeatureId] = useState<
    string | null
  >(null);

  const [editsMade, setEditsMade] = useState<boolean>(false);

  // Form
  const {
    handleSubmit,
    control,
    formState,
    reset: resetForm,
  } = useForm<FormSchema>({
    defaultValues: {
      planId: "",
      featureId: "",
    },
    resolver: zodResolver(formValidationSchema),
  });

  /**
   * Handles the form submission
   * @param data The form data
   */
  const onSubmit: SubmitHandler<FormSchema> = async (data: FormSchema) => {
    if (selectedPlanFeatureId === null) {
      return;
    }

    try {
      // New feature
      if (selectedPlanFeatureId === "-1") {
        await addPlanFeature(data);
      }
      // Existing feature
      else {
        await updatePlanFeature(data);
      }

      setSelectedPlanFeatureId(null);
      setEditsMade(true);
      resetForm();
    } catch (e) {
      handleApiRequestError(e);
    }
  };

  // When the drawer opens or closes, reset the form
  useEffect(() => {
    if (!props.isOpen) {
      return;
    }

    resetForm();
    setEditsMade(false);
    setSelectedPlanFeatureId(null);
  }, [props.isOpen]);

  const {
    data: planFeatures,
    isLoading: isPlanFeaturesLoading,
    isFetching: isPlanFeaturesFetching,
    refetch: refetchPlanFeatures,
  } = useApiQuery<IPlanFeature[]>({
    queryFn: () => services.api.plan.getFeatures(props.plan?.id!),
    queryKey: ["planFeatures", props.plan?.id],
    enabled: props.plan?.id !== undefined && props.isOpen,
  });

  const planFeaturesWithInherited = useMemo(() => {
    const inheritedPlanFeatures = props.plan?.inheritedPlanFeatures ?? [];
    inheritedPlanFeatures.forEach((feature) => (feature.isInherited = true));

    return planFeatures?.concat(inheritedPlanFeatures);
  }, [planFeatures]);

  const { data: allFeatures, isLoading: isAllFeaturesLoading } = useApiQuery<
    IFeature[]
  >({
    queryFn: () => services.api.feature.getAllFeatures(),
    queryKey: ["allFeatures"],
  });

  const isLoading = useLoadingCombinator(
    isPlanFeaturesFetching,
    isPlanFeaturesLoading,
    isAllFeaturesLoading,
  );

  const showRemoveConfirm = (planFeature: IPlanFeature) => {
    confirm({
      title: "Are you sure?",
      icon: <ExclamationCircleFilled />,
      content:
        "You're about to remove this plan feature. This action cannot be undone.",
      async onOk() {
        try {
          await removePlanFeature(planFeature);
          setEditsMade(true);
        } catch (e) {
          handleApiRequestError(e);
        }
      },
    });
  };

  // Filter out features that are already added to the plan
  const featureSelectOptions = useMemo(() => {
    return allFeatures?.filter(
      (x) => !planFeaturesWithInherited?.find((y) => y.featureId === x.id),
    );
  }, [allFeatures, selectedPlanFeatureId, planFeaturesWithInherited]);

  const { mutate: addPlanFeature, isLoading: isAddPlanFeatureLoading } =
    useMutation({
      mutationFn: (planFeature: IPlanFeature) =>
        services.api.plan.addFeature(planFeature),
      onSuccess: () => {
        refetchPlanFeatures();
      },
    });

  const {
    mutateAsync: updatePlanFeature,
    isLoading: isUpdatePlanFeatureLoading,
  } = useMutation({
    mutationFn: (planFeature: IPlanFeature) =>
      services.api.plan.updateFeature(planFeature),
    onSuccess: () => {
      refetchPlanFeatures();
    },
  });

  const { mutateAsync: removePlanFeature } = useMutation({
    mutationFn: (planFeature: IPlanFeature) =>
      services.api.plan.removeFeature(planFeature),
    onSuccess: () => {
      refetchPlanFeatures();
    },
  });

  /**
   * Shows a confirmation dialog to the user, and stops editing if they confirm.
   */
  const showCancelConfirm = () => {
    confirm({
      title: "Are you sure?",
      icon: <ExclamationCircleFilled />,
      content:
        "You're about to cancel editing this feature. Your changes will be lost.",
      onOk() {
        stopEditing();
      },
    });
  };

  /**
   * Begins the process of editing a plan feature.
   * @param feature The plan feature to edit.
   */
  const startEditing = (feature: IPlanFeature) => {
    resetForm({
      planId: props.plan?.id!,
      featureId: feature.featureId!,
      value: feature.value || "",
    });
    setSelectedPlanFeatureId(feature.featureId!);
  };

  /**
   * Stops editing a plan feature.
   */
  const stopEditing = () => {
    resetForm();
    setSelectedPlanFeatureId(null);
  };

  /**
   * Begins the process of adding a new plan feature.
   */
  const startAdding = () => {
    resetForm({
      planId: props.plan?.id!,
      featureId: "",
      value: "",
    });
    setSelectedPlanFeatureId("-1");
  };

  const columns: ISimpleTableColumn[] = [
    {
      title: "Name",
      dataIndex: "name",
      justifyContent: "start",
      render: (record: IPlanFeature) => (
        <span>{allFeatures?.find((x) => x.id === record.featureId)?.name}</span>
      ),
      editingRender: (record: IPlanFeature) =>
        // If adding a new feature, show a select box. Otherwise, show the feature name.
        // I.e., we don't want the user to edit the actual feature Id whilst editing the plan feature, just the value.
        selectedPlanFeatureId === "-1" ? (
          <Controller
            name="featureId"
            control={control}
            render={({ field }) => (
              <Form.Item
                className="!mb-0 w-full"
                validateStatus={
                  formState.errors.featureId ? "error" : "success"
                }
                help={formState.errors.featureId?.message as string}
              >
                <Select
                  className="w-full"
                  placeholder="Select a feature"
                  filterOption
                  placement="topLeft"
                  {...field}
                >
                  {featureSelectOptions?.map((feature: IFeature) => (
                    <Select.Option key={feature.id} value={feature.id}>
                      {feature.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}
          />
        ) : (
          <span>
            {allFeatures?.find((x) => x.id === record.featureId)?.name}
          </span>
        ),
    },
    {
      title: "Value",
      dataIndex: "value",
      justifyContent: "start",
      render: (record: IPlanFeature) => <span>{record.value}</span>,
      editingRender: (record: IPlanFeature) => (
        <SimpleControlledInput
          control={control}
          formState={formState}
          name="value"
          placeholder="Enter value"
        />
      ),
    },
    {
      title: "Actions",
      render: (record: IPlanFeature) => (
        <div className="flex gap-2">
          <SimpleTooltip text="Edit">
            <Button
              disabled={
                isLoading ||
                selectedPlanFeatureId !== null ||
                record.isInherited
              }
              shape="circle"
              className="!flex !items-center !justify-center"
              onClick={() => startEditing(record)}
            >
              <AiOutlineEdit />
            </Button>
          </SimpleTooltip>
          <SimpleTooltip text="Remove">
            <Button
              disabled={
                isLoading ||
                selectedPlanFeatureId !== null ||
                record.isInherited
              }
              danger
              shape="circle"
              className="!flex !items-center !justify-center"
              onClick={() => showRemoveConfirm(record)}
            >
              <AiOutlineDelete />
            </Button>
          </SimpleTooltip>
        </div>
      ),
      editingRender: (record: IPlanFeature) => (
        <div className="flex gap-2">
          <SimpleTooltip
            text={selectedPlanFeatureId === "-1" ? "Add" : "Update"}
          >
            <Button
              shape="circle"
              className="!flex !items-center !justify-center"
              onClick={handleSubmit(onSubmit)}
              disabled={!formState.isDirty}
              loading={isAddPlanFeatureLoading || isUpdatePlanFeatureLoading}
            >
              {!(isAddPlanFeatureLoading || isUpdatePlanFeatureLoading) && (
                <AiOutlineCheck />
              )}
            </Button>
          </SimpleTooltip>
          <SimpleTooltip text="Cancel">
            <Button
              danger
              shape="circle"
              className="!flex !items-center !justify-center"
              onClick={() => {
                if (formState.isDirty) {
                  showCancelConfirm();
                } else {
                  stopEditing();
                }
              }}
            >
              <AiOutlineClose />
            </Button>
          </SimpleTooltip>
        </div>
      ),
    },
  ];

  return (
    <Drawer
      title={"Manage Plan Features: " + (props.plan?.name ?? "")}
      placement="right"
      onClose={() => {
        props.onClose(editsMade);
      }}
      open={props.isOpen}
      width="50%"
    >
      <div className="mb-3 flex justify-end">
        <Button
          size="small"
          onClick={() => startAdding()}
          disabled={selectedPlanFeatureId !== null}
        >
          Add Feature
        </Button>
      </div>

      <SimpleTable
        columns={columns}
        dataSource={planFeaturesWithInherited ?? []}
        isLoading={isLoading}
        selectedRowId={selectedPlanFeatureId}
        rowKey="featureId"
      />
    </Drawer>
  );
};
