import { render, screen } from "@testing-library/react";

import { texts } from "@/lib/texts";

import { PostCard } from "./post-card";

const basePost = {
  postId: "post-1",
  mode: "memo" as const,
  createdAt: "2025-01-01T00:00:00.000Z",
  tags: [],
  favorite: false,
  contentText: "hello",
};

describe("PostCard", () => {
  test("disables favorite button while pending", () => {
    render(
      <PostCard
        post={basePost}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        pendingFavoriteIds={new Set(["post-1"])}
      />
    );

    expect(
      screen.getByRole("button", { name: texts.post.favorite })
    ).toBeDisabled();
  });

  test("favorite button is enabled when not pending", () => {
    render(
      <PostCard
        post={basePost}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        pendingFavoriteIds={new Set()}
      />
    );

    expect(
      screen.getByRole("button", { name: texts.post.favorite })
    ).not.toBeDisabled();
  });
});
