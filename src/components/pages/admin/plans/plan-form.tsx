import { FormMode, IPlan } from "@/types";
import { Button, Divider, Drawer, Form, Modal, Select, theme } from "antd";
import { useEffect, useMemo } from "react";
import { getAllISOCodes } from "iso-country-currency";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { handleApiRequestError } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { services } from "@/services";
import { SimpleControlledInput, SimpleTooltip } from "@/components/common";
import { z as zod } from "zod";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { SimpleColourPickerInput } from "./simple-colour-picker-input";
import { IconPickerInput } from "./icon-picker-input";
import { zodResolver } from "@hookform/resolvers/zod";

const { confirm } = Modal;

// Form validation schema
const formValidationSchema = zod.object({
  id: zod.string().optional(),
  name: zod.string().min(1, { message: "Required" }),
  description: zod.string().min(1, { message: "Required" }),
  icon: zod.string().min(1, { message: "Required" }),
  iconColour: zod.coerce.string().optional(),
  textColour: zod.coerce.string().optional(),
  backgroundColour: zod.coerce.string().optional(),
  isoCurrencyCode: zod.string().min(1, { message: "Required" }),
  monthlyPrice: zod.coerce.number().min(50, { message: "Required" }),
  annualPrice: zod.coerce.number().min(50, { message: "Required" }),
  trialPeriodDays: zod.coerce.number().min(0).optional(),
  tag: zod.coerce.string().optional(),
  inheritsFromId: zod.coerce.string().optional(),
});

type FormSchema = zod.infer<typeof formValidationSchema>;

interface PlanFormProps {
  /**
   * The plan to edit or create
   */
  plan: IPlan | null;

  /**
   * If we are editing or creating a plan
   */
  mode: FormMode | null;

  /**
   * If the drawer is open
   */
  isOpen: boolean;

  /**
   * Callback when the drawer is closed
   */
  onClose: () => void;

  /**
   * Callback when the form is submitted
   */
  onSubmit: () => void;

  /**
   * A list of all plans
   */
  allPlans?: IPlan[];
}

/**
 * A form for creating or editing a Plan
 */
export const PlanForm = (props: PlanFormProps) => {
  // State
  const { token: themeToken } = theme.useToken();
  const drawerTitle = useMemo(
    () =>
      props.mode === FormMode.Create
        ? "Create Plan"
        : `Edit Plan: ${props.plan?.name}`,
    [props.mode, props.plan],
  );

  const { mutate: createPlan, isLoading: isCreatePlanLoading } = useMutation({
    mutationFn: (plan: Partial<IPlan>) => services.api.plan.createPlan(plan),
    onSuccess: () => {
      props.onSubmit();
      props.onClose();
    },
    onError: handleApiRequestError,
  });

  const { mutate: updatePlan, isLoading: isUpdatePlanLoading } = useMutation({
    mutationFn: (plan: Partial<IPlan>) => services.api.plan.updatePlan(plan),
    onSuccess: () => {
      props.onSubmit();
      props.onClose();
    },
    onError: handleApiRequestError,
  });

  // Initial values for the formik form
  const formInitialValues = useMemo(
    () => ({
      id: props.plan?.id || undefined,
      name: props.plan?.name || "",
      description: props.plan?.description || "",
      icon: props.plan?.icon || "",
      iconColour: props.plan?.iconColour || themeToken.colorPrimary,
      textColour: props.plan?.textColour || "",
      backgroundColour: props.plan?.backgroundColour || "",
      isoCurrencyCode: props.plan?.isoCurrencyCode || "",
      monthlyPrice: props.plan?.monthlyPrice || 0,
      annualPrice: props.plan?.annualPrice || 0,
      trialPeriodDays: props.plan?.trialPeriodDays || 0,
      tag: props.plan?.tag || "",
      inheritsFromId: props.plan?.inheritsFromId || undefined,
    }),
    [props.isOpen, props.plan],
  );

  /**
   * Get all ISO codes and filter out duplicates
   */
  const allIsoCodes = useMemo(
    () =>
      getAllISOCodes()
        .map((x) => ({
          currency: x.currency,
          symbol: x.symbol,
          iso: x.iso,
        }))
        .filter(
          (value, index, self) =>
            self.findIndex((x) => x.currency === value.currency) === index,
        ),
    [],
  );

  const { reset, control, formState, handleSubmit, getValues, setValue } =
    useForm<FormSchema>({
      values: formInitialValues,
      resolver: zodResolver(formValidationSchema),
    });

  const onSubmit: SubmitHandler<FormSchema> = async (data) => {
    const plan: Partial<IPlan> = {
      ...data,
      active: true,
    };
    if (props.mode === FormMode.Create) {
      createPlan(plan);
    } else {
      updatePlan(plan);
    }
  };

  // Hooks
  useEffect(() => {
    reset(formInitialValues);
  }, [props.isOpen, props.plan]);

  // Methods
  const showCloseConfirm = () => {
    confirm({
      title: "Are you sure?",
      icon: <ExclamationCircleFilled />,
      content: "You have unsaved changes.",
      onOk() {
        props.onClose();
      },
      onCancel() {},
    });
  };

  return (
    <>
      <Drawer
        title={drawerTitle}
        placement="right"
        onClose={(e) => {
          if (formState.isDirty) {
            e.preventDefault();
            showCloseConfirm();
          } else {
            props.onClose();
          }
        }}
        open={props.isOpen}
        width="50%"
        footer={
          <div className="flex w-full justify-end">
            <Button
              type="primary"
              onClick={handleSubmit(onSubmit)}
              loading={isCreatePlanLoading || isUpdatePlanLoading}
              disabled={!formState.isDirty}
            >
              {props.mode === FormMode.Create ? "Create" : "Save"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex justify-between">
            <div className="flex w-5/12 flex-col gap-6">
              <SimpleControlledInput
                formState={formState}
                control={control}
                name="name"
                placeholder="Enter a name"
                label="Name"
              />

              <SimpleControlledInput
                formState={formState}
                control={control}
                name="description"
                placeholder="Enter a description"
                isTextArea
                label="Description"
              />
            </div>

            <div className="flex w-5/12 flex-col gap-6">
              <div className="w-40">
                <SimpleControlledInput
                  control={control}
                  formState={formState}
                  name="trialPeriodDays"
                  inputType="number"
                  label="Trial Period Days"
                />
              </div>

              <div className="w-40">
                <SimpleControlledInput
                  control={control}
                  formState={formState}
                  name="tag"
                  label="Tag"
                  placeholder="Enter a tag"
                />
              </div>

              <div className="flex w-40 flex-col gap-4">
                <div style={{ fontWeight: 600 }}>Inherits From</div>
                <Controller
                  name="inheritsFromId"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      className="!mb-0 w-full"
                      validateStatus={
                        formState.errors.inheritsFromId ? "error" : "success"
                      }
                      help={formState.errors.inheritsFromId?.message as string}
                    >
                      <Select
                        allowClear
                        showSearch
                        {...field}
                        placeholder="Inherits from"
                      >
                        {props.allPlans
                          ?.filter((x) => x.id !== props.plan?.id)
                          .map((plan, index) => (
                            <Select.Option value={plan.id} key={index}>
                              {plan.name}
                            </Select.Option>
                          ))}
                      </Select>
                    </Form.Item>
                  )}
                />
              </div>
            </div>
          </div>

          <Divider />

          {/* Pricing */}
          <div className="flex justify-between gap-6">
            <div className="w-40">
              <div className="flex flex-col gap-3">
                <div style={{ fontWeight: 600 }}>Currency</div>

                <Controller
                  name="isoCurrencyCode"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      className="!mb-0 w-full"
                      validateStatus={
                        formState.errors.isoCurrencyCode ? "error" : "success"
                      }
                      help={formState.errors.isoCurrencyCode?.message as string}
                    >
                      <Select
                        showSearch
                        placeholder="Select a currency"
                        {...field}
                        filterOption={(input, option) =>
                          (option?.value as string)
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      >
                        {allIsoCodes.map((isoCode, index) => (
                          <Select.Option value={isoCode.currency} key={index}>
                            <SimpleTooltip text={isoCode.iso}>
                              <div className="flex justify-between pr-4">
                                <div>{isoCode.currency}</div>
                                <div>{isoCode.symbol}</div>
                              </div>
                            </SimpleTooltip>
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  )}
                />
              </div>
            </div>

            <div className="w-40">
              <SimpleControlledInput
                control={control}
                formState={formState}
                name="monthlyPrice"
                inputType="number"
                label="Monthly Price"
              />
            </div>

            <div className="w-40">
              <SimpleControlledInput
                control={control}
                formState={formState}
                name="annualPrice"
                inputType="number"
                label="Annual Price"
              />
            </div>
          </div>

          <Divider />

          {/* Icon */}
          <div className="flex items-center justify-between">
            <IconPickerInput
              control={control}
              formState={formState}
              name="icon"
              label="Icon"
              iconColour={getValues("iconColour")}
            />

            <SimpleColourPickerInput
              control={control}
              formState={formState}
              name="iconColour"
              label="Icon Colour"
            />

            <Button
              onClick={() => {
                setValue("icon", "", {
                  shouldDirty: true,
                });
                setValue("iconColour", themeToken.colorPrimary, {
                  shouldDirty: true,
                });
              }}
            >
              Reset
            </Button>
          </div>

          <Divider />

          {/* Background colour */}
          <div className="mb-4 font-semibold">Background Colour</div>
          <div className="flex flex-1 items-end gap-8">
            <SimpleColourPickerInput
              control={control}
              formState={formState}
              name="backgroundColour"
            />
            <SimpleControlledInput
              control={control}
              formState={formState}
              name="backgroundColour"
              placeholder="Enter background colour"
            />

            <Button
              onClick={() => {
                setValue("backgroundColour", "", { shouldDirty: true });
              }}
            >
              Reset
            </Button>
          </div>

          <br />

          {/* Text colour */}
          <div className="mb-4 font-semibold">Text Colour</div>
          <div className="mt-3 flex flex-1 items-end gap-8">
            <SimpleColourPickerInput
              control={control}
              formState={formState}
              name="textColour"
            />
            <SimpleControlledInput
              control={control}
              formState={formState}
              name="textColour"
              placeholder="Enter text colour"
            />

            <Button
              onClick={() => setValue("textColour", "", { shouldDirty: true })}
            >
              Reset
            </Button>
          </div>
        </form>
      </Drawer>
    </>
  );
};
