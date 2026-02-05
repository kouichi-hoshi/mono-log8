export type NoteDoc = {
  type: "doc";
  content?: Array<{
    type: string;
    content?: Array<{ type: string; text?: string }>;
  }>;
};

export const createEmptyDoc = (): NoteDoc => ({
  type: "doc",
  content: [{ type: "paragraph", content: [] }],
});

const hasText = (node: unknown): boolean => {
  if (!node || typeof node !== "object") return false;
  if ((node as { type?: string }).type === "text") {
    return typeof (node as { text?: string }).text === "string" &&
      Boolean((node as { text?: string }).text?.trim())
      ? true
      : false;
  }
  const content = (node as { content?: unknown[] }).content;
  if (!Array.isArray(content)) return false;
  return content.some(hasText);
};

export const isEmptyDoc = (doc: unknown): boolean => {
  if (!doc || typeof doc !== "object") return true;
  return !hasText(doc);
};

export const isSameDoc = (a: unknown, b: unknown): boolean =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

const extractInlineText = (node: unknown): string => {
  if (!node || typeof node !== "object") return "";
  if ((node as { type?: string }).type === "text") {
    return typeof (node as { text?: string }).text === "string"
      ? (node as { text?: string }).text ?? ""
      : "";
  }
  const content = (node as { content?: unknown[] }).content;
  if (!Array.isArray(content)) return "";
  return content.map(extractInlineText).join("");
};

export const deriveNoteText = (doc: unknown): string => {
  if (!doc || typeof doc !== "object") return "";
  const content = (doc as { content?: unknown[] }).content;
  if (!Array.isArray(content)) return "";
  const blocks = content
    .map((block) => extractInlineText(block).trim())
    .filter((text) => text.length > 0);
  return blocks.join("\n").trim();
};
