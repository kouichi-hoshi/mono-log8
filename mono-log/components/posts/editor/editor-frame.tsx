"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EditorFrameProps = {
  title: string;
  closeLabel: string;
  onClose: () => void;
  footer?: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
  children: React.ReactNode;
  testId?: string;
};

export function EditorFrame({
  title,
  closeLabel,
  onClose,
  footer,
  showHeader = true,
  showFooter = true,
  className,
  children,
  testId,
}: EditorFrameProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-xl border bg-card",
        className
      )}
      data-testid={testId}
    >
      {showHeader ? (
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">{title}</h2>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {closeLabel}
          </Button>
        </div>
      ) : null}
      <div className="flex-1 p-4">{children}</div>
      {footer && showFooter ? (
        <div className="border-t px-4 py-3">{footer}</div>
      ) : null}
    </div>
  );
}
