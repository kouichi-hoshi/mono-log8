import { fireEvent, render, screen } from "@testing-library/react";

import { TagFilter } from "./tag-filter";

describe("TagFilter", () => {
  test("invokes onToggle", () => {
    const onToggle = jest.fn();
    render(
      <TagFilter
        tags={[{ tagId: "tag-1", label: "Work" }]}
        activeTagIds={[]}
        onToggle={onToggle}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Work" }));
    expect(onToggle).toHaveBeenCalledWith("tag-1");
  });
});
