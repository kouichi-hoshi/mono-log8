import { fireEvent, render, screen } from "@testing-library/react";

import { TagEditor } from "./tag-editor";
import { texts } from "@/lib/texts";

describe("TagEditor", () => {
  test("adds and removes tags", () => {
    const onChange = jest.fn();
    const onError = jest.fn();
    render(
      <TagEditor
        tags={[]}
        onChange={onChange}
        onError={onError}
        suggestions={[]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: texts.post.tags }));

    const input = screen.getByPlaceholderText(texts.editor.placeholderTag);
    fireEvent.change(input, { target: { value: "React" } });
    fireEvent.click(screen.getByRole("button", { name: texts.editor.addTag }));

    expect(onChange).toHaveBeenCalledWith(["React"]);
  });
});
