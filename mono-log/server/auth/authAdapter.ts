import "server-only";

import { cookies } from "next/headers";

import type { AppSession } from "./types";
export type { AppSession } from "./types";
import { isStubAuthEnabled } from "./stubAuthGuard";
import {
  STUB_COOKIE_NAME,
  buildClearStubCookie,
  buildStubCookie,
  readStubSession,
} from "./stubSession";

export interface AuthAdapter {
  getSession(): Promise<AppSession | null>;
  signIn(): Promise<void>;
  signOut(): Promise<void>;
}

export const authAdapter: AuthAdapter = {
  async getSession() {
    const enabled = isStubAuthEnabled(
      process.env.NODE_ENV,
      process.env.USE_STUB_AUTH
    );
    if (!enabled) return null;
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get(STUB_COOKIE_NAME)?.value;
    return readStubSession(cookieValue);
  },
  async signIn() {
    const enabled = isStubAuthEnabled(
      process.env.NODE_ENV,
      process.env.USE_STUB_AUTH
    );
    if (!enabled) {
      const error = new Error("Stub auth is disabled");
      (error as { status?: number }).status = 403;
      throw error;
    }
    const definition = buildStubCookie(process.env.NODE_ENV);
    const cookieStore = await cookies();
    cookieStore.set(definition.name, definition.value, definition.options);
  },
  async signOut() {
    const enabled = isStubAuthEnabled(
      process.env.NODE_ENV,
      process.env.USE_STUB_AUTH
    );
    if (!enabled) {
      const error = new Error("Stub auth is disabled");
      (error as { status?: number }).status = 403;
      throw error;
    }
    const definition = buildClearStubCookie(process.env.NODE_ENV);
    const cookieStore = await cookies();
    cookieStore.set(definition.name, definition.value, definition.options);
  },
};
