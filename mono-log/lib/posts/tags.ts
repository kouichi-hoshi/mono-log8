export type TagValidationError =
  | "validation/tags/label-empty"
  | "validation/tags/label-too-long";

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;

export const normalizeTagLabel = (value: string): string => {
  const normalized = value
    .normalize("NFKC")
    .replace(CONTROL_CHARS, "")
    .replace(/\s+/g, " ")
    .trim();
  return normalized;
};

export const normalizeTagLabels = (labels: string[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const label of labels) {
    const normalized = normalizeTagLabel(label);
    if (!normalized) {
      continue;
    }
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
};

export const validateTagLabel = (
  label: string
): { ok: true } | { ok: false; code: TagValidationError } => {
  if (!label.trim()) {
    return { ok: false, code: "validation/tags/label-empty" };
  }
  if (label.length > 32) {
    return { ok: false, code: "validation/tags/label-too-long" };
  }
  return { ok: true };
};
