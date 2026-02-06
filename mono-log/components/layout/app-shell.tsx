import type * as React from "react";

import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";

type AppShellProps = {
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
};

export function AppShell({
  children,
  headerRight,
  showHeader = true,
  showFooter = true,
}: AppShellProps) {
  return (
    <div className="min-h-screen">
      {showHeader ? <AppHeader rightSlot={headerRight} /> : null}
      <main className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6">
        {children}
      </main>
      {showFooter ? <AppFooter /> : null}
    </div>
  );
}
