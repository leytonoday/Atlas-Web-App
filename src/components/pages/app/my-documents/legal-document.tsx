import { BoxButton, SimpleTooltip } from "@/components/common";
import { ILegalDocument } from "@/types";
import { mimeTypeToIcon } from "./common/mime-type-to-icon";

interface ILegalDocumentProps {
  document: ILegalDocument;
  onClick: () => void;
}

export const LegalDocument = (props: ILegalDocumentProps) => {
  return (
    <SimpleTooltip text={props.document.name}>
      <BoxButton
        onClick={props.onClick}
        innerClassName="flex items-center justify-center flex-col"
      >
        {mimeTypeToIcon(props.document.mimeType)}
        <span className="text-xs text-gray-500 text-center line-clamp-2 px-1 break-all">
          {props.document.name}
        </span>
      </BoxButton>
    </SimpleTooltip>
  );
};
