"use client";

import type { ReactNode } from "react";

import type { PostSummary } from "@/lib/posts/types";

import { PostCard } from "./post-card";

type PostListProps = {
  posts: PostSummary[];
  onEdit: (post: PostSummary) => void;
  onDelete: (post: PostSummary) => void;
  renderOverride?: (post: PostSummary) => ReactNode | null;
  actionsDisabled?: boolean;
};

export function PostList({
  posts,
  onEdit,
  onDelete,
  renderOverride,
  actionsDisabled = false,
}: PostListProps) {
  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const override = renderOverride?.(post);
        if (override) return <div key={post.postId}>{override}</div>;
        return (
          <PostCard
            key={post.postId}
            post={post}
            onEdit={onEdit}
            onDelete={onDelete}
            actionsDisabled={actionsDisabled}
          />
        );
      })}
    </div>
  );
}
