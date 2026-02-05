import { fireEvent, render, screen } from "@testing-library/react";

import { PostPreview } from "@/components/posts/list/post-preview";
import { texts } from "@/lib/texts";

describe("PostPreview", () => {
  test("toggles note preview", () => {
    const content = Array.from({ length: 11 }, (_, i) => `line-${i + 1}`).join("\n");
    render(<PostPreview mode="note" contentText={content} />);

    const more = screen.getByRole("button", { name: texts.editor.more });
    fireEvent.click(more);
    screen.getByRole("button", { name: texts.editor.less });
  });
});
