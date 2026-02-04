import type { MergeHomeSearchParamsPatch, HomeMode, HomeView } from "./types";

const HOME_KEYS = new Set(["mode", "view", "tags", "favorite"]);

const normalizeMode = (raw: string | null): HomeMode => {
  return raw === "note" || raw === "memo" ? raw : "memo";
};

const normalizeView = (raw: string | null): HomeView | undefined => {
  return raw === "trash" ? "trash" : undefined;
};

const normalizeFavorite = (raw: string | null): "1" | undefined => {
  return raw === "1" || raw === "true" ? "1" : undefined;
};

const normalizeTags = (rawValues: string[]): string[] => {
  const set = new Set<string>();
  for (const v of rawValues) {
    if (v === "") continue;
    set.add(v);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
};

const normalizeLoggedInUrlSearchParams = (original: URLSearchParams): URLSearchParams => {
  const canonical = new URLSearchParams();

  canonical.set("mode", normalizeMode(original.get("mode")));

  const view = normalizeView(original.get("view"));
  if (view) canonical.set("view", view);

  const tags = normalizeTags(original.getAll("tags"));
  for (const tagId of tags) canonical.append("tags", tagId);

  const favorite = normalizeFavorite(original.get("favorite"));
  if (favorite) canonical.set("favorite", favorite);

  for (const [key, value] of original.entries()) {
    if (HOME_KEYS.has(key)) continue;
    canonical.append(key, value);
  }

  return canonical;
};

export const mergeSearchParams = (
  current: URLSearchParams,
  patch: MergeHomeSearchParamsPatch
): URLSearchParams => {
  const next = new URLSearchParams(current.toString());

  if (Object.prototype.hasOwnProperty.call(patch, "mode")) {
    const mode = patch.mode;
    if (mode === undefined) next.delete("mode");
    else next.set("mode", mode);
  }

  if (Object.prototype.hasOwnProperty.call(patch, "view")) {
    const view = patch.view;
    if (view === undefined) next.delete("view");
    else next.set("view", view);
  }

  if (Object.prototype.hasOwnProperty.call(patch, "tags")) {
    next.delete("tags");
    const tags = patch.tags ?? [];
    for (const tagId of tags) next.append("tags", tagId);
  }

  if (Object.prototype.hasOwnProperty.call(patch, "favorite")) {
    const favorite = patch.favorite;
    if (favorite) next.set("favorite", "1");
    else next.delete("favorite");
  }

  return normalizeLoggedInUrlSearchParams(next);
};

