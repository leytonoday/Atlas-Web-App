import {
  AiOutlineFileAdd,
  AiOutlineFileText,
  AiOutlineFileWord,
} from "react-icons/ai";

export const mimeTypeToIcon = (mimeType: string) => {
  switch (mimeType) {
    case "application/pdf": {
      return <AiOutlineFileAdd className="text-2xl md:text-4xl" />;
    }
    case "text/plain": {
      return <AiOutlineFileText className="text-2xl md:text-4xl" />;
    }
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      return <AiOutlineFileWord className="text-2xl md:text-4xl" />;
    }
  }
};
