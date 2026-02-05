"use client";

import { Skeleton } from "@/components/ui/skeleton";

type PostListSkeletonProps = {
  count: number;
};

export function PostListSkeleton({ count }: PostListSkeletonProps) {
  return (
    <div className="space-y-4" aria-label="loading">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-14" />
          </div>
          <div className="mt-3 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
