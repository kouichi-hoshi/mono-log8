"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import {
  findPostsAction,
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
import {
  UnsavedChangesProvider,
  useConfirmDiscard,
  useHasUnsavedChanges,
} from "@/components/posts/unsaved/unsaved-changes-provider";
import { useGuardedSearchParams } from "@/components/posts/unsaved/use-guarded-search-params";
import type { PostMode, PostSummary, TagSummary } from "@/lib/posts/types";
import { texts } from "@/lib/texts";

type PostsPageProps = {
  mode: PostMode;
  view: "normal" | "trash";
  tags: string[];
  favorite: boolean;
  initialPosts: PostSummary[];
  initialError?: string | null;
};

export function PostsPage({
  mode,
  view,
  tags,
  favorite,
  initialPosts,
  initialError,
}: PostsPageProps) {
  return (
    <UnsavedChangesProvider>
      <PostsPageInner
        mode={mode}
        view={view}
        tags={tags}
        favorite={favorite}
        initialPosts={initialPosts}
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
  initialPosts,
  initialError,
}: PostsPageProps) {
  const [posts, setPosts] = React.useState<PostSummary[]>(initialPosts);
  const [editingPost, setEditingPost] = React.useState<PostSummary | null>(null);
  const [noteDialogOpen, setNoteDialogOpen] = React.useState(false);
  const [discardToken, setDiscardToken] = React.useState(0);
  const [tagCloud, setTagCloud] = React.useState<TagSummary[]>([]);
  const [favoritePendingIds, setFavoritePendingIds] = React.useState<Set<string>>(
    () => new Set()
  );
  const favoritePendingRef = React.useRef(new Set<string>());
  const [filters, setFilters] = React.useState({
    mode,
    view,
    tags,
    favorite,
  });
  const [errorMessage, setErrorMessage] = React.useState<string | null>(
    initialError ?? null
  );

  const searchParams = useSearchParams();
  const { guardedPush } = useGuardedSearchParams();
  const hasEdits = useHasUnsavedChanges();
  const confirmDiscard = useConfirmDiscard();

  const derivedFilters = React.useMemo(() => {
    if (!searchParams) return filters;
    return {
      mode: searchParams.get("mode") === "note" ? "note" : "memo",
      view: searchParams.get("view") === "trash" ? "trash" : "normal",
      tags: searchParams.getAll("tags"),
      favorite: searchParams.get("favorite") === "1",
    } satisfies typeof filters;
  }, [filters, searchParams]);

  const matchesFilters = React.useCallback(
    (post: PostSummary, nextFilters = filters) => {
      if (nextFilters.view === "trash") return false;
      if (post.mode !== nextFilters.mode) return false;
      if (nextFilters.favorite && !post.favorite) return false;
      if (nextFilters.tags.length > 0) {
        const tagIds = post.tags.map((tag) => tag.tagId);
        if (!nextFilters.tags.some((id) => tagIds.includes(id))) return false;
      }
      return true;
    },
    [filters]
  );

  const loadTagCloud = React.useCallback(async () => {
    const result = await findTagCloudAction();
    if (!result.ok) {
      return;
    }
    setTagCloud(result.data);
  }, []);

  React.useEffect(() => {
    const same =
      filters.mode === derivedFilters.mode &&
      filters.view === derivedFilters.view &&
      filters.favorite === derivedFilters.favorite &&
      filters.tags.join("\n") === derivedFilters.tags.join("\n");
    if (same) return;

    setFilters(derivedFilters);
    setEditingPost(null);
    setNoteDialogOpen(false);
    setDiscardToken((prev) => prev + 1);

    const load = async () => {
      setErrorMessage(null);
      const result = await findPostsAction({
        status: derivedFilters.view === "trash" ? "trashed" : "active",
        mode: derivedFilters.view === "trash" ? undefined : derivedFilters.mode,
        tags: derivedFilters.view === "trash" ? [] : derivedFilters.tags,
        favorite: derivedFilters.view === "trash" ? false : derivedFilters.favorite,
        limit: 10,
      });
      if (!result.ok) {
        setErrorMessage(result.message || texts.toast.error.unknownError);
        setPosts([]);
        return;
      }
      setPosts(result.data.items);
    };
    void load();
  }, [derivedFilters, filters]);

  React.useEffect(() => {
    if (filters.view === "trash") {
      setTagCloud([]);
      return;
    }
    void loadTagCloud();
  }, [filters.view, loadTagCloud]);

  const handleCreated = (post: PostSummary) => {
    if (!matchesFilters(post)) return;
    setPosts((prev) => [post, ...prev]);
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
    if (!matchesFilters(post)) {
      setPosts((prev) => prev.filter((item) => item.postId !== post.postId));
    } else {
      setPosts((prev) =>
        prev.map((item) => (item.postId === post.postId ? post : item))
      );
    }
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
    setPosts((prev) => prev.filter((item) => item.postId !== post.postId));
    void loadTagCloud();
  };

  const locked = noteDialogOpen;
  const allowActions = filters.view !== "trash";
  const showFilters = filters.view !== "trash";

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,360px)_1fr]">
      <section className="rounded-xl border bg-card p-4">
        <h2 className="text-sm font-semibold">{texts.posts.editorTitle}</h2>
        {filters.view === "trash" ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {texts.posts.trashDisabled}
          </p>
        ) : (
          <div className="mt-4">
            <NewPostEditor
              mode={filters.mode}
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
        {errorMessage ? (
          <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
        ) : null}
        {showFilters ? (
          <div className="mt-4 space-y-3">
            <TagFilter
              tags={tagCloud}
              activeTagIds={filters.tags}
              onToggle={async (tagId) => {
                const next = filters.tags.includes(tagId)
                  ? filters.tags.filter((item) => item !== tagId)
                  : [...filters.tags, tagId];
                await guardedPush({ tags: next });
              }}
            />
            <div className="flex flex-wrap items-center gap-2">
              <FavoriteFilter
                active={filters.favorite}
                onToggle={async () => guardedPush({ favorite: !filters.favorite })}
              />
              <ClearFilters
                disabled={!filters.favorite && filters.tags.length === 0}
                onClick={async () => guardedPush({ tags: [], favorite: false })}
              />
            </div>
          </div>
        ) : null}
        <div className="mt-4">
          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">{texts.posts.empty}</p>
          ) : (
            <PostList
              posts={posts}
              onEdit={allowActions ? handleEdit : () => undefined}
              onDelete={allowActions ? handleDelete : () => undefined}
              onToggleFavorite={allowActions ? handleToggleFavorite : undefined}
              actionsDisabled={!allowActions}
              showFavorite={filters.view !== "trash"}
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
