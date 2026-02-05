"use client";

import { Button } from "@/components/ui/button";
import type { TagSummary } from "@/lib/posts/types";

type TagFilterProps = {
  tags: TagSummary[];
  activeTagIds: string[];
  onToggle: (tagId: string) => void;
};

export function TagFilter({ tags, activeTagIds, onToggle }: TagFilterProps) {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const active = activeTagIds.includes(tag.tagId);
        return (
          <Button
            key={tag.tagId}
            type="button"
            size="sm"
            variant={active ? "secondary" : "outline"}
            onClick={() => onToggle(tag.tagId)}
          >
            {tag.label}
          </Button>
        );
      })}
    </div>
  );
}
