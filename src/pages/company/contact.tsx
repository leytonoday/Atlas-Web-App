import {
  Heading,
  PageTitle,
  SimpleControlledInput,
  SimpleHead,
  SimpleSlideFade,
} from "@/components/common";
import { services } from "@/services";
import { useStore } from "@/store";
import { ContactEmailType, IContactEmail, NotificationStatus } from "@/types";
import { getSupportEmail, handleApiRequestError } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button, Divider, Form, Select } from "antd";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z as zod } from "zod";

// Form validation schema
const formValidationSchema = zod.object({
  name: zod.string().min(1, { message: "Required" }).max(100),
  email: zod.string().email().min(1, { message: "Required" }),
  company: zod.string().max(200).optional(),
  message: zod.string().min(1, { message: "Required" }).max(2000),
  type: zod.string().min(1, { message: "Required" }),
});

type FormSchema = zod.infer<typeof formValidationSchema>;

/**
 * Contact page, with a simple contact form.
 */
export default function Contact() {
  const store = useStore();

  const { isLoading: isContactEmailLoading, mutateAsync: sendContactEmail } =
    useMutation({
      mutationFn: (request: IContactEmail) =>
        services.api.contact.sendContactEmail(request),
    });

  // Form
  const {
    handleSubmit,
    control,
    formState,
    reset: resetForm,
  } = useForm<FormSchema>({
    defaultValues: {
      email: "",
      name: "",
      company: "",
      message: "",
      type: ContactEmailType.GENERAL_INQUIRY,
    },
    resolver: zodResolver(formValidationSchema),
  });

  /**
   * Handles the form submission
   * @param data The form data
   */
  const onSubmit: SubmitHandler<FormSchema> = async (data: FormSchema) => {
    try {
      // @ts-ignore - The "type" is a string, but it should be ContactEmailType, which is just a string anyway
      await sendContactEmail(data);
      store.notification.enqueue({
        status: NotificationStatus.Success,
        description: "Your message has been sent successfully, thank you.",
      });
      resetForm();
    } catch (error) {
      handleApiRequestError(error);
    }
  };

  const supportEmail = getSupportEmail();

  return (
    <>
      <SimpleHead title="Contact" />
      <SimpleSlideFade
        direction="bottom-to-top"
        damping={0.2}
        duration={500}
        fadeOpacity
        slideDistance="25px"
        className="flex w-full flex-col items-center"
      >
        <PageTitle
          title={<span>Contact Us</span>}
          subtitle="Fill in the form, or if you prefer, email us directly."
        />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-4 flex flex-col gap-4"
        >
          <div className="flex flex-col gap-4 md:flex-row">
            <SimpleControlledInput
              control={control}
              name="name"
              label="Name"
              placeholder="Enter your name"
              formState={formState}
            />

            <SimpleControlledInput
              control={control}
              name="email"
              label="Email"
              placeholder="Enter your email"
              formState={formState}
            />
          </div>

          <div className="flex flex-col gap-4 md:flex-row">
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Form.Item
                  className="!mb-0 w-full"
                  validateStatus={formState.errors.type ? "error" : "success"}
                  help={formState.errors.type?.message as string}
                >
                  <label htmlFor="type">
                    <div className="mb-2 font-medium">Message type</div>
                    <Select
                      allowClear
                      showSearch
                      {...field}
                      placeholder="Message type"
                    >
                      <Select.Option value={ContactEmailType.GENERAL_INQUIRY}>
                        General Inquiry
                      </Select.Option>
                      <Select.Option value={ContactEmailType.FEEDBACK}>
                        Feedback
                      </Select.Option>
                      <Select.Option value={ContactEmailType.TECHNICAL_SUPPORT}>
                        Technical Support
                      </Select.Option>
                      <Select.Option value={ContactEmailType.SALES}>
                        Sales
                      </Select.Option>
                      <Select.Option value={ContactEmailType.BILLING}>
                        Billing
                      </Select.Option>
                      <Select.Option value={ContactEmailType.PARTNERSHIP}>
                        Partnership
                      </Select.Option>
                      <Select.Option value={ContactEmailType.MEDIA}>
                        Media
                      </Select.Option>
                      <Select.Option value={ContactEmailType.LEGAL}>
                        Legal
                      </Select.Option>
                      <Select.Option value={ContactEmailType.MARKETING}>
                        Marketing
                      </Select.Option>
                      <Select.Option value={ContactEmailType.OTHER}>
                        Other
                      </Select.Option>
                    </Select>
                  </label>
                </Form.Item>
              )}
            />

            <SimpleControlledInput
              control={control}
              name="company"
              label="Company"
              placeholder="Enter your company name"
              formState={formState}
            />
          </div>

          <SimpleControlledInput
            control={control}
            name="message"
            label="Message"
            placeholder="Enter your message"
            formState={formState}
            isTextArea
          />

          <div className="flex justify-center">
            <Button
              type="primary"
              htmlType="submit"
              loading={isContactEmailLoading}
              disabled={!formState.isDirty}
              aria-label="Submit"
            >
              Submit
            </Button>
          </div>

          <Divider />

          <div className="text-center">
            Alternatively, you can email us at{" "}
            <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
          </div>
        </form>
      </SimpleSlideFade>
    </>
  );
}
