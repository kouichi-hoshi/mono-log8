"use client";

import * as React from "react";
import { toast } from "sonner";

import { trashPostAction } from "@/app/_actions/posts";
import { NewPostEditor } from "@/components/posts/editor/new-post-editor";
import { EditMemoInline } from "@/components/posts/editor/edit-memo-inline";
import { EditNoteDialog } from "@/components/posts/editor/edit-note-dialog";
import { PostList } from "@/components/posts/list/post-list";
import {
  UnsavedChangesProvider,
  useConfirmDiscard,
  useHasUnsavedChanges,
} from "@/components/posts/unsaved/unsaved-changes-provider";
import type { PostMode, PostSummary } from "@/lib/posts/types";
import { texts } from "@/lib/texts";

type PostsPageProps = {
  mode: PostMode;
  view: "normal" | "trash";
  initialPosts: PostSummary[];
  initialError?: string | null;
};

export function PostsPage({ mode, view, initialPosts, initialError }: PostsPageProps) {
  return (
    <UnsavedChangesProvider>
      <PostsPageInner
        mode={mode}
        view={view}
        initialPosts={initialPosts}
        initialError={initialError}
      />
    </UnsavedChangesProvider>
  );
}

function PostsPageInner({ mode, view, initialPosts, initialError }: PostsPageProps) {
  const [posts, setPosts] = React.useState<PostSummary[]>(initialPosts);
  const [editingPost, setEditingPost] = React.useState<PostSummary | null>(null);
  const [noteDialogOpen, setNoteDialogOpen] = React.useState(false);
  const [discardToken, setDiscardToken] = React.useState(0);

  const hasEdits = useHasUnsavedChanges();
  const confirmDiscard = useConfirmDiscard();

  const handleCreated = (payload: {
    postId: string;
    mode: PostMode;
    contentText: string;
  }) => {
    if (view === "trash") return;
    if (payload.mode !== mode) return;
    const createdAt = new Date().toISOString();
    const next: PostSummary = {
      postId: payload.postId,
      mode: payload.mode,
      createdAt,
      tags: [],
      favorite: false,
      contentText: payload.contentText,
    };
    setPosts((prev) => [next, ...prev]);
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

  const handleMemoUpdated = (postId: string, nextText: string) => {
    setPosts((prev) =>
      prev.map((item) =>
        item.postId === postId ? { ...item, contentText: nextText } : item
      )
    );
    setEditingPost(null);
  };

  const handleNoteUpdated = (postId: string, nextText: string) => {
    setPosts((prev) =>
      prev.map((item) =>
        item.postId === postId ? { ...item, contentText: nextText } : item
      )
    );
    setEditingPost(null);
    setNoteDialogOpen(false);
  };

  const handleDelete = async (post: PostSummary) => {
    const result = await trashPostAction({ postId: post.postId });
    if (!result.ok) {
      toast(result.message || texts.toast.error.unknownError);
      return;
    }
    toast(texts.toast.success.trashed);
    setPosts((prev) => prev.filter((item) => item.postId !== post.postId));
  };

  const locked = noteDialogOpen;
  const allowActions = view !== "trash";

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,360px)_1fr]">
      <section className="rounded-xl border bg-card p-4">
        <h2 className="text-sm font-semibold">{texts.posts.editorTitle}</h2>
        {view === "trash" ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {texts.posts.trashDisabled}
          </p>
        ) : (
          <div className="mt-4">
            <NewPostEditor
              mode={mode}
              locked={locked}
              discardToken={discardToken}
              onCreated={handleCreated}
            />
          </div>
        )}
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="text-sm font-semibold">{texts.posts.listTitle}</h2>
        {initialError ? (
          <p className="mt-2 text-sm text-muted-foreground">{initialError}</p>
        ) : null}
        <div className="mt-4">
          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">{texts.posts.empty}</p>
          ) : (
            <PostList
              posts={posts}
              onEdit={allowActions ? handleEdit : () => undefined}
              onDelete={allowActions ? handleDelete : () => undefined}
              actionsDisabled={!allowActions}
              renderOverride={(post) =>
                editingPost &&
                editingPost.mode === "memo" &&
                editingPost.postId === post.postId ? (
                  <EditMemoInline
                    postId={editingPost.postId}
                    initialText={editingPost.contentText}
                    tags={editingPost.tags}
                    favorite={editingPost.favorite}
                    onUpdated={(nextText) =>
                      handleMemoUpdated(editingPost.postId, nextText)
                    }
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
        onOpenChange={(open) => {
          setNoteDialogOpen(open);
          if (!open) setEditingPost(null);
        }}
        onUpdated={(nextText) =>
          editingPost ? handleNoteUpdated(editingPost.postId, nextText) : null
        }
      />
    </div>
  );
}
