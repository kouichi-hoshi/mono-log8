import { fireEvent, render, screen } from "@testing-library/react";

import { FavoriteFilter } from "./favorite-filter";
import { texts } from "@/lib/texts";

describe("FavoriteFilter", () => {
  test("invokes onToggle", () => {
    const onToggle = jest.fn();
    render(<FavoriteFilter active={false} onToggle={onToggle} />);

    fireEvent.click(screen.getByRole("button", { name: texts.post.favorite }));
    expect(onToggle).toHaveBeenCalled();
  });
});
