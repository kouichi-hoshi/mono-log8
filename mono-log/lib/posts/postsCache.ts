import type { InfiniteData, QueryClient } from "@tanstack/react-query";

import type { FindManyPostsResult, PostMode, PostSummary } from "@/lib/posts/types";
import { buildPostsQueryKey } from "@/lib/posts/queryKeys";

type PostsInfinite = InfiniteData<FindManyPostsResult>;

type Comparator<T> = (a: T, b: T) => number;

const comparePostSummary: Comparator<PostSummary> = (a, b) => {
  if (a.createdAt !== b.createdAt) return b.createdAt.localeCompare(a.createdAt);
  return b.postId.localeCompare(a.postId);
};

const mapPages = (
  infinite: PostsInfinite,
  fn: (page: FindManyPostsResult) => FindManyPostsResult
): PostsInfinite => {
  return {
    pageParams: infinite.pageParams,
    pages: infinite.pages.map(fn),
  };
};

export const removeById = (infinite: PostsInfinite, postId: string): PostsInfinite => {
  return mapPages(infinite, (page) => ({
    ...page,
    items: page.items.filter((item) => item.postId !== postId),
  }));
};

export const upsertSorted = (
  infinite: PostsInfinite,
  post: PostSummary,
  comparator: Comparator<PostSummary> = comparePostSummary
): PostsInfinite => {
  const index = infinite.pages.findIndex((page) =>
    page.items.some((item) => item.postId === post.postId)
  );

  if (index >= 0) {
    const nextPages = infinite.pages.map((page, pageIndex) => {
      if (pageIndex === index) {
        const nextItems = page.items
          .map((item) => (item.postId === post.postId ? post : item))
          .sort(comparator);
        return { ...page, items: nextItems };
      }
      return {
        ...page,
        items: page.items.filter((item) => item.postId !== post.postId),
      };
    });
    return { pageParams: infinite.pageParams, pages: nextPages };
  }

  const firstPage = infinite.pages[0];
  if (!firstPage) return infinite;

  const nextFirst = {
    ...firstPage,
    items: [post, ...firstPage.items.filter((item) => item.postId !== post.postId)].sort(
      comparator
    ),
  };

  const nextRest = infinite.pages.slice(1).map((page) => ({
    ...page,
    items: page.items.filter((item) => item.postId !== post.postId),
  }));

  return {
    pageParams: infinite.pageParams,
    pages: [nextFirst, ...nextRest],
  };
};

const setInfiniteData = (
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  updater: (prev: PostsInfinite) => PostsInfinite
) => {
  queryClient.setQueryData<PostsInfinite>(queryKey, (prev) => {
    if (!prev) return prev;
    return updater(prev);
  });
};

export const postsCache = {
  clearFiltersCache(queryClient: QueryClient) {
    queryClient.removeQueries({ queryKey: ["posts-filter"] });
  },

  onPostUpserted(queryClient: QueryClient, post: PostSummary) {
    const key = buildPostsQueryKey({ view: "normal", mode: post.mode });
    setInfiniteData(queryClient, key, (prev) => upsertSorted(prev, post));
  },

  onPostTrashed(
    queryClient: QueryClient,
    params: { postId: string; mode: PostMode }
  ) {
    const normalKey = buildPostsQueryKey({ view: "normal", mode: params.mode });
    setInfiniteData(queryClient, normalKey, (prev) => removeById(prev, params.postId));

    // We cannot deterministically insert into the trash list (trashedAt is not in PostSummary).
    // Drop trash cache so the next open fetches the authoritative list.
    const trashKey = buildPostsQueryKey({ view: "trash" });
    queryClient.removeQueries({ queryKey: trashKey });
  },
} as const;
