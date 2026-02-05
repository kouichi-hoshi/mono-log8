import { normalizeTagLabel, normalizeTagLabels, validateTagLabel } from "./tags";

describe("normalizeTagLabel", () => {
  test("normalizes whitespace and trims", () => {
    expect(normalizeTagLabel("  foo\t\nbar  ")).toBe("foo bar");
  });

  test("normalizes NFKC", () => {
    expect(normalizeTagLabel("ｶﾀｶﾅ")).toBe("カタカナ");
  });

  test("removes control characters", () => {
    expect(normalizeTagLabel("foo\u0007bar")).toBe("foobar");
  });
});

describe("normalizeTagLabels", () => {
  test("deduplicates after normalization", () => {
    expect(normalizeTagLabels([" foo ", "foo", "bar"])).toEqual(["foo", "bar"]);
  });

  test("drops empty labels", () => {
    expect(normalizeTagLabels(["  ", "\n", "tag"])).toEqual(["tag"]);
  });
});

describe("validateTagLabel", () => {
  test("returns error for empty", () => {
    expect(validateTagLabel(" ")).toEqual({
      ok: false,
      code: "validation/tags/label-empty",
    });
  });

  test("returns error for too long", () => {
    const longLabel = "a".repeat(33);
    expect(validateTagLabel(longLabel)).toEqual({
      ok: false,
      code: "validation/tags/label-too-long",
    });
  });

  test("accepts valid label", () => {
    expect(validateTagLabel("React")).toEqual({ ok: true });
  });
});
