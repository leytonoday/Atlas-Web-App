import { SECONDARY_COLOUR } from "@/data";
import { Button, Form, Input, Popover, theme } from "antd";
import { useState, useMemo, useCallback } from "react";

import {
  Control,
  Controller,
  FieldError,
  FieldErrorsImpl,
  FormState,
  Merge,
} from "react-hook-form";
import { DynamicIcon } from "@/components/common";
// import { getAllIcons } from "@/utils";

interface IIconPickerInputProps {
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

  /**
   * The colour of the icons
   */
  iconColour?: string;
}

export const IconPickerInput = (props: IIconPickerInputProps) => {
  const [search, setSearch] = useState("");
  const { token: themeToken } = theme.useToken();

  const allIcons = useMemo(() => [], []);
  const [pageSize, setPageSize] = useState(100);

  const [displayedIcons, setDisplayedIcons] = useState(
    // allIcons is an object, so only get the first pageSize items
    Object.keys(allIcons).slice(0, pageSize),
  );

  const loadMore = useCallback(() => {
    setDisplayedIcons(Object.keys(allIcons).slice(0, pageSize));
    setPageSize(pageSize + 100);
  }, [displayedIcons, pageSize]);

  const searchIcons = useCallback((input: string) => {
    setSearch(input);
    setPageSize(100);

    if (!allIcons || !Object.keys(allIcons).length) {
      return;
    }

    if (!input) {
      setDisplayedIcons(Object.keys(allIcons).slice(0, 100));
    } else {
      setDisplayedIcons(
        Object.keys(allIcons)
          .filter((x) => x.toLowerCase().includes(input.toLowerCase()))
          .slice(0, 100),
      );
    }
  }, []);

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
        render={({ field }) => (
          <Form.Item
            className="!mb-0 w-full"
            validateStatus={errors ? "error" : "success"}
            help={errors?.message as string}
          >
            <Popover
              trigger="click"
              placement="bottomLeft"
              onOpenChange={() => {
                {
                  setPageSize(100);
                  setDisplayedIcons(Object.keys(allIcons).slice(0, 100));
                  setSearch("");
                }
              }}
              content={
                <div>
                  <Input
                    value={search || ""}
                    onChange={(e) => searchIcons(e.target.value)}
                    placeholder="Search icons"
                    autoFocus
                  />

                  <div className="mt-3 flex max-h-[20em] w-[26em] flex-wrap justify-center gap-2 overflow-y-auto">
                    {displayedIcons.map((iconName, index) => (
                      <div
                        key={index}
                        style={{
                          background: "rgba(0, 0, 0, 0.2)",
                          border:
                            iconName === field.value
                              ? `2px solid ${themeToken.colorPrimary}`
                              : `2px dashed ${SECONDARY_COLOUR}`,
                        }}
                        className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-md text-3xl"
                        onClick={() => field.onChange(iconName)}
                      >
                        <DynamicIcon
                          iconName={iconName}
                          iconColour={props.iconColour}
                        />
                      </div>
                    ))}

                    <div className="my-2 flex w-full justify-center">
                      <Button
                        aria-label="Load more icons"
                        size="middle"
                        onClick={() => loadMore()}
                        disabled={
                          displayedIcons.length ===
                            Object.keys(allIcons).length ||
                          displayedIcons.length === 0 ||
                          displayedIcons.length < pageSize
                        }
                      >
                        Load More
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-4">
                    <Button
                      size="small"
                      onClick={() => field.onChange(null)}
                      aria-label="Clear icon"
                    >
                      Clear
                    </Button>
                    <span>{field.value}</span>
                  </div>
                </div>
              }
            >
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.2)",
                  border: `2px dashed ${SECONDARY_COLOUR}`,
                }}
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-lg text-3xl"
              >
                {field.value ? (
                  <DynamicIcon
                    iconName={field.value}
                    iconColour={props.iconColour}
                  />
                ) : (
                  <div className="text-xs">None</div>
                )}
              </div>
            </Popover>
          </Form.Item>
        )}
      />
    </div>
  );
};
