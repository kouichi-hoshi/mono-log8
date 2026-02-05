import { fireEvent, render, screen } from "@testing-library/react";

import { ClearFilters } from "./clear-filters";
import { texts } from "@/lib/texts";

describe("ClearFilters", () => {
  test("invokes onClick", () => {
    const onClick = jest.fn();
    render(<ClearFilters onClick={onClick} />);

    fireEvent.click(screen.getByRole("button", { name: texts.post.clearFilters }));
    expect(onClick).toHaveBeenCalled();
  });
});
