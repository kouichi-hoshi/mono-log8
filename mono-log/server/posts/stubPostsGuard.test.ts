import { isStubPostsEnabled } from "./stubPostsGuard";

describe("isStubPostsEnabled", () => {
  test("returns true only for non-test/prod with USE_STUB_POSTS=true", () => {
    expect(isStubPostsEnabled("development", "true")).toBe(true);
    expect(isStubPostsEnabled("test", "true")).toBe(false);
    expect(isStubPostsEnabled("production", "true")).toBe(false);
  });

  test("returns false when USE_STUB_POSTS is not true", () => {
    expect(isStubPostsEnabled("development", undefined)).toBe(false);
    expect(isStubPostsEnabled("development", "false")).toBe(false);
  });
});
