import type { PostMode, PostTagId } from "@/lib/posts/types";

type PostsView = "normal" | "trash";

type PostsKeyParams = {
  view: PostsView;
  mode?: PostMode;
};

type PostsFilterKeyParams = {
  view: "normal";
  mode: PostMode;
  tags: PostTagId[];
  favorite: boolean;
};

const normalizeTags = (tags: PostTagId[]) => {
  const set = new Set<string>();
  for (const tag of tags) {
    if (!tag) continue;
    set.add(tag);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
};

export const buildPostsQueryKey = ({ view, mode }: PostsKeyParams) => {
  if (view === "trash") {
    return ["posts", { view: "trash" }] as const;
  }
  return ["posts", { view: "normal", mode }] as const;
};

export const buildPostsFilterQueryKey = ({
  view,
  mode,
  tags,
  favorite,
}: PostsFilterKeyParams) => {
  return [
    "posts-filter",
    {
      view,
      mode,
      tags: normalizeTags(tags),
      favorite,
    },
  ] as const;
};

export const shouldUseFilterQuery = (params: {
  view: PostsView;
  tags: PostTagId[];
  favorite: boolean;
}) => {
  return params.view === "normal" && (params.favorite || params.tags.length > 0);
};

export const serializeQueryKey = (key: readonly unknown[]) =>
  JSON.stringify(key);

export const normalizeTagsForQuery = normalizeTags;
