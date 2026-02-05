import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { NewPostEditor } from "@/components/posts/editor/new-post-editor";
import { UnsavedChangesProvider } from "@/components/posts/unsaved/unsaved-changes-provider";
import { texts } from "@/lib/texts";
import { createPostAction } from "@/app/_actions/posts";

jest.mock("@/app/_actions/posts", () => ({
  createPostAction: jest.fn(),
}));

describe("NewPostEditor", () => {
  test("saves memo and clears input", async () => {
    (createPostAction as jest.Mock).mockResolvedValue({
      ok: true,
      data: { postId: "post-1" },
    });

    render(
      <UnsavedChangesProvider>
        <NewPostEditor mode="memo" />
      </UnsavedChangesProvider>
    );

    const input = screen.getByPlaceholderText(texts.editor.placeholderMemo);
    fireEvent.change(input, { target: { value: "hello" } });

    fireEvent.click(screen.getByRole("button", { name: texts.editor.save }));

    await waitFor(() => expect(createPostAction).toHaveBeenCalled());
    await waitFor(() => expect(input).toHaveValue(""));
    expect(input).toHaveFocus();
  });

  test("note editor expands and collapses", () => {
    render(
      <UnsavedChangesProvider>
        <NewPostEditor mode="note" />
      </UnsavedChangesProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: texts.editor.expand }));
    expect(screen.getByTestId("note-editor-wrapper")).toHaveAttribute(
      "data-expanded",
      "true"
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.getByTestId("note-editor-wrapper")).toHaveAttribute(
      "data-expanded",
      "false"
    );
  });
});
