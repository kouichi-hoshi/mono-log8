import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import type { PostSummary } from "@/lib/posts/types";
import { PostsPage } from "@/components/posts/posts-page";
import { findPostsAction, findTagCloudAction } from "@/app/_actions/posts";
import { buildPostsQueryKey } from "@/lib/posts/queryKeys";
import { texts } from "@/lib/texts";

let currentParams = "mode=memo";
const push = jest.fn();
const replace = jest.fn();

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(currentParams),
  useRouter: () => ({ push, replace }),
  usePathname: () => "/",
}));

jest.mock("@/app/_actions/posts", () => ({
  findPostsAction: jest.fn(),
  findTagCloudAction: jest.fn(),
  setFavoriteAction: jest.fn(),
  trashPostAction: jest.fn(),
}));

const basePost: PostSummary = {
  postId: "post-1",
  mode: "memo",
  createdAt: "2025-01-01T00:00:00.000Z",
  tags: [],
  favorite: false,
  contentText: "hello",
};

describe("PostsPage", () => {
  beforeEach(() => {
    currentParams = "mode=memo";
    push.mockReset();
    replace.mockReset();
    (findPostsAction as jest.Mock).mockReset();
    (findTagCloudAction as jest.Mock).mockReset();
    (findTagCloudAction as jest.Mock).mockResolvedValue({ ok: true, data: [] });
  });

  test("clears list when mode switch load fails", async () => {
    (findPostsAction as jest.Mock).mockResolvedValue({
      ok: false,
      message: "Load failed",
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <PostsPage
          mode="memo"
          view="normal"
          tags={[]}
          favorite={false}
          initialResult={{ items: [basePost], nextCursor: null }}
          initialQueryKey={buildPostsQueryKey({ view: "normal", mode: "memo" })}
          initialError={null}
        />
      </QueryClientProvider>
    );

    expect(screen.getByText("hello")).toBeInTheDocument();

    currentParams = "mode=note";
    rerender(
      <QueryClientProvider client={queryClient}>
        <PostsPage
          mode="memo"
          view="normal"
          tags={[]}
          favorite={false}
          initialResult={{ items: [basePost], nextCursor: null }}
          initialQueryKey={buildPostsQueryKey({ view: "normal", mode: "memo" })}
          initialError={null}
        />
      </QueryClientProvider>
    );

    await waitFor(() => expect(findPostsAction).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.queryByText("hello")).not.toBeInTheDocument()
    );
    expect(screen.getByText("Load failed")).toBeInTheDocument();
  });

  test("updates URL via guarded navigation when switching mode/view", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <PostsPage
          mode="memo"
          view="normal"
          tags={[]}
          favorite={false}
          initialResult={{ items: [basePost], nextCursor: null }}
          initialQueryKey={buildPostsQueryKey({ view: "normal", mode: "memo" })}
          initialError={null}
        />
      </QueryClientProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: texts.post.modeNote }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/?mode=note"));

    push.mockReset();
    fireEvent.click(screen.getByRole("button", { name: texts.trash.title }));
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith("/?mode=memo&view=trash")
    );
  });

  test("can return to normal view by removing view param", async () => {
    currentParams = "mode=memo&view=trash";

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <PostsPage
          mode="memo"
          view="trash"
          tags={[]}
          favorite={false}
          initialResult={{ items: [basePost], nextCursor: null }}
          initialQueryKey={buildPostsQueryKey({ view: "trash", mode: "memo" })}
          initialError={null}
        />
      </QueryClientProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: texts.posts.listTitle }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/?mode=memo"));
  });
});
