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
    (updatePostAction as jest.Mock).mockResolvedValue({ ok: true, data: null });

    render(
      <UnsavedChangesProvider>
        <EditMemoInline
          postId="post-1"
          initialText="old"
          tags={[]}
          favorite={false}
          onUpdated={onUpdated}
          onCancel={() => undefined}
        />
      </UnsavedChangesProvider>
    );

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "new" } });
    fireEvent.click(screen.getByRole("button", { name: texts.editor.update }));

    await waitFor(() => expect(updatePostAction).toHaveBeenCalled());
    await waitFor(() => expect(onUpdated).toHaveBeenCalledWith("new"));
  });

  test("cancel with hasEdits shows confirm", async () => {
    const onCancel = jest.fn();
    (updatePostAction as jest.Mock).mockResolvedValue({ ok: true, data: null });

    render(
      <UnsavedChangesProvider>
        <EditMemoInline
          postId="post-1"
          initialText="old"
          tags={[]}
          favorite={false}
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
