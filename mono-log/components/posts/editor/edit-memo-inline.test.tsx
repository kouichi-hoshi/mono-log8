import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { EditMemoInline } from "@/components/posts/editor/edit-memo-inline";
import { UnsavedChangesProvider } from "@/components/posts/unsaved/unsaved-changes-provider";
import { texts } from "@/lib/texts";
import { updatePostAction } from "@/app/_actions/posts";

jest.mock("@/app/_actions/posts", () => ({
  updatePostAction: jest.fn(),
}));

describe("EditMemoInline", () => {
  test("updates memo content", async () => {
    const onUpdated = jest.fn();
    (updatePostAction as jest.Mock).mockResolvedValue({
      ok: true,
      data: {
        postId: "post-1",
        mode: "memo",
        createdAt: "2025-01-01T00:00:00.000Z",
        tags: [],
        favorite: false,
        contentText: "new",
        content: { type: "doc", content: [] },
        status: "active",
        updatedAt: "2025-01-01T00:00:00.000Z",
        trashedAt: null,
      },
    });

    render(
      <UnsavedChangesProvider>
        <EditMemoInline
          postId="post-1"
          initialText="old"
          tags={[]}
          favorite={false}
          tagSuggestions={[]}
          onUpdated={onUpdated}
          onCancel={() => undefined}
        />
      </UnsavedChangesProvider>
    );

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "new" } });
    fireEvent.click(screen.getByRole("button", { name: texts.editor.update }));

    await waitFor(() => expect(updatePostAction).toHaveBeenCalled());
    await waitFor(() =>
      expect(onUpdated).toHaveBeenCalledWith(
        expect.objectContaining({ postId: "post-1", contentText: "new" })
      )
    );
  });

  test("cancel with hasEdits shows confirm", async () => {
    const onCancel = jest.fn();
    (updatePostAction as jest.Mock).mockResolvedValue({
      ok: true,
      data: {
        postId: "post-1",
        mode: "memo",
        createdAt: "2025-01-01T00:00:00.000Z",
        tags: [],
        favorite: false,
        contentText: "old",
        content: { type: "doc", content: [] },
        status: "active",
        updatedAt: "2025-01-01T00:00:00.000Z",
        trashedAt: null,
      },
    });

    render(
      <UnsavedChangesProvider>
        <EditMemoInline
          postId="post-1"
          initialText="old"
          tags={[]}
          favorite={false}
          tagSuggestions={[]}
          onUpdated={() => undefined}
          onCancel={onCancel}
        />
      </UnsavedChangesProvider>
    );

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "changed" } });
    fireEvent.click(screen.getByRole("button", { name: texts.editor.cancel }));

    const discard = await screen.findByRole("button", { name: texts.guard.discard });
    fireEvent.click(discard);

    await waitFor(() => expect(onCancel).toHaveBeenCalled());
  });
});
