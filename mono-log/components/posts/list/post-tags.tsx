"use client";

import type { TagSummary } from "@/lib/posts/types";

export function PostTags({ tags }: { tags: TagSummary[] }) {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag.tagId}
          className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground"
        >
          {tag.label}
        </span>
      ))}
    </div>
  );
}
