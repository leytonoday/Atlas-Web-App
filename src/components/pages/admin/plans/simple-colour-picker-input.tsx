import { isValidHexColour } from "@/utils";
import { Card, Form, Popover } from "antd";
import { SketchPicker } from "react-color";
import {
  Control,
  Controller,
  FieldError,
  FieldErrorsImpl,
  FormState,
  Merge,
} from "react-hook-form";

interface ISimpleColourPickerInputProps {
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
   * The label of the input field
   */
  label?: string;
}

export const SimpleColourPickerInput = (
  props: ISimpleColourPickerInputProps,
) => {
  const errors:
    | FieldError
    | Merge<FieldError, FieldErrorsImpl<any>>
    | undefined = props.formState.errors[props.name];

  return (
    <div className="flex flex-col gap-4">
      {props.label && <div className="font-semibold">{props.label}</div>}

      <Controller
        name={props.name}
        control={props.control}
        render={({ field }) => {
          const validHex = isValidHexColour(field.value);
          return (
            <Form.Item
              className="!mb-0 w-full"
              validateStatus={errors ? "error" : "success"}
              help={errors?.message as string}
            >
              <Popover
                trigger="click"
                placement="bottomLeft"
                style={{ padding: "0" }}
                overlayInnerStyle={{ padding: "0", outline: "none" }}
                content={
                  <div>
                    <SketchPicker
                      disableAlpha
                      color={validHex ? field.value : undefined}
                      onChange={(colour) => {
                        if (!colour) {
                          return;
                        }

                        field.onChange(colour.hex);
                      }}
                    />
                  </div>
                }
              >
                <Card
                  size="small"
                  className="h-fit w-fit rounded-md"
                  bodyStyle={{ padding: "0.25em" }}
                >
                  <div
                    style={{
                      cursor: "pointer",
                      width: "3em",
                      height: "1.5em",
                      borderRadius: "0.25em",
                      backgroundColor: field.value,
                    }}
                  />
                </Card>
              </Popover>
            </Form.Item>
          );
        }}
      />
    </div>
  );
};
