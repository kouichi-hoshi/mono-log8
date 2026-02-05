import { redirect } from "next/navigation";

import { AuthModalProvider } from "@/components/auth/auth-modal-provider";
import { UserMenu } from "@/components/auth/user-menu";
import { WelcomeScreen } from "@/components/auth/welcome-screen";
import { AppShell } from "@/components/layout/app-shell";
import { UiPreview } from "@/components/layout/ui-preview";
import { normalizeHomeSearchParams } from "@/lib/routing/normalizeHomeSearchParams";
import type { NextSearchParams } from "@/lib/routing/types";
import { authAdapter } from "@/server/auth/authAdapter";

type HomePageProps = {
  searchParams: NextSearchParams | Promise<NextSearchParams>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const session = await authAdapter.getSession();
  const isLoggedIn = Boolean(session);

  const resolvedSearchParams = await searchParams;
  const { canonical, changed } = normalizeHomeSearchParams(
    resolvedSearchParams,
    isLoggedIn
  );
  if (changed) {
    const query = canonical.toString();
    redirect(query ? `/?${query}` : "/");
  }

  const headerRight = session ? <UserMenu user={session.user} /> : null;

  return (
    <AuthModalProvider>
      <AppShell headerRight={headerRight}>
        {isLoggedIn ? <UiPreview /> : <WelcomeScreen />}
      </AppShell>
    </AuthModalProvider>
  );
}
