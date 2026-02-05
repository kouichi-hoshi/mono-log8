import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";

import { findPostsAction } from "@/app/_actions/posts";
import { texts } from "@/lib/texts";
import type { FindManyPostsResult, PostMode, PostTagId } from "@/lib/posts/types";
import {
  buildPostsFilterQueryKey,
  buildPostsQueryKey,
  normalizeTagsForQuery,
  serializeQueryKey,
  shouldUseFilterQuery,
} from "@/lib/posts/queryKeys";

type UsePostsInfiniteQueryParams = {
  mode: PostMode;
  view: "normal" | "trash";
  tags: PostTagId[];
  favorite: boolean;
  initialResult?: FindManyPostsResult | null;
  initialQueryKey?: readonly unknown[];
};

const LIMIT = 10;

export const usePostsInfiniteQuery = ({
  mode,
  view,
  tags,
  favorite,
  initialResult,
  initialQueryKey,
}: UsePostsInfiniteQueryParams) => {
  const normalizedTags = normalizeTagsForQuery(tags);
  const useFilter = shouldUseFilterQuery({ view, tags: normalizedTags, favorite });
  const queryKey = useFilter
    ? buildPostsFilterQueryKey({
        view: "normal",
        mode,
        tags: normalizedTags,
        favorite,
      })
    : buildPostsQueryKey({ view, mode });

  const shouldUseInitial = Boolean(
    initialResult &&
      initialQueryKey &&
      serializeQueryKey(initialQueryKey) === serializeQueryKey(queryKey)
  );

  const initialData: InfiniteData<FindManyPostsResult> | undefined =
    shouldUseInitial && initialResult
      ? { pages: [initialResult], pageParams: [undefined] }
      : undefined;

  return useInfiniteQuery<FindManyPostsResult, Error>({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const result = await findPostsAction({
        status: view === "trash" ? "trashed" : "active",
        mode: view === "trash" ? undefined : mode,
        tags: view === "trash" ? [] : normalizedTags,
        favorite: view === "trash" ? false : favorite,
        limit: LIMIT,
        cursor: pageParam as string | undefined,
      });
      if (!result.ok) {
        throw new Error(result.message || texts.toast.error.unknownError);
      }
      return result.data;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialData,
    staleTime: useFilter ? 0 : undefined,
    gcTime: useFilter ? 0 : undefined,
    refetchOnMount: useFilter ? "always" : false,
    refetchOnWindowFocus: useFilter ? true : false,
    refetchOnReconnect: useFilter ? true : false,
  });
};
