import { normalizeHomeSearchParams } from "./normalizeHomeSearchParams";

describe("normalizeHomeSearchParams", () => {
  test("logged-in: / -> /?mode=memo (changed=true)", () => {
    const { canonical, changed } = normalizeHomeSearchParams({}, true);
    expect(canonical.toString()).toBe("mode=memo");
    expect(changed).toBe(true);
  });

  test("logged-in: invalid mode -> memo", () => {
    const { canonical, changed } = normalizeHomeSearchParams(
      { mode: "hoge" },
      true
    );
    expect(canonical.toString()).toBe("mode=memo");
    expect(changed).toBe(true);
  });

  test("logged-in: already canonical mode=memo -> unchanged", () => {
    const { canonical, changed } = normalizeHomeSearchParams(
      { mode: "memo" },
      true
    );
    expect(canonical.toString()).toBe("mode=memo");
    expect(changed).toBe(false);
  });

  test("logged-in: view=trash without mode adds mode", () => {
    const { canonical, changed } = normalizeHomeSearchParams(
      { view: "trash" },
      true
    );
    expect(canonical.toString()).toBe("mode=memo&view=trash");
    expect(changed).toBe(true);
  });

  test("logged-in: keep tags and mode=note when already canonical", () => {
    const { canonical, changed } = normalizeHomeSearchParams(
      { mode: "note", tags: "tag1" },
      true
    );
    expect(canonical.toString()).toBe("mode=note&tags=tag1");
    expect(changed).toBe(false);
  });

  test("logged-in: favorite=1 without mode adds mode", () => {
    const { canonical, changed } = normalizeHomeSearchParams(
      { favorite: "1" },
      true
    );
    expect(canonical.toString()).toBe("mode=memo&favorite=1");
    expect(changed).toBe(true);
  });

  test("logged-in: favorite=true -> favorite=1 and adds mode", () => {
    const { canonical, changed } = normalizeHomeSearchParams(
      { favorite: "true" },
      true
    );
    expect(canonical.toString()).toBe("mode=memo&favorite=1");
    expect(changed).toBe(true);
  });

  test("logged-in: tags are de-duplicated and sorted", () => {
    const { canonical, changed } = normalizeHomeSearchParams(
      { mode: "note", tags: ["b", "a", "a"] },
      true
    );
    expect(canonical.toString()).toBe("mode=note&tags=a&tags=b");
    expect(changed).toBe(true);
  });

  test("logged-in: unknown keys are preserved", () => {
    const { canonical, changed } = normalizeHomeSearchParams(
      { mode: "memo", errorTest: "1" },
      true
    );
    expect(canonical.toString()).toBe("mode=memo&errorTest=1");
    expect(changed).toBe(false);
  });

  test("logged-out: always returns empty canonical; changed depends on input", () => {
    const a = normalizeHomeSearchParams({}, false);
    expect(a.canonical.toString()).toBe("");
    expect(a.changed).toBe(false);

    const b = normalizeHomeSearchParams({ mode: "note" }, false);
    expect(b.canonical.toString()).toBe("");
    expect(b.changed).toBe(true);
  });
});

