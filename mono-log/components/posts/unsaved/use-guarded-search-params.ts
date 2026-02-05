"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { mergeSearchParams } from "@/lib/routing/mergeSearchParams";
import type { MergeHomeSearchParamsPatch } from "@/lib/routing/types";

import { useConfirmDiscard, useHasUnsavedChanges } from "./unsaved-changes-provider";

type GuardedNavigation = {
  guardedPush: (patch: MergeHomeSearchParamsPatch) => Promise<boolean>;
  guardedReplace: (patch: MergeHomeSearchParamsPatch) => Promise<boolean>;
};

const buildHref = (pathname: string, params: URLSearchParams) => {
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
};

export function useGuardedSearchParams(): GuardedNavigation {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasEdits = useHasUnsavedChanges();
  const confirmDiscard = useConfirmDiscard();

  const navigate = useCallback(
    async (
      patch: MergeHomeSearchParamsPatch,
      fn: (href: string) => void
    ): Promise<boolean> => {
      if (hasEdits) {
        const ok = await confirmDiscard();
        if (!ok) return false;
      }
      const current = new URLSearchParams(searchParams?.toString() ?? "");
      const next = mergeSearchParams(current, patch);
      fn(buildHref(pathname, next));
      return true;
    },
    [confirmDiscard, hasEdits, pathname, searchParams]
  );

  const guardedPush = useCallback(
    (patch: MergeHomeSearchParamsPatch) => navigate(patch, router.push),
    [navigate, router.push]
  );

  const guardedReplace = useCallback(
    (patch: MergeHomeSearchParamsPatch) => navigate(patch, router.replace),
    [navigate, router.replace]
  );

  return { guardedPush, guardedReplace };
}
