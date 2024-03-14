import { services } from "@/services";
import { handleApiRequestError } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { Space, Input, Button, Alert } from "antd";
import { useState } from "react";

interface IPromotionCodeFormProps {
  /**
   * Reloads the quote invoice with the given promotion code
   */
  getQuoteInvoice: (promotionCode: string | null) => void;

  /**
   * The promotion code to display in the form at first
   */
  initialPromotionCode: string | null;
}

/**
 * Used to apply or display an already applied promotion code to the quoted invoice
 */
export const PromotionCodeForm = (props: IPromotionCodeFormProps) => {
  const [promotionCode, setPromotionCode] = useState<string>(
    props.initialPromotionCode || "",
  );

  const [isPromotionCodeValid, setIsPromotionCodeValid] = useState<
    boolean | null
  >(props.initialPromotionCode ? true : null); // If there is one initially, then it simply must be valid, since it's already applied

  // Apply promotion code mutation
  const { mutate: applyPromotionCode, isLoading } = useMutation({
    mutationFn: () =>
      services.api.stripe.isPromotionCodeValid(promotionCode || ""),
    onSuccess: (serverResponse) => {
      const isValid = serverResponse.data as boolean;
      setIsPromotionCodeValid(isValid);

      // If the given promotion code is valid, then reload the quote invoice with the promotion code
      if (isValid) {
        props.getQuoteInvoice(promotionCode);
      }
      // Otherwise, if the given promotion code is invalid, then reload the quote invoice without the promotion code
      else {
        props.getQuoteInvoice(null);
      }
    },
    onError: handleApiRequestError,
  });

  const removePromotionCode = async () => {
    setPromotionCode("");
    props.getQuoteInvoice(null);
    setIsPromotionCodeValid(null);
  };

  return (
    <div>
      <Space.Compact style={{ width: "100%", marginTop: "1em" }}>
        <Input
          placeholder="Promotion code"
          value={promotionCode}
          onChange={(e) => {
            if (isPromotionCodeValid === false) {
              setIsPromotionCodeValid(null);
            }
            setPromotionCode(e.target.value);
          }}
        />
        <Button
          aria-label="Apply promotion code"
          type="primary"
          onClick={() => applyPromotionCode()}
          disabled={!promotionCode?.length}
          loading={isLoading}
        >
          Apply
        </Button>
      </Space.Compact>
      {isPromotionCodeValid === false && promotionCode.length > 0 && (
        <Alert
          message="Invalid promotion code. Will not be applied."
          type="error"
          showIcon
          style={{ marginTop: "1em" }}
        />
      )}
      {isPromotionCodeValid === true && (
        <Alert
          message="Promotion code applied"
          type="success"
          showIcon
          style={{ marginTop: "1em" }}
          action={
            <Button
              size="small"
              onClick={removePromotionCode}
              aria-label="Remove promotion code"
            >
              Remove
            </Button>
          }
        />
      )}
    </div>
  );
};
