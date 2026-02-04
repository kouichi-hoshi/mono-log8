import Link from "next/link";

import { texts } from "@/lib/texts";

export function AppHeader() {
  return (
    <header className="border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 md:px-6">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight hover:underline"
        >
          {texts.app.name}
        </Link>
        <div className="text-sm text-muted-foreground">MS3 UI基盤</div>
      </div>
    </header>
  );
}

