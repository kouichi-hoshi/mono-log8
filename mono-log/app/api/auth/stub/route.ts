import { NextResponse } from "next/server";

import { isStubAuthEnabled } from "@/server/auth/stubAuthGuard";
import {
  buildClearStubCookie,
  buildStubCookie,
} from "@/server/auth/stubSession";

const createForbiddenResponse = () =>
  NextResponse.json({ error: "Stub auth is disabled" }, { status: 403 });

export async function POST() {
  const enabled = isStubAuthEnabled(
    process.env.NODE_ENV,
    process.env.USE_STUB_AUTH
  );
  if (!enabled) return createForbiddenResponse();

  const response = NextResponse.json({ ok: true });
  const definition = buildStubCookie(process.env.NODE_ENV);
  response.cookies.set(definition.name, definition.value, definition.options);
  return response;
}

export async function DELETE() {
  const enabled = isStubAuthEnabled(
    process.env.NODE_ENV,
    process.env.USE_STUB_AUTH
  );
  if (!enabled) return createForbiddenResponse();

  const response = NextResponse.json({ ok: true });
  const definition = buildClearStubCookie(process.env.NODE_ENV);
  response.cookies.set(definition.name, definition.value, definition.options);
  return response;
}

