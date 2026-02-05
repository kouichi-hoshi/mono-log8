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
        tagsCount: 0,
      })
    ).toThrow();
  });

  test("returns 422 for empty content", () => {
    try {
      validatePostInput({ mode: "memo", contentText: "", tagsCount: 0 });
      throw new Error("expected to throw");
    } catch (error) {
      expect(getStatus(error)).toBe(422);
    }
  });

  test("memo length limit 280", () => {
    const tooLong = "a".repeat(281);
    try {
      validatePostInput({ mode: "memo", contentText: tooLong, tagsCount: 0 });
      throw new Error("expected to throw");
    } catch (error) {
      expect(getStatus(error)).toBe(422);
    }
  });

  test("note length limit 20000", () => {
    const tooLong = "a".repeat(20001);
    try {
      validatePostInput({ mode: "note", contentText: tooLong, tagsCount: 0 });
      throw new Error("expected to throw");
    } catch (error) {
      expect(getStatus(error)).toBe(422);
    }
  });

  test("tag limit after normalization", () => {
    const tagsCount = 11;
    try {
      validatePostInput({ mode: "memo", contentText: "ok", tagsCount });
      throw new Error("expected to throw");
    } catch (error) {
      expect(getStatus(error)).toBe(422);
    }
  });
});
