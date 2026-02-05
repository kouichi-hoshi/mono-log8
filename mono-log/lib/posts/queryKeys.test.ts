import { buildPostsFilterQueryKey, buildPostsQueryKey } from "./queryKeys";

describe("queryKeys", () => {
  test("buildPostsQueryKey normal and trash", () => {
    expect(buildPostsQueryKey({ view: "normal", mode: "memo" })).toEqual([
      "posts",
      { view: "normal", mode: "memo" },
    ]);

    expect(buildPostsQueryKey({ view: "trash" })).toEqual(["posts", { view: "trash" }]);
  });

  test("buildPostsFilterQueryKey normalizes tags", () => {
    const key = buildPostsFilterQueryKey({
      view: "normal",
      mode: "memo",
      tags: ["b", "a", "a", ""],
      favorite: true,
    });

    expect(key).toEqual([
      "posts-filter",
      { view: "normal", mode: "memo", tags: ["a", "b"], favorite: true },
    ]);
  });
});
