"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type MemoEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  disabled?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
  className?: string;
};

export function MemoEditor({
  value,
  onChange,
  onSubmit,
  placeholder,
  disabled,
  inputRef,
  className,
}: MemoEditorProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit?.();
    }
  };

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    />
  );
}
