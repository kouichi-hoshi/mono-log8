"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import type { TagSummary } from "@/lib/posts/types";
import { normalizeTagLabel, validateTagLabel } from "@/lib/posts/tags";
import { texts } from "@/lib/texts";

const MAX_TAGS = 10;

type TagEditorProps = {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions: TagSummary[];
  disabled?: boolean;
  onError?: (message: string | null) => void;
};

export function TagEditor({
  tags,
  onChange,
  suggestions,
  disabled = false,
  onError,
}: TagEditorProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const emitError = (message: string | null) => {
    onError?.(message);
  };

  const addTag = (raw: string) => {
    const normalized = normalizeTagLabel(raw);
    const validation = validateTagLabel(normalized);
    if (!validation.ok) {
      emitError(
        validation.code === "validation/tags/label-too-long"
          ? texts.toast.error.tagTooLong
          : texts.toast.error.invalid
      );
      return;
    }
    if (tags.includes(normalized)) {
      setInputValue("");
      emitError(null);
      return;
    }
    if (tags.length >= MAX_TAGS) {
      emitError(texts.toast.error.tooManyTags);
      return;
    }
    onChange([...tags, normalized]);
    setInputValue("");
    emitError(null);
  };

  const removeTag = (label: string) => {
    onChange(tags.filter((tag) => tag !== label));
    emitError(null);
  };

  const availableSuggestions = suggestions.filter(
    (tag) => !tags.includes(tag.label)
  );

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen((prev) => !prev)}
        disabled={disabled}
      >
        {texts.post.tags}
      </Button>

      {open ? (
        <div className="space-y-3 rounded-md border bg-background p-3">
          {availableSuggestions.length ? (
            <div className="flex flex-wrap gap-2">
              {availableSuggestions.map((tag) => (
                <Button
                  key={tag.tagId}
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => addTag(tag.label)}
                  disabled={disabled}
                >
                  {tag.label}
                </Button>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <input
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                if (disabled) return;
                addTag(inputValue);
              }}
              placeholder={texts.editor.placeholderTag}
              className="flex-1 rounded-md border px-2 py-1 text-sm"
              disabled={disabled}
            />
            <Button
              type="button"
              size="sm"
              onClick={() => addTag(inputValue)}
              disabled={disabled}
            >
              {texts.editor.addTag}
            </Button>
          </div>

          {tags.length ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((label) => (
                <button
                  key={label}
                  type="button"
                  className="rounded-full border px-2 py-0.5 text-xs"
                  onClick={() => removeTag(label)}
                  disabled={disabled}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
