"use client";

import type { ReactNode } from "react";

import type { PostSummary } from "@/lib/posts/types";

import { PostCard } from "./post-card";

type PostListProps = {
  posts: PostSummary[];
  onEdit: (post: PostSummary) => void;
  onDelete: (post: PostSummary) => void;
  onToggleFavorite?: (post: PostSummary) => void;
  renderOverride?: (post: PostSummary) => ReactNode | null;
  actionsDisabled?: boolean;
  showFavorite?: boolean;
  pendingFavoriteIds?: Set<string>;
};

export function PostList({
  posts,
  onEdit,
  onDelete,
  onToggleFavorite,
  renderOverride,
  actionsDisabled = false,
  showFavorite = true,
  pendingFavoriteIds,
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
            onToggleFavorite={onToggleFavorite}
            actionsDisabled={actionsDisabled}
            showFavorite={showFavorite}
            pendingFavoriteIds={pendingFavoriteIds}
          />
        );
      })}
    </div>
  );
}
