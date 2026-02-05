"use client";

import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { texts } from "@/lib/texts";

type UnsavedChangesContextValue = {
  hasEdits: boolean;
  register: (id: string, value: boolean) => void;
  unregister: (id: string) => void;
  confirmDiscard: () => Promise<boolean>;
};

const UnsavedChangesContext = React.createContext<UnsavedChangesContextValue | null>(
  null
);

export function UnsavedChangesProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = React.useState<Record<string, boolean>>({});
  const [open, setOpen] = React.useState(false);
  const resolverRef = React.useRef<((value: boolean) => void) | null>(null);
  const pendingRef = React.useRef<Promise<boolean> | null>(null);

  const hasEdits = React.useMemo(
    () => Object.values(entries).some(Boolean),
    [entries]
  );

  const register = React.useCallback((id: string, value: boolean) => {
    setEntries((prev) => {
      if (prev[id] === value) return prev;
      return { ...prev, [id]: value };
    });
  }, []);

  const unregister = React.useCallback((id: string) => {
    setEntries((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const confirmDiscard = React.useCallback(() => {
    if (pendingRef.current) return pendingRef.current;
    pendingRef.current = new Promise<boolean>((resolve) => {
      resolverRef.current = (value: boolean) => {
        resolve(value);
        resolverRef.current = null;
        pendingRef.current = null;
        setOpen(false);
      };
      setOpen(true);
    });
    return pendingRef.current;
  }, []);

  React.useEffect(() => {
    if (!hasEdits) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasEdits]);

  const handleDiscard = () => {
    resolverRef.current?.(true);
  };

  const handleKeep = () => {
    resolverRef.current?.(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && resolverRef.current) {
      resolverRef.current(false);
      return;
    }
    setOpen(nextOpen);
  };

  const value = React.useMemo(
    () => ({ hasEdits, register, unregister, confirmDiscard }),
    [hasEdits, register, unregister, confirmDiscard]
  );

  return (
    <UnsavedChangesContext.Provider value={value}>
      {children}
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{texts.guard.unsavedTitle}</AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              {texts.guard.unsavedTitle}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleKeep}>
              {texts.guard.keep}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscard}>
              {texts.guard.discard}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChanges(id: string, hasEdits: boolean) {
  const context = React.useContext(UnsavedChangesContext);
  if (!context) {
    throw new Error("useUnsavedChanges must be used within UnsavedChangesProvider");
  }

  React.useEffect(() => {
    context.register(id, hasEdits);
    return () => context.unregister(id);
  }, [context, id, hasEdits]);

  return context.confirmDiscard;
}

export function useHasUnsavedChanges() {
  const context = React.useContext(UnsavedChangesContext);
  if (!context) {
    throw new Error("useHasUnsavedChanges must be used within UnsavedChangesProvider");
  }
  return context.hasEdits;
}

export function useConfirmDiscard() {
  const context = React.useContext(UnsavedChangesContext);
  if (!context) {
    throw new Error("useConfirmDiscard must be used within UnsavedChangesProvider");
  }
  return context.confirmDiscard;
}
