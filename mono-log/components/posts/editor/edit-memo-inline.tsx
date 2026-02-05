"use client";

import * as React from "react";
import { toast } from "sonner";

import { updatePostAction } from "@/app/_actions/posts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { PostSummary, TagSummary } from "@/lib/posts/types";
import { getValidationMessage } from "@/lib/posts/validationMessages";
import { texts } from "@/lib/texts";
import { useUnsavedChanges } from "@/components/posts/unsaved/unsaved-changes-provider";

import { MemoEditor } from "./memo-editor";
import { TagEditor } from "./tag-editor";

type EditMemoInlineProps = {
  postId: string;
  initialText: string;
  tags: TagSummary[];
  favorite: boolean;
  tagSuggestions: TagSummary[];
  onUpdated: (next: PostSummary) => void;
  onCancel: () => void;
};

export function EditMemoInline({
  postId,
  initialText,
  tags,
  favorite,
  tagSuggestions,
  onUpdated,
  onCancel,
}: EditMemoInlineProps) {
  const [value, setValue] = React.useState(initialText);
  const [tagLabels, setTagLabels] = React.useState(() => tags.map((tag) => tag.label));
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const hasEdits =
    value !== initialText ||
    tagLabels.join("\n") !== tags.map((tag) => tag.label).join("\n");
  const confirmDiscard = useUnsavedChanges(`edit-memo-${postId}`, hasEdits);

  const handleCancel = async () => {
    if (hasEdits) {
      const ok = await confirmDiscard();
      if (!ok) return;
    }
    onCancel();
  };

  const handleUpdate = async () => {
    setErrorMessage(null);
    const result = await updatePostAction({
      postId,
      content: value,
      tags: tagLabels,
      favorite,
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
    onUpdated({
      postId: result.data.postId,
      mode: result.data.mode,
      createdAt: result.data.createdAt,
      tags: result.data.tags,
      favorite: result.data.favorite,
      contentText: result.data.contentText,
    });
  };

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="rounded-xl border bg-card p-4">
      {errorMessage ? (
        <Alert variant="destructive" className="mb-3">
          <AlertTitle>{texts.toast.error.invalid}</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}
      <MemoEditor
        value={value}
        onChange={setValue}
        inputRef={inputRef}
      />
      <div className="mt-3">
        <TagEditor
          tags={tagLabels}
          onChange={setTagLabels}
          suggestions={tagSuggestions}
          onError={setErrorMessage}
        />
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={handleCancel}>
          {texts.editor.cancel}
        </Button>
        <Button type="button" onClick={handleUpdate}>
          {texts.editor.update}
        </Button>
      </div>
    </div>
  );
}
