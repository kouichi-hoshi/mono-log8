import type { PostContent, PostMode } from "./postRepository";

type ProseMirrorNode = {
  type?: string;
  text?: string;
  content?: ProseMirrorNode[];
};

const isNode = (value: unknown): value is ProseMirrorNode =>
  typeof value === "object" && value !== null;

const extractInlineText = (node: ProseMirrorNode): string => {
  if (node.type === "text" && typeof node.text === "string") {
    return node.text;
  }
  if (!Array.isArray(node.content)) return "";
  return node.content.map(extractInlineText).join("");
};

const extractBlockTexts = (doc: ProseMirrorNode): string[] => {
  if (!Array.isArray(doc.content)) return [];
  return doc.content
    .map((block) => extractInlineText(block).trim())
    .filter((text) => text.length > 0);
};

const normalizeOneLine = (text: string): string =>
  text.replace(/\r\n/g, "\n").replace(/\n+/g, " ").replace(/\s+/g, " ").trim();

const normalizeNoteText = (text: string): string =>
  text.replace(/\r\n/g, "\n").trim();

export const deriveContentText = (mode: PostMode, content: unknown): string => {
  if (mode === "memo") {
    if (typeof content === "string") return normalizeOneLine(content);
    if (!isNode(content)) return "";
    const blocks = extractBlockTexts(content);
    const joined = blocks.length > 0 ? blocks.join(" ") : extractInlineText(content);
    return normalizeOneLine(joined);
  }

  if (!isNode(content)) return "";
  const blocks = extractBlockTexts(content);
  return normalizeNoteText(blocks.join("\n"));
};

type MemoContentDoc = {
  type: "doc";
  content: Array<{
    type: "paragraph";
    content?: Array<{ type: "text"; text: string }>;
  }>;
};

const buildMemoContentDoc = (text: string): MemoContentDoc => {
  if (!text) {
    return {
      type: "doc",
      content: [{ type: "paragraph", content: [] }],
    };
  }
  return {
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  };
};

export const normalizeContentForMode = (
  mode: PostMode,
  content: unknown
): PostContent => {
  if (mode === "memo") {
    const text = deriveContentText("memo", content);
    return buildMemoContentDoc(text);
  }
  return content;
};
