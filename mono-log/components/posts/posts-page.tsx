"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import {
  findTagCloudAction,
  setFavoriteAction,
  trashPostAction,
} from "@/app/_actions/posts";
import { NewPostEditor } from "@/components/posts/editor/new-post-editor";
import { EditMemoInline } from "@/components/posts/editor/edit-memo-inline";
import { EditNoteDialog } from "@/components/posts/editor/edit-note-dialog";
import { ClearFilters } from "@/components/posts/filters/clear-filters";
import { FavoriteFilter } from "@/components/posts/filters/favorite-filter";
import { TagFilter } from "@/components/posts/filters/tag-filter";
import { PostList } from "@/components/posts/list/post-list";
import { PostListSkeleton } from "@/components/posts/list/post-list-skeleton";
import { useInfiniteScrollSentinel } from "@/components/posts/list/useInfiniteScrollSentinel";
import { Button } from "@/components/ui/button";
import {
  UnsavedChangesProvider,
  useConfirmDiscard,
  useHasUnsavedChanges,
} from "@/components/posts/unsaved/unsaved-changes-provider";
import { useGuardedSearchParams } from "@/components/posts/unsaved/use-guarded-search-params";
import type {
  FindManyPostsResult,
  PostMode,
  PostSummary,
  TagSummary,
} from "@/lib/posts/types";
import { queryClient } from "@/lib/queryClient";
import {
  buildPostsFilterQueryKey,
  buildPostsQueryKey,
  serializeQueryKey,
  shouldUseFilterQuery,
} from "@/lib/posts/queryKeys";
import { postsCache } from "@/lib/posts/postsCache";
import { usePostsInfiniteQuery } from "@/lib/posts/usePostsInfiniteQuery";
import { texts } from "@/lib/texts";

type PostsPageProps = {
  mode: PostMode;
  view: "normal" | "trash";
  tags: string[];
  favorite: boolean;
  initialResult: FindManyPostsResult | null;
  initialQueryKey: readonly unknown[] | null;
  initialError?: string | null;
};

export function PostsPage({
  mode,
  view,
  tags,
  favorite,
  initialResult,
  initialQueryKey,
  initialError,
}: PostsPageProps) {
  return (
    <UnsavedChangesProvider>
      <PostsPageInner
        mode={mode}
        view={view}
        tags={tags}
        favorite={favorite}
        initialResult={initialResult}
        initialQueryKey={initialQueryKey}
        initialError={initialError}
      />
    </UnsavedChangesProvider>
  );
}

function PostsPageInner({
  mode,
  view,
  tags,
  favorite,
  initialResult,
  initialQueryKey,
  initialError,
}: PostsPageProps) {
  const [editingPost, setEditingPost] = React.useState<PostSummary | null>(null);
  const [noteDialogOpen, setNoteDialogOpen] = React.useState(false);
  const [discardToken, setDiscardToken] = React.useState(0);
  const [tagCloud, setTagCloud] = React.useState<TagSummary[]>([]);
  const [favoritePendingIds, setFavoritePendingIds] = React.useState<Set<string>>(
    () => new Set()
  );
  const favoritePendingRef = React.useRef(new Set<string>());

  const searchParams = useSearchParams();
  const { guardedPush } = useGuardedSearchParams();
  const hasEdits = useHasUnsavedChanges();
  const confirmDiscard = useConfirmDiscard();

  const derivedFilters = React.useMemo(() => {
    if (!searchParams) {
      return { mode, view, tags, favorite } as const;
    }
    return {
      mode: searchParams.get("mode") === "note" ? "note" : "memo",
      view: searchParams.get("view") === "trash" ? "trash" : "normal",
      tags: searchParams.getAll("tags"),
      favorite: searchParams.get("favorite") === "1",
    } as const;
  }, [favorite, mode, searchParams, tags, view]);

  const isFiltering = shouldUseFilterQuery({
    view: derivedFilters.view,
    tags: derivedFilters.tags,
    favorite: derivedFilters.favorite,
  });

  const infinite = usePostsInfiniteQuery({
    mode: derivedFilters.mode,
    view: derivedFilters.view,
    tags: derivedFilters.tags,
    favorite: derivedFilters.favorite,
    initialResult,
    initialQueryKey: initialQueryKey ?? undefined,
  });

  const posts = React.useMemo(() => {
    return infinite.data?.pages.flatMap((page) => page.items) ?? [];
  }, [infinite.data]);

  const sentinelRef = useInfiniteScrollSentinel({
    disabled: !infinite.hasNextPage || infinite.isFetchingNextPage,
    onIntersect: () => {
      if (!infinite.hasNextPage) return;
      if (infinite.isFetchingNextPage) return;
      void infinite.fetchNextPage();
    },
  });

  React.useEffect(() => {
    if (!infinite.isFetchNextPageError) return;
    toast.error(texts.toast.error.unknownError);
  }, [infinite.isFetchNextPageError]);

  const loadTagCloud = React.useCallback(async () => {
    const result = await findTagCloudAction();
    if (!result.ok) {
      return;
    }
    setTagCloud(result.data);
  }, []);

  const previousFiltersKeyRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    const key = serializeQueryKey(
      isFiltering
        ? buildPostsFilterQueryKey({
            view: "normal",
            mode: derivedFilters.mode,
            tags: derivedFilters.tags,
            favorite: derivedFilters.favorite,
          })
        : buildPostsQueryKey({
            view: derivedFilters.view,
            mode: derivedFilters.mode,
          })
    );
    if (previousFiltersKeyRef.current === key) return;
    previousFiltersKeyRef.current = key;

    setEditingPost(null);
    setNoteDialogOpen(false);
    setDiscardToken((prev) => prev + 1);
  }, [derivedFilters, isFiltering]);

  React.useEffect(() => {
    if (derivedFilters.view === "trash") {
      setTagCloud([]);
      return;
    }
    void loadTagCloud();
  }, [derivedFilters.view, loadTagCloud]);

  const handleCreated = (post: PostSummary) => {
    postsCache.onPostUpserted(queryClient, post);
    postsCache.clearFiltersCache(queryClient);
    if (isFiltering) void infinite.refetch();
    void loadTagCloud();
  };

  const handleEdit = async (post: PostSummary) => {
    if (hasEdits) {
      const ok = await confirmDiscard();
      if (!ok) return;
      setDiscardToken((prev) => prev + 1);
      setNoteDialogOpen(false);
      setEditingPost(null);
    }
    setEditingPost(post);
    setNoteDialogOpen(post.mode === "note");
  };

  const handlePostUpdated = (post: PostSummary) => {
    postsCache.onPostUpserted(queryClient, post);
    postsCache.clearFiltersCache(queryClient);
    if (isFiltering) void infinite.refetch();
    setEditingPost(null);
    setNoteDialogOpen(false);
    void loadTagCloud();
  };

  const handleToggleFavorite = async (post: PostSummary) => {
    if (favoritePendingRef.current.has(post.postId)) return;
    setFavoritePendingIds((prev) => {
      const next = new Set(prev);
      next.add(post.postId);
      favoritePendingRef.current.add(post.postId);
      return next;
    });
    try {
      const result = await setFavoriteAction({
        postId: post.postId,
        favorite: !post.favorite,
      });
      if (!result.ok) {
        toast(result.message || texts.toast.error.unknownError);
        return;
      }
      handlePostUpdated(result.data);
    } finally {
      setFavoritePendingIds((prev) => {
        const next = new Set(prev);
        next.delete(post.postId);
        favoritePendingRef.current.delete(post.postId);
        return next;
      });
    }
  };

  const handleDelete = async (post: PostSummary) => {
    const result = await trashPostAction({ postId: post.postId });
    if (!result.ok) {
      toast(result.message || texts.toast.error.unknownError);
      return;
    }
    toast(texts.toast.success.trashed);
    postsCache.onPostTrashed(queryClient, { postId: post.postId, mode: post.mode });
    postsCache.clearFiltersCache(queryClient);
    if (isFiltering) void infinite.refetch();
    void loadTagCloud();
  };

  const locked = noteDialogOpen;
  const allowActions = derivedFilters.view !== "trash";
  const showFilters = derivedFilters.view !== "trash";

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,360px)_1fr]">
      <section className="rounded-xl border bg-card p-4">
        <h2 className="text-sm font-semibold">{texts.posts.editorTitle}</h2>
        {derivedFilters.view === "trash" ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {texts.posts.trashDisabled}
          </p>
        ) : (
          <div className="mt-4">
            <NewPostEditor
              mode={derivedFilters.mode}
              locked={locked}
              discardToken={discardToken}
              tagSuggestions={tagCloud}
              onCreated={handleCreated}
            />
          </div>
        )}
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="text-sm font-semibold">{texts.posts.listTitle}</h2>
        {initialError && infinite.isPending && !infinite.data ? (
          <p className="mt-2 text-sm text-muted-foreground">{initialError}</p>
        ) : null}
        {showFilters ? (
          <div className="mt-4 space-y-3">
            <TagFilter
              tags={tagCloud}
              activeTagIds={derivedFilters.tags}
              onToggle={async (tagId) => {
                const next = derivedFilters.tags.includes(tagId)
                  ? derivedFilters.tags.filter((item) => item !== tagId)
                  : [...derivedFilters.tags, tagId];
                await guardedPush({ tags: next });
              }}
            />
            <div className="flex flex-wrap items-center gap-2">
              <FavoriteFilter
                active={derivedFilters.favorite}
                onToggle={async () =>
                  guardedPush({ favorite: !derivedFilters.favorite })
                }
              />
              <ClearFilters
                disabled={!derivedFilters.favorite && derivedFilters.tags.length === 0}
                onClick={async () => guardedPush({ tags: [], favorite: false })}
              />
            </div>
          </div>
        ) : null}
        <div className="mt-4">
          {infinite.isPending && !infinite.data ? (
            <PostListSkeleton count={10} />
          ) : infinite.isError && !infinite.data ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {infinite.error?.message || texts.toast.error.unknownError}
              </p>
              <div>
                <Button type="button" variant="outline" onClick={() => void infinite.refetch()}>
                  {texts.toast.action.retry}
                </Button>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">{texts.posts.empty}</p>
          ) : (
            <div className="space-y-4">
              <PostList
                posts={posts}
                onEdit={allowActions ? handleEdit : () => undefined}
                onDelete={allowActions ? handleDelete : () => undefined}
                onToggleFavorite={allowActions ? handleToggleFavorite : undefined}
                actionsDisabled={!allowActions}
                showFavorite={derivedFilters.view !== "trash"}
                pendingFavoriteIds={favoritePendingIds}
                renderOverride={(post) =>
                  editingPost &&
                  editingPost.mode === "memo" &&
                  editingPost.postId === post.postId ? (
                    <EditMemoInline
                      postId={editingPost.postId}
                      initialText={editingPost.contentText}
                      tags={editingPost.tags}
                      favorite={editingPost.favorite}
                      tagSuggestions={tagCloud}
                      onUpdated={handlePostUpdated}
                      onCancel={() => setEditingPost(null)}
                    />
                  ) : null
                }
              />

              {infinite.isFetchingNextPage ? <PostListSkeleton count={10} /> : null}

              {infinite.isFetchNextPageError ? (
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void infinite.fetchNextPage()}
                    disabled={infinite.isFetchingNextPage}
                  >
                    {texts.toast.action.retry}
                  </Button>
                </div>
              ) : null}

              {infinite.hasNextPage ? (
                <div ref={sentinelRef} className="h-1" aria-hidden="true" />
              ) : null}
            </div>
          )}
        </div>
      </section>

      <EditNoteDialog
        open={noteDialogOpen}
        post={editingPost?.mode === "note" ? editingPost : null}
        tagSuggestions={tagCloud}
        onOpenChange={(open) => {
          setNoteDialogOpen(open);
          if (!open) setEditingPost(null);
        }}
        onUpdated={handlePostUpdated}
      />
    </div>
  );
}
