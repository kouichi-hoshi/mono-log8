"use client";

import * as React from "react";

type UseInfiniteScrollSentinelParams = {
  disabled?: boolean;
  onIntersect: () => void;
  rootMargin?: string;
};

export const useInfiniteScrollSentinel = ({
  disabled = false,
  onIntersect,
  rootMargin = "200px",
}: UseInfiniteScrollSentinelParams) => {
  const observerRef = React.useRef<IntersectionObserver | null>(null);

  return React.useCallback(
    (node: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;

      if (!node) return;
      if (disabled) return;
      if (typeof IntersectionObserver === "undefined") return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          if (!entry.isIntersecting) return;
          onIntersect();
        },
        { rootMargin }
      );

      observerRef.current.observe(node);
    },
    [disabled, onIntersect, rootMargin]
  );
};
