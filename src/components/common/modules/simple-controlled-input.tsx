import { ReactNode } from "react";
import { Form, Input } from "antd";
import TextArea from "antd/lib/input/TextArea";
import {
  FormState,
  Control,
  Controller,
  FieldError,
  Merge,
  FieldErrorsImpl,
  ControllerRenderProps,
} from "react-hook-form";

interface ISimpleControlledInputProps {
  /**
   * The name of the input field
   */
  name: string;

  /**
   * The react-hook-form control object
   */
  control: Control<any>;

  /**
   * The react-hook-form formState object
   */
  formState: FormState<any>;

  /**
   * The placeholder of the input field
   */
  placeholder?: string;

  /**
   * The label of the input field
   */
  label?: string;

  /**
   * A flag to indicate whether or not the input field should be marked with an asterisk, which indicates that it is required
   */
  showRequired?: boolean;

  /**
   * A flag to indicate whether or not the input field is a text area. If falsy, it is a regular input field
   */
  isTextArea?: boolean;

  /**
   * The type of the input field. For example, "password" or "text"
   */
  inputType?: string;
}

/**
 * Returns the appropriate input component based on the props
 * @param field The react-hook-form field object
 * @param props The props passed to the SimpleControlledInput component
 */
function InputFactory(
  field: ControllerRenderProps<any, string>,
  props: ISimpleControlledInputProps,
) {
  if (props.isTextArea) {
    return (
      <TextArea
        {...field}
        placeholder={props.placeholder}
        size="large"
        rows={5}
      />
    );
  }

  if (props.inputType === "password") {
    return <Input.Password {...field} placeholder={props.placeholder} />;
  }

  return (
    <Input {...field} placeholder={props.placeholder} type={props.inputType} />
  );
}

/**
 * A controlled input component for use with react-hook-form and antd
 */
export const SimpleControlledInput = (
  props: ISimpleControlledInputProps,
): ReactNode => {
  const errors:
    | FieldError
    | Merge<FieldError, FieldErrorsImpl<any>>
    | undefined = props.formState.errors[props.name];

  return (
    <Controller
      name={props.name}
      control={props.control}
      render={({ field }) => (
        <Form.Item
          className="!mb-0 w-full"
          validateStatus={errors ? "error" : "success"}
          help={errors?.message as string}
        >
          <label htmlFor={props.name}>
            {props.label && (
              <div className="mb-2 ml-1 font-medium">
                {props.label}{" "}
                {props.showRequired ? (
                  <span className="text-primary">*</span>
                ) : null}
              </div>
            )}
            {InputFactory(field, props)}
          </label>
        </Form.Item>
      )}
    />
  );
};
