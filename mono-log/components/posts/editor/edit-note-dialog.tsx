"use client";

import * as React from "react";
import { toast } from "sonner";

import { findPostAction, updatePostAction } from "@/app/_actions/posts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { PostSummary } from "@/lib/posts/types";
import { getValidationMessage } from "@/lib/posts/validationMessages";
import { texts } from "@/lib/texts";
import { useUnsavedChanges } from "@/components/posts/unsaved/unsaved-changes-provider";

import { EditorFrame } from "./editor-frame";
import { NoteEditor } from "./note-editor";
import { createEmptyDoc, deriveNoteText, isSameDoc, type NoteDoc } from "./note-utils";

type EditNoteDialogProps = {
  open: boolean;
  post: PostSummary | null;
  onOpenChange: (open: boolean) => void;
  onUpdated: (contentText: string) => void;
};

export function EditNoteDialog({ open, post, onOpenChange, onUpdated }: EditNoteDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [noteContent, setNoteContent] = React.useState<NoteDoc>(createEmptyDoc());
  const [initialContent, setInitialContent] = React.useState<NoteDoc | null>(null);

  const hasEdits =
    !!post &&
    initialContent !== null &&
    !isSameDoc(noteContent, initialContent);
  const confirmDiscard = useUnsavedChanges(
    post ? `edit-note-${post.postId}` : "edit-note-none",
    hasEdits
  );

  React.useEffect(() => {
    if (!open || !post) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setErrorMessage(null);
      const result = await findPostAction({ postId: post.postId });
      if (cancelled) return;
      if (!result.ok) {
        setErrorMessage(result.message || texts.toast.error.unknownError);
        setLoading(false);
        return;
      }
      const content = (result.data.content ?? createEmptyDoc()) as NoteDoc;
      setInitialContent(content);
      setNoteContent(content);
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [open, post]);

  const handleCloseRequest = async (nextOpen: boolean) => {
    if (!nextOpen && hasEdits) {
      const ok = await confirmDiscard();
      if (!ok) return;
    }
    onOpenChange(nextOpen);
  };

  const handleUpdate = async () => {
    if (!post) return;
    setErrorMessage(null);
    const result = await updatePostAction({
      postId: post.postId,
      content: noteContent,
      tags: post.tags,
      favorite: post.favorite,
    });
    if (!result.ok) {
      if (result.status === 422) {
        setErrorMessage(getValidationMessage(result.code));
      } else {
        toast(result.message || texts.toast.error.unknownError);
      }
      return;
    }

    toast(texts.toast.success.updated);
    onUpdated(deriveNoteText(noteContent));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseRequest}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{texts.post.edit}</DialogTitle>
          <DialogDescription className="sr-only">
            {texts.post.edit}
          </DialogDescription>
        </DialogHeader>
        {errorMessage ? (
          <Alert variant="destructive" className="mb-3">
            <AlertTitle>{texts.toast.error.invalid}</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}
        <EditorFrame
          title={texts.post.modeNote}
          closeLabel={texts.editor.cancel}
          onClose={() => handleCloseRequest(false)}
          className="border-0"
          footer={
            <div className="flex justify-end">
              <Button type="button" onClick={handleUpdate} disabled={loading}>
                {texts.editor.update}
              </Button>
            </div>
          }
        >
          <NoteEditor
            content={noteContent}
            onChange={setNoteContent}
            readOnly={loading}
            testId="note-editor"
          />
        </EditorFrame>
      </DialogContent>
    </Dialog>
  );
}
