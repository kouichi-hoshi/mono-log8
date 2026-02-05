"use client";

import dayjs from "dayjs";

import { Button } from "@/components/ui/button";
import type { PostSummary } from "@/lib/posts/types";
import { texts } from "@/lib/texts";

import { PostPreview } from "./post-preview";
import { PostTags } from "./post-tags";

type PostCardProps = {
  post: PostSummary;
  onEdit: (post: PostSummary) => void;
  onDelete: (post: PostSummary) => void;
  actionsDisabled?: boolean;
};

export function PostCard({ post, onEdit, onDelete, actionsDisabled = false }: PostCardProps) {
  const actionClass = actionsDisabled
    ? "flex items-center gap-2 opacity-50"
    : "flex items-center gap-2";
  return (
    <article className="rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">
            {post.mode === "memo" ? texts.post.modeMemo : texts.post.modeNote}
          </p>
          <p className="text-xs text-muted-foreground">
            {dayjs(post.createdAt).format("YYYY-MM-DD HH:mm")}
          </p>
        </div>
        <div className={actionClass} aria-disabled={actionsDisabled}>
          <span
            className={post.favorite ? "text-yellow-500" : "text-muted-foreground"}
            aria-label={texts.post.favorite}
          >
            {post.favorite ? "★" : "☆"}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onEdit(post)}
            disabled={actionsDisabled}
          >
            {texts.post.edit}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onDelete(post)}
            disabled={actionsDisabled}
          >
            {texts.post.delete}
          </Button>
        </div>
      </div>
      <div className="mt-3 space-y-3">
        <PostTags tags={post.tags} />
        <PostPreview mode={post.mode} contentText={post.contentText} />
      </div>
    </article>
  );
}
