import { readStubSession, STUB_USER } from "./stubSession";

describe("readStubSession", () => {
  test("returns session when cookie matches stub user", () => {
    const session = readStubSession(STUB_USER.id);
    expect(session?.user.id).toBe(STUB_USER.id);
    expect(session?.user.email).toBe(STUB_USER.email);
  });

  test("returns null for missing or mismatched cookie", () => {
    expect(readStubSession(undefined)).toBeNull();
    expect(readStubSession("unknown-user")).toBeNull();
  });
});

