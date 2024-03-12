import {
  ISimpleTableColumn,
  IconPopover,
  SimpleTooltip,
  SimpleTable,
  SimpleControlledInput,
  SimpleHead,
} from "@/components/common";
import { useApiQuery, useLoadingCombinator } from "@/hooks";
import { services } from "@/services";
import { IFeature, NotificationStatus } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal, Switch, Button, Input } from "antd";
import { useState, useCallback, useMemo } from "react";
import {
  AiOutlineCheck,
  AiOutlineClose,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineSearch,
} from "react-icons/ai";
import { z as zod } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { handleApiRequestError } from "@/utils";
import { useStore } from "@/store";

const { confirm } = Modal;

export default function Features() {
  const queryClient = useQueryClient();
  const store = useStore();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredFeatures, setFilteredFeatures] = useState<IFeature[]>([]);

  // The ID of the feature that is currently being edited, or null if no feature is being edited. -1 represents a new feature.
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(
    null,
  );

  /**
   * Gets all the features, and sets the filtered features to all the features.
   */
  const { data: allFeatures, isFetching: isFetchingAllFeatures } = useApiQuery<
    IFeature[]
  >({
    queryKey: ["features"],
    queryFn: () => services.api.feature.getAllFeatures(),
    onSuccess: (serverResponse) => {
      setSearchQuery("");
      setFilteredFeatures(serverResponse.data);
    },
  });

  /**
   * Adds a feature, and reloads the features
   */
  const { mutate: addFeature, isLoading: isAddFeatureLoading } = useMutation({
    mutationFn: (feature: Partial<IFeature>) => {
      feature.id = undefined; // reset the ID to ensure the API can generate a new one. It expects a Guid, or null, not an empty string.
      return services.api.feature.addFeature(feature);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["features"]);
      store.notification.enqueue({
        status: NotificationStatus.Success,
        description: "Feature added",
      });
      reset();
    },
    onError: handleApiRequestError,
  });

  /**
   * Updates a feature, and reloads the features
   */
  const { mutate: updateFeature, isLoading: isUpdateFeatureLoading } =
    useMutation({
      mutationFn: (feature: Partial<IFeature>) =>
        services.api.feature.updateFeature(feature),
      onSuccess: () => {
        queryClient.invalidateQueries(["features"]);
        store.notification.enqueue({
          status: NotificationStatus.Success,
          description: "Feature updated",
        });
        stopEditing();
      },
      onError: handleApiRequestError,
    });

  /**
   * Deletes a feature, and reloads the features
   */
  const { mutate: deleteFeature, isLoading: isDeleteFeatureLoading } =
    useMutation({
      mutationFn: (featureId: string) =>
        services.api.feature.deleteFeature(featureId),
      onSuccess: () => {
        queryClient.invalidateQueries(["features"]);
        store.notification.enqueue({
          status: NotificationStatus.Success,
          description: "Feature deleted",
        });
      },
      onError: handleApiRequestError,
    });

  const isLoading = useLoadingCombinator(
    isFetchingAllFeatures,
    isAddFeatureLoading,
    isUpdateFeatureLoading,
    isDeleteFeatureLoading,
  );

  const validationSchema = zod.object({
    id: zod.string().optional(),
    name: zod.string().min(1).max(255),
    description: zod.string(),
    isInheritable: zod.boolean(),
    isHidden: zod.boolean(),
  });

  type FormSchema = zod.infer<typeof validationSchema>;

  const { control, formState, reset, getValues, setValue } =
    useForm<FormSchema>({
      defaultValues: {
        id: "",
        name: "",
        description: "",
        isInheritable: false,
        isHidden: false,
      },
      resolver: zodResolver(validationSchema),
    });

  const onSubmit: SubmitHandler<FormSchema> = (data: FormSchema) => {
    if (selectedFeatureId === null) {
      return;
    }

    // New feature
    if (selectedFeatureId === "-1") {
      addFeature(data);
    } else {
      updateFeature(data);
    }
  };

  /**
   * Filters the features based on the search input.
   */
  const onSearch = useCallback(
    (value: string) => {
      if (!allFeatures) {
        return;
      }

      if (value === "") {
        setFilteredFeatures(allFeatures);
      } else {
        setFilteredFeatures(
          allFeatures.filter((feature) =>
            feature.name.toLowerCase().includes(value.toLowerCase()),
          ),
        );
      }
    },
    [allFeatures],
  );

  /**
   * Shows a confirmation dialog to the user, and stops editing if they confirm.
   */
  const showCancelConfirm = () => {
    confirm({
      title: "Are you sure?",
      content:
        "You're about to cancel editing this feature. Your changes will be lost.",
      onOk() {
        stopEditing();
      },
    });
  };

  /**
   * Sets the values formik form to the selected feature, and sets the selected feature ID.
   * @param feature The feature to start editing.
   */
  const startEditing = (feature: IFeature) => {
    reset({
      id: feature.id!,
      name: feature.name,
      isInheritable: feature.isInheritable,
      description: feature.description,
      isHidden: feature.isHidden,
    });

    setSelectedFeatureId(feature.id!);
  };

  /**
   * Stops editing the feature, and resets the formik form.
   */
  const stopEditing = () => {
    reset();
    setSelectedFeatureId(null);
  };

  /**
   * Sets the selected feature Id to -1, thus making the SimpleTable new row appear, and resets the formik form.
   */
  const startAdding = () => {
    reset({
      id: "",
      name: "",
      isInheritable: true,
      description: "",
      isHidden: false,
    });
    setSelectedFeatureId("-1");
  };

  /**
   * Shows a confirmation dialog to the user, and deletes the feature if they confirm.
   * @param featureId The ID of the feature to delete.
   */
  const showDeleteConfirm = (featureId: string) => {
    confirm({
      title: "Are you sure?",
      content:
        "You're about to delete this feature. This action cannot be undone.",
      async onOk() {
        await deleteFeature(featureId);
      },
    });
  };

  /**
   * The columns for the SimpleTable.
   */
  const columns: ISimpleTableColumn[] = [
    {
      title: "Name",
      dataIndex: "name",
      justifyContent: "start",
      render: (record: IFeature) => <div>{record.name}</div>,
      editingRender: () => (
        <SimpleControlledInput
          name="name"
          control={control}
          formState={formState}
          placeholder="Enter feature name"
        />
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      justifyContent: "start",
      render: (record: IFeature) => <div>{record.description}</div>,
      editingRender: () => (
        <SimpleControlledInput
          name="description"
          control={control}
          formState={formState}
          placeholder="Enter description"
        />
      ),
    },
    {
      title: (
        <div className="flex gap-2">
          <div>Is Inheritable</div>
          <IconPopover
            content="Changing this value will remove this Feature from all Plans"
            status="warning"
          />
        </div>
      ),
      dataIndex: "isInheritable",
      justifyContent: "center",
      render: (record: IFeature) =>
        record.isInheritable ? (
          <AiOutlineCheck style={{ color: "green" }} />
        ) : (
          <AiOutlineClose style={{ color: "red" }} />
        ),
      editingRender: () => (
        <Controller
          name="isInheritable"
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onChange={(e) => {
                setValue("isInheritable", e, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            />
          )}
        />
      ),
    },
    {
      title: (
        <div className="flex gap-2">
          <div>Is Hidden</div>
          <IconPopover
            content="This is a characteristic that can be attributed to a Plan, but it won't appear in the UI."
            status="info"
          />
        </div>
      ),
      dataIndex: "isHidden",
      justifyContent: "center",
      render: (record: IFeature) =>
        record.isHidden ? (
          <AiOutlineCheck style={{ color: "green" }} />
        ) : (
          <AiOutlineClose style={{ color: "red" }} />
        ),
      editingRender: () => (
        <Controller
          name="isHidden"
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onChange={(e) => {
                setValue("isHidden", e, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            />
          )}
        />
      ),
    },
    {
      title: "Actions",
      render: (record) => (
        <div className="flex gap-2">
          <SimpleTooltip text="Edit">
            <Button
              disabled={isFetchingAllFeatures || selectedFeatureId !== null}
              shape="circle"
              className="!flex !items-center !justify-center"
              onClick={() => {
                startEditing(record);
              }}
            >
              <AiOutlineEdit />
            </Button>
          </SimpleTooltip>
          <SimpleTooltip text="Delete">
            <Button
              disabled={isFetchingAllFeatures || selectedFeatureId !== null}
              danger
              shape="circle"
              className="!flex !items-center !justify-center"
              onClick={() => showDeleteConfirm(record.id!)}
            >
              <AiOutlineDelete />
            </Button>
          </SimpleTooltip>
        </div>
      ),
      editingRender: (record) => (
        <div className="flex gap-2">
          <SimpleTooltip text={selectedFeatureId === "-1" ? "Add" : "Update"}>
            <Button
              shape="circle"
              className="!flex !items-center !justify-center"
              onClick={() => onSubmit(getValues())}
              disabled={!formState.isDirty || !formState.isValid}
              loading={isUpdateFeatureLoading || isAddFeatureLoading}
            >
              {!(isUpdateFeatureLoading || isAddFeatureLoading) && (
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
    <>
      <SimpleHead title="Features" />

      <div className="my-4 flex w-full gap-4">
        <Input
          placeholder="Search Features"
          suffix={<AiOutlineSearch />}
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
            onSearch(event.target.value);
          }}
          disabled={isLoading || selectedFeatureId !== null}
        />
        <Button
          onClick={() => startAdding()}
          disabled={isLoading || selectedFeatureId !== null}
        >
          Add Feature
        </Button>
      </div>

      <SimpleTable
        dataSource={filteredFeatures}
        isLoading={isFetchingAllFeatures}
        selectedRowId={selectedFeatureId}
        columns={columns}
        rowKey="id"
      />

      <br />
    </>
  );
}
