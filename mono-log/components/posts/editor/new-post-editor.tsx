"use client";

import * as React from "react";
import { toast } from "sonner";

import { createPostAction } from "@/app/_actions/posts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { PostMode } from "@/lib/posts/types";
import { getValidationMessage } from "@/lib/posts/validationMessages";
import { texts } from "@/lib/texts";
import { useUnsavedChanges } from "@/components/posts/unsaved/unsaved-changes-provider";
import type { PostSummary, TagSummary } from "@/lib/posts/types";

import { EditorFrame } from "./editor-frame";
import { MemoEditor } from "./memo-editor";
import { NoteEditor } from "./note-editor";
import { createEmptyDoc, isEmptyDoc, type NoteDoc } from "./note-utils";
import { TagEditor } from "./tag-editor";

const memoPlaceholder = texts.editor.placeholderMemo;

type NewPostEditorProps = {
  mode: PostMode;
  locked?: boolean;
  discardToken?: number;
  tagSuggestions: TagSummary[];
  onCreated?: (post: PostSummary) => void;
};

export function NewPostEditor({
  mode,
  locked = false,
  discardToken,
  tagSuggestions,
  onCreated,
}: NewPostEditorProps) {
  const [memoValue, setMemoValue] = React.useState("");
  const [noteContent, setNoteContent] = React.useState<NoteDoc>(createEmptyDoc());
  const [tags, setTags] = React.useState<string[]>([]);
  const [expanded, setExpanded] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const hasEdits = mode === "memo"
    ? memoValue.trim().length > 0 || tags.length > 0
    : !isEmptyDoc(noteContent) || tags.length > 0;
  useUnsavedChanges("new-post-editor", hasEdits);

  React.useEffect(() => {
    if (!expanded) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [expanded]);

  React.useEffect(() => {
    if (!expanded) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setExpanded(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [expanded]);

  const resetEditor = () => {
    setMemoValue("");
    setNoteContent(createEmptyDoc());
    setTags([]);
    setErrorMessage(null);
    inputRef.current?.focus();
  };

  React.useEffect(() => {
    if (discardToken === undefined) return;
    resetEditor();
  }, [discardToken]);

  React.useEffect(() => {
    resetEditor();
  }, [mode]);

  const handleSave = async () => {
    if (locked) return;
    setErrorMessage(null);
    const payload =
      mode === "memo"
        ? { mode, content: memoValue, tags }
        : { mode, content: noteContent, tags };

    const result = await createPostAction(payload);
    if (!result.ok) {
      if (result.status === 422) {
        setErrorMessage(getValidationMessage(result.code));
      } else {
        toast(result.message || texts.toast.error.unknownError);
      }
      return;
    }

    toast(texts.toast.success.saved);
    onCreated?.({
      postId: result.data.postId,
      mode: result.data.mode,
      createdAt: result.data.createdAt,
      tags: result.data.tags,
      favorite: result.data.favorite,
      contentText: result.data.contentText,
    });
    resetEditor();
  };

  const editorBody =
    mode === "memo" ? (
      <MemoEditor
        value={memoValue}
        onChange={setMemoValue}
        onSubmit={handleSave}
        placeholder={memoPlaceholder}
        disabled={locked}
        inputRef={inputRef}
      />
    ) : (
      <NoteEditor
        content={noteContent}
        onChange={setNoteContent}
        readOnly={locked}
        testId="note-editor"
        editorClassName="min-h-[220px] w-full rounded-md border bg-background px-3 py-2 text-sm outline-none"
      />
    );

  return (
    <section className="space-y-3">
      {errorMessage ? (
        <Alert variant="destructive">
          <AlertTitle>{texts.toast.error.invalid}</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {mode === "memo" ? (
        <div className="rounded-xl border bg-card p-4">
          <div className="space-y-3">
            {editorBody}
            <TagEditor
              tags={tags}
              onChange={setTags}
              suggestions={tagSuggestions}
              disabled={locked}
              onError={setErrorMessage}
            />
            <div className="flex justify-end">
              <Button type="button" onClick={handleSave} disabled={locked}>
                {texts.editor.save}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={
            expanded
              ? "fixed inset-0 z-50 flex flex-col bg-background p-4"
              : "rounded-xl border bg-card p-4"
          }
          data-expanded={expanded}
          data-testid="note-editor-wrapper"
        >
          <EditorFrame
            title={texts.post.modeNote}
            closeLabel={texts.editor.collapse}
            onClose={() => setExpanded(false)}
            className={expanded ? "h-full border-0 bg-transparent" : "border-0 bg-transparent"}
            testId="note-editor-frame"
            showHeader={expanded}
            showFooter={expanded}
            footer={
              <div className="flex justify-end">
                <Button type="button" onClick={handleSave} disabled={locked}>
                  {texts.editor.save}
                </Button>
              </div>
            }
          >
            <div className="space-y-3">
              {editorBody}
              <TagEditor
                tags={tags}
                onChange={setTags}
                suggestions={tagSuggestions}
                disabled={locked}
                onError={setErrorMessage}
              />
              {!expanded ? (
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setExpanded(true)}
                    disabled={locked}
                  >
                    {texts.editor.expand}
                  </Button>
                  <Button type="button" onClick={handleSave} disabled={locked}>
                    {texts.editor.save}
                  </Button>
                </div>
              ) : null}
            </div>
          </EditorFrame>
        </div>
      )}
    </section>
  );
}
