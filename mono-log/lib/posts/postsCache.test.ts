import type { InfiniteData } from "@tanstack/react-query";

import type { FindManyPostsResult, PostSummary } from "@/lib/posts/types";

import { removeById, upsertSorted } from "./postsCache";

const post = (overrides: Partial<PostSummary>): PostSummary => ({
  postId: "post-1",
  mode: "memo",
  createdAt: "2025-01-01T00:00:00.000Z",
  tags: [],
  favorite: false,
  contentText: "hello",
  ...overrides,
});

describe("postsCache", () => {
  test("removeById removes from all pages", () => {
    const data: InfiniteData<FindManyPostsResult> = {
      pageParams: [undefined, "cursor-1"],
      pages: [
        { items: [post({ postId: "a" }), post({ postId: "b" })], nextCursor: "b" },
        { items: [post({ postId: "c" })], nextCursor: null },
      ],
    };

    const next = removeById(data, "b");

    expect(next.pages[0]?.items.map((p) => p.postId)).toEqual(["a"]);
    expect(next.pages[1]?.items.map((p) => p.postId)).toEqual(["c"]);
  });

  test("upsertSorted keeps updated post in its page and removes duplicates", () => {
    const data: InfiniteData<FindManyPostsResult> = {
      pageParams: [undefined, "cursor-1"],
      pages: [
        {
          items: [post({ postId: "b", createdAt: "2025-01-01T00:00:00.000Z" })],
          nextCursor: "b",
        },
        {
          items: [post({ postId: "a", createdAt: "2024-12-31T00:00:00.000Z" })],
          nextCursor: null,
        },
      ],
    };

    const updated = post({ postId: "a", contentText: "updated" });
    const next = upsertSorted(data, updated);

    expect(next.pages[0]?.items.map((p) => p.postId)).toEqual(["b"]);
    expect(next.pages[1]?.items.map((p) => p.postId)).toEqual(["a"]);
    expect(next.pages[1]?.items[0]?.contentText).toBe("updated");
  });

  test("upsertSorted inserts into first page when not found", () => {
    const data: InfiniteData<FindManyPostsResult> = {
      pageParams: [undefined],
      pages: [
        {
          items: [post({ postId: "b", createdAt: "2025-01-01T00:00:00.000Z" })],
          nextCursor: "b",
        },
      ],
    };

    const created = post({ postId: "c", createdAt: "2025-02-01T00:00:00.000Z" });
    const next = upsertSorted(data, created);

    expect(next.pages[0]?.items.map((p) => p.postId)).toEqual(["c", "b"]);
  });
});
