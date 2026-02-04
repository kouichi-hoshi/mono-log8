import type * as React from "react";

import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";

type AppShellProps = {
  children: React.ReactNode;
  headerRight?: React.ReactNode;
};

export function AppShell({ children, headerRight }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <AppHeader rightSlot={headerRight} />
      <main className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
