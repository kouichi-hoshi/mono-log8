import { validatePostInput } from "./validation";

const getStatus = (error: unknown) =>
  typeof error === "object" && error && "status" in error
    ? (error as { status?: number }).status
    : undefined;

describe("validatePostInput", () => {
  test("rejects empty content", () => {
    expect(() =>
      validatePostInput({
        mode: "memo",
        contentText: "   ",
        tags: [],
      })
    ).toThrow();
  });

  test("returns 422 for empty content", () => {
    try {
      validatePostInput({ mode: "memo", contentText: "", tags: [] });
      throw new Error("expected to throw");
    } catch (error) {
      expect(getStatus(error)).toBe(422);
    }
  });

  test("memo length limit 280", () => {
    const tooLong = "a".repeat(281);
    try {
      validatePostInput({ mode: "memo", contentText: tooLong, tags: [] });
      throw new Error("expected to throw");
    } catch (error) {
      expect(getStatus(error)).toBe(422);
    }
  });

  test("note length limit 20000", () => {
    const tooLong = "a".repeat(20001);
    try {
      validatePostInput({ mode: "note", contentText: tooLong, tags: [] });
      throw new Error("expected to throw");
    } catch (error) {
      expect(getStatus(error)).toBe(422);
    }
  });

  test("tag limit after normalization", () => {
    const tags = Array.from({ length: 11 }, (_, i) => `tag${i}`);
    try {
      validatePostInput({ mode: "memo", contentText: "ok", tags });
      throw new Error("expected to throw");
    } catch (error) {
      expect(getStatus(error)).toBe(422);
    }
  });
});
