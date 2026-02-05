"use client";

import type { PostTagId } from "@/lib/posts/types";

export function PostTags({ tags }: { tags: PostTagId[] }) {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
