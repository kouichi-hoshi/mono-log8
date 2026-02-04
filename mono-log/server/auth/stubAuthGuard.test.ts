import { isStubAuthEnabled } from "./stubAuthGuard";

describe("isStubAuthEnabled", () => {
  test("returns true only for non-test/prod with USE_STUB_AUTH=true", () => {
    expect(isStubAuthEnabled("development", "true")).toBe(true);
    expect(isStubAuthEnabled("test", "true")).toBe(false);
    expect(isStubAuthEnabled("production", "true")).toBe(false);
  });

  test("returns false when USE_STUB_AUTH is not true", () => {
    expect(isStubAuthEnabled("development", undefined)).toBe(false);
    expect(isStubAuthEnabled("development", "false")).toBe(false);
  });
});

