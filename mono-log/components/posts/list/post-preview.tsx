"use client";

import * as React from "react";

import type { PostMode } from "@/lib/posts/types";
import { texts } from "@/lib/texts";

const clampStyle = {
  display: "-webkit-box",
  WebkitLineClamp: 10,
  WebkitBoxOrient: "vertical" as const,
  overflow: "hidden",
};

type PostPreviewProps = {
  mode: PostMode;
  contentText: string;
};

export function PostPreview({ mode, contentText }: PostPreviewProps) {
  const [expanded, setExpanded] = React.useState(false);
  const isNote = mode === "note";
  const lineCount = contentText.split("\n").length;
  const showToggle = isNote && lineCount > 10;

  if (!isNote) {
    return <p className="text-sm text-foreground">{contentText}</p>;
  }

  return (
    <div className="space-y-2">
      <p
        className="text-sm text-foreground whitespace-pre-wrap"
        style={expanded ? undefined : clampStyle}
        data-expanded={expanded}
      >
        {contentText}
      </p>
      {showToggle ? (
        <button
          type="button"
          className="text-xs text-muted-foreground underline"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? texts.editor.less : texts.editor.more}
        </button>
      ) : null}
    </div>
  );
}
