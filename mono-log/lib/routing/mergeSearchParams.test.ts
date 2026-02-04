import { mergeSearchParams } from "./mergeSearchParams";
import type { MergeHomeSearchParamsPatch } from "./types";

describe("mergeSearchParams", () => {
  test("applies patch and normalizes (mode/view/tags/favorite) while preserving unknown keys", () => {
    const current = new URLSearchParams(
      "mode=memo&tags=b&tags=a&tags=a&favorite=true&view=hoge&x=1"
    );

    const next = mergeSearchParams(current, { mode: "note" });
    expect(next.toString()).toBe("mode=note&tags=a&tags=b&favorite=1&x=1");
  });

  test("can remove view by providing view: undefined (own property)", () => {
    const current = new URLSearchParams("mode=memo&view=trash");
    const patch: MergeHomeSearchParamsPatch = { view: undefined };

    const next = mergeSearchParams(current, patch);
    expect(next.toString()).toBe("mode=memo");
  });

  test("can clear tags by providing tags: []", () => {
    const current = new URLSearchParams("mode=memo&tags=b&tags=a");
    const next = mergeSearchParams(current, { tags: [] });
    expect(next.toString()).toBe("mode=memo");
  });

  test("favorite=false removes favorite", () => {
    const current = new URLSearchParams("mode=memo&favorite=1");
    const next = mergeSearchParams(current, { favorite: false });
    expect(next.toString()).toBe("mode=memo");
  });
});

