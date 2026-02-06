import { redirect } from "next/navigation";

import { AuthModalProvider } from "@/components/auth/auth-modal-provider";
import { UserMenu } from "@/components/auth/user-menu";
import { WelcomeScreen } from "@/components/auth/welcome-screen";
import { AppShell } from "@/components/layout/app-shell";
import { PostsPage } from "@/components/posts/posts-page";
import { normalizeHomeSearchParams } from "@/lib/routing/normalizeHomeSearchParams";
import type { NextSearchParams } from "@/lib/routing/types";
import { texts } from "@/lib/texts";
import { authAdapter } from "@/server/auth/authAdapter";
import { postRepository } from "@/server/posts/postRepository";
import {
  buildPostsFilterQueryKey,
  buildPostsQueryKey,
  shouldUseFilterQuery,
} from "@/lib/posts/queryKeys";

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

  let initialResult = null;
  let initialError: string | null = null;
  const mode = canonical.get("mode") === "note" ? "note" : "memo";
  const view = canonical.get("view") === "trash" ? "trash" : "normal";
  const tags = canonical.getAll("tags");
  const favorite = canonical.get("favorite") === "1";
  const isFiltering = shouldUseFilterQuery({ view, tags, favorite });
  const initialQueryKey =
    view === "normal" && isFiltering
      ? buildPostsFilterQueryKey({ view: "normal", mode, tags, favorite })
      : buildPostsQueryKey({ view, mode });

  if (session) {
    try {
      const result = await postRepository.findMany({
        status: view === "trash" ? "trashed" : "active",
        mode: view === "trash" ? undefined : mode,
        tags: view === "trash" ? [] : tags,
        favorite: view === "trash" ? false : favorite,
        limit: 10,
      });
      initialResult = result;
    } catch {
      initialError = texts.toast.error.unknownError;
    }
  }

  return (
    <AuthModalProvider>
      <AppShell
        headerRight={headerRight}
        showHeader
        showFooter={!isLoggedIn}
      >
        {isLoggedIn ? (
          <PostsPage
            mode={mode}
            view={view}
            tags={tags}
            favorite={favorite}
            initialResult={initialResult}
            initialQueryKey={initialQueryKey}
            initialError={initialError}
          />
        ) : (
          <WelcomeScreen />
        )}
      </AppShell>
    </AuthModalProvider>
  );
}
