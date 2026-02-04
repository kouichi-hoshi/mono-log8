import type { AppSession, AuthUser } from "./types";

export const STUB_COOKIE_NAME = "stub-session";

export const STUB_USER: AuthUser = {
  id: "stub-user-1",
  name: "Stub User",
  email: "stub@example.com",
  image: null,
};

export type StubCookieDefinition = {
  name: string;
  value: string;
  options: {
    httpOnly: boolean;
    sameSite: "lax";
    path: "/";
    secure: boolean;
    maxAge?: number;
  };
};

const buildCookieOptions = (nodeEnv: string | undefined) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/" as const,
  secure: nodeEnv === "production",
});

export const buildStubCookie = (nodeEnv: string | undefined): StubCookieDefinition => ({
  name: STUB_COOKIE_NAME,
  value: STUB_USER.id,
  options: buildCookieOptions(nodeEnv),
});

export const buildClearStubCookie = (
  nodeEnv: string | undefined
): StubCookieDefinition => ({
  name: STUB_COOKIE_NAME,
  value: "",
  options: {
    ...buildCookieOptions(nodeEnv),
    maxAge: 0,
  },
});

export const readStubSession = (cookieValue: string | undefined): AppSession | null => {
  if (!cookieValue) return null;
  if (cookieValue !== STUB_USER.id) return null;
  return { user: STUB_USER };
};

