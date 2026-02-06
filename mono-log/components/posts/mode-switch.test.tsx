import { fireEvent, render, screen } from "@testing-library/react";

import { ModeSwitch } from "./mode-switch";
import { texts } from "@/lib/texts";

describe("ModeSwitch", () => {
  test("invokes onChangeView", () => {
    const onChangeMode = jest.fn();
    const onChangeView = jest.fn();

    render(
      <ModeSwitch
        mode="memo"
        view="normal"
        onChangeMode={onChangeMode}
        onChangeView={onChangeView}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: texts.trash.title }));
    expect(onChangeView).toHaveBeenCalledWith("trash");
  });

  test("invokes onChangeMode", () => {
    const onChangeMode = jest.fn();
    const onChangeView = jest.fn();

    render(
      <ModeSwitch
        mode="memo"
        view="normal"
        onChangeMode={onChangeMode}
        onChangeView={onChangeView}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: texts.post.modeNote }));
    expect(onChangeMode).toHaveBeenCalledWith("note");
  });

  test("does not invoke onChangeView when clicking active view", () => {
    const onChangeMode = jest.fn();
    const onChangeView = jest.fn();

    render(
      <ModeSwitch
        mode="memo"
        view="normal"
        onChangeMode={onChangeMode}
        onChangeView={onChangeView}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: texts.posts.listTitle }));
    expect(onChangeView).not.toHaveBeenCalled();
  });

  test("does not invoke onChangeMode when clicking active mode", () => {
    const onChangeMode = jest.fn();
    const onChangeView = jest.fn();

    render(
      <ModeSwitch
        mode="memo"
        view="normal"
        onChangeMode={onChangeMode}
        onChangeView={onChangeView}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: texts.post.modeMemo }));
    expect(onChangeMode).not.toHaveBeenCalled();
  });

  test("hides mode switch when hideModeSwitch is true", () => {
    const onChangeMode = jest.fn();
    const onChangeView = jest.fn();

    render(
      <ModeSwitch
        mode="memo"
        view="trash"
        hideModeSwitch
        onChangeMode={onChangeMode}
        onChangeView={onChangeView}
      />
    );

    expect(
      screen.queryByRole("button", { name: texts.post.modeMemo })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: texts.post.modeNote })
    ).not.toBeInTheDocument();
  });
});
