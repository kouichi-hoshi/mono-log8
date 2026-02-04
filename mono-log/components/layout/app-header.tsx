import type { ReactNode } from "react";
import Link from "next/link";

import { texts } from "@/lib/texts";

type AppHeaderProps = {
  rightSlot?: ReactNode;
};

export function AppHeader({ rightSlot }: AppHeaderProps) {
  return (
    <header className="border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 md:px-6">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight hover:underline"
        >
          {texts.app.name}
        </Link>
        {rightSlot ?? null}
      </div>
    </header>
  );
}
