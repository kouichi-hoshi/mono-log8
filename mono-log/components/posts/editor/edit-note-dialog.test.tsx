import { render, screen, waitFor, fireEvent } from "@testing-library/react";

import { EditNoteDialog } from "@/components/posts/editor/edit-note-dialog";
import { UnsavedChangesProvider } from "@/components/posts/unsaved/unsaved-changes-provider";
import { texts } from "@/lib/texts";
import { findPostAction, updatePostAction } from "@/app/_actions/posts";

jest.mock("@/app/_actions/posts", () => ({
  findPostAction: jest.fn(),
  updatePostAction: jest.fn(),
}));

describe("EditNoteDialog", () => {
  test("loads content and updates", async () => {
    (findPostAction as jest.Mock).mockResolvedValue({
      ok: true,
      data: {
        postId: "post-1",
        mode: "note",
        createdAt: new Date().toISOString(),
        tags: [],
        favorite: false,
        contentText: "hello",
        content: {
          type: "doc",
          content: [{ type: "paragraph", content: [{ type: "text", text: "hello" }] }],
        },
        status: "active",
        updatedAt: new Date().toISOString(),
        trashedAt: null,
      },
    });
    (updatePostAction as jest.Mock).mockResolvedValue({
      ok: true,
      data: {
        postId: "post-1",
        mode: "note",
        createdAt: new Date().toISOString(),
        tags: [],
        favorite: false,
        contentText: "hello",
        content: {
          type: "doc",
          content: [{ type: "paragraph", content: [{ type: "text", text: "hello" }] }],
        },
        status: "active",
        updatedAt: new Date().toISOString(),
        trashedAt: null,
      },
    });

    const onOpenChange = jest.fn();
    const onUpdated = jest.fn();

    render(
      <UnsavedChangesProvider>
        <EditNoteDialog
          open
          post={{
            postId: "post-1",
            mode: "note",
            createdAt: new Date().toISOString(),
            tags: [],
            favorite: false,
            contentText: "hello",
          }}
          tagSuggestions={[]}
          onOpenChange={onOpenChange}
          onUpdated={onUpdated}
        />
      </UnsavedChangesProvider>
    );

    await waitFor(() => expect(findPostAction).toHaveBeenCalled());

    const updateButton = screen.getByRole("button", { name: texts.editor.update });
    await waitFor(() => expect(updateButton).not.toBeDisabled());
    fireEvent.click(updateButton);
    await waitFor(() => expect(updatePostAction).toHaveBeenCalled());
  });
});
