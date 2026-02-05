import type { TagSummary, PostTagId } from "@/lib/posts/types";

import { normalizeTagLabel, validateTagLabel } from "@/lib/posts/tags";

import type { StubPostsStoreData, StubTagRecord } from "./stubPostsStore";

export type ResolveTagLabelsInput = {
  data: StubPostsStoreData;
  ownerId: string;
  labels: string[];
  now: () => string;
  generateId: () => string;
};

export type ResolveTagLabelsResult = {
  tagIds: PostTagId[];
  tags: StubTagRecord[];
};

export const resolveTagLabels = ({
  data,
  ownerId,
  labels,
  now,
  generateId,
}: ResolveTagLabelsInput): ResolveTagLabelsResult => {
  const normalized = labels.map((label) => normalizeTagLabel(label));
  for (const label of normalized) {
    const validation = validateTagLabel(label);
    if (!validation.ok) {
      const error = new Error("Invalid tag label") as Error & { code?: string };
      error.code = validation.code;
      throw error;
    }
  }

  const uniqueLabels: string[] = [];
  const seen = new Set<string>();
  for (const label of normalized) {
    if (seen.has(label)) continue;
    seen.add(label);
    uniqueLabels.push(label);
  }

  const nextTags = data.tags.slice();
  const tagIds: PostTagId[] = [];
  for (const label of uniqueLabels) {
    const existing = nextTags.find(
      (tag) => tag.ownerId === ownerId && tag.label === label
    );
    if (existing) {
      tagIds.push(existing.tagId);
      continue;
    }
    const tagId = generateId();
    const timestamp = now();
    nextTags.push({
      tagId,
      ownerId,
      label,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    tagIds.push(tagId);
  }

  return { tagIds, tags: nextTags };
};

export const resolveTagSummaries = (
  data: StubPostsStoreData,
  tagIds: PostTagId[]
): TagSummary[] => {
  const map = new Map(data.tags.map((tag) => [tag.tagId, tag]));
  return tagIds
    .map((tagId) => map.get(tagId))
    .filter((tag): tag is StubTagRecord => Boolean(tag))
    .map((tag) => ({ tagId: tag.tagId, label: tag.label }));
};

export const buildTagCloud = (
  data: StubPostsStoreData,
  ownerId: string
): TagSummary[] => {
  const activeTagIds = new Set<PostTagId>();
  for (const post of data.posts) {
    if (post.authorId !== ownerId) continue;
    if (post.status !== "active") continue;
    for (const tagId of post.tags) {
      if (!tagId) continue;
      activeTagIds.add(tagId);
    }
  }

  const items = data.tags
    .filter((tag) => tag.ownerId === ownerId && activeTagIds.has(tag.tagId))
    .map((tag) => ({ tagId: tag.tagId, label: tag.label }));

  return items.sort((a, b) => a.label.localeCompare(b.label));
};
