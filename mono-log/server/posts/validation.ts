import type { PostMode, PostTagId } from "./postRepository";

export type ValidationContext = {
  mode: PostMode;
  contentText: string;
  tags: PostTagId[];
};

const createError = (status: number, message: string, code: string) => {
  const error = new Error(message) as Error & { status?: number; code?: string };
  error.status = status;
  error.code = code;
  return error;
};

export const normalizeTagIds = (tags: PostTagId[]): PostTagId[] => {
  const set = new Set<PostTagId>();
  for (const tag of tags) {
    if (!tag) continue;
    set.add(tag);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
};

export const validatePostInput = ({
  mode,
  contentText,
  tags,
}: ValidationContext): void => {
  const trimmed = contentText.trim();
  if (trimmed.length === 0) {
    throw createError(422, "Content is required", "validation/content/empty");
  }

  if (mode === "memo" && trimmed.length > 280) {
    throw createError(422, "Memo content exceeds limit", "validation/content/memo");
  }

  if (mode === "note" && trimmed.length > 20000) {
    throw createError(422, "Note content exceeds limit", "validation/content/note");
  }

  const normalizedTags = normalizeTagIds(tags);
  if (normalizedTags.length > 10) {
    throw createError(422, "Too many tags", "validation/tags/max");
  }
};
