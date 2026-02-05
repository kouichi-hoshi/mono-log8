import { texts } from "@/lib/texts";

export const getValidationMessage = (code?: string) => {
  switch (code) {
    case "validation/content/empty":
      return texts.toast.error.requiredContent;
    case "validation/content/memo":
      return texts.toast.error.memoTooLong;
    case "validation/content/note":
      return texts.toast.error.noteTooLong;
    case "validation/tags/max":
      return texts.toast.error.tooManyTags;
    case "validation/tags/label-empty":
      return texts.toast.error.invalid;
    case "validation/tags/label-too-long":
      return texts.toast.error.tagTooLong;
    default:
      return texts.toast.error.invalid;
  }
};
