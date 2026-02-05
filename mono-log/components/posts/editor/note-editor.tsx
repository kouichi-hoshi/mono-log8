"use client";

import * as React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { createEmptyDoc, isSameDoc, type NoteDoc } from "./note-utils";

type NoteEditorProps = {
  content: NoteDoc | null;
  onChange: (next: NoteDoc) => void;
  readOnly?: boolean;
  className?: string;
  editorClassName?: string;
  testId?: string;
};

export function NoteEditor({
  content,
  onChange,
  readOnly = false,
  className,
  editorClassName,
  testId,
}: NoteEditorProps) {
  const initial = React.useMemo(() => content ?? createEmptyDoc(), [content]);
  const lastContentRef = React.useRef<NoteDoc>(initial);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initial,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: editorClassName ??
          "min-h-[180px] w-full rounded-md border bg-background px-3 py-2 text-sm outline-none",
      },
    },
    onUpdate: ({ editor: instance }) => {
      const next = instance.getJSON() as NoteDoc;
      lastContentRef.current = next;
      onChange(next);
    },
  });

  React.useEffect(() => {
    if (!editor || !content) return;
    if (isSameDoc(lastContentRef.current, content)) return;
    editor.commands.setContent(content, false);
    lastContentRef.current = content;
  }, [editor, content]);

  return (
    <div className={className} data-testid={testId}>
      <EditorContent editor={editor} />
    </div>
  );
}
