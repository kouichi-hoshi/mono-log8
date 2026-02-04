import type {
  NextSearchParams,
  NormalizeHomeSearchParamsResult,
  HomeMode,
  HomeView,
} from "./types";

const HOME_KEYS = new Set(["mode", "view", "tags", "favorite"]);

const buildUrlSearchParamsFromNext = (input: NextSearchParams): URLSearchParams => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) params.append(key, v);
      continue;
    }
    params.append(key, value);
  }
  return params;
};

const toSortedString = (params: URLSearchParams): string => {
  const entries = Array.from(params.entries());
  entries.sort((a, b) => {
    const keyCompare = a[0].localeCompare(b[0]);
    if (keyCompare !== 0) return keyCompare;
    return a[1].localeCompare(b[1]);
  });
  return new URLSearchParams(entries).toString();
};

const normalizeMode = (raw: string | undefined): HomeMode => {
  return raw === "note" || raw === "memo" ? raw : "memo";
};

const normalizeView = (raw: string | undefined): HomeView | undefined => {
  return raw === "trash" ? "trash" : undefined;
};

const normalizeFavorite = (raw: string | undefined): "1" | undefined => {
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

  const mode = normalizeMode(original.get("mode") ?? undefined);
  canonical.set("mode", mode);

  const view = normalizeView(original.get("view") ?? undefined);
  if (view) canonical.set("view", view);

  const tags = normalizeTags(original.getAll("tags"));
  for (const tagId of tags) canonical.append("tags", tagId);

  const favorite = normalizeFavorite(original.get("favorite") ?? undefined);
  if (favorite) canonical.set("favorite", favorite);

  for (const [key, value] of original.entries()) {
    if (HOME_KEYS.has(key)) continue;
    canonical.append(key, value);
  }

  return canonical;
};

export const normalizeHomeSearchParams = (
  searchParams: NextSearchParams,
  isLoggedIn: boolean
): NormalizeHomeSearchParamsResult => {
  const original = buildUrlSearchParamsFromNext(searchParams);

  if (!isLoggedIn) {
    const canonical = new URLSearchParams();
    return { canonical, changed: toSortedString(original) !== "" };
  }

  const canonical = normalizeLoggedInUrlSearchParams(original);
  return { canonical, changed: toSortedString(canonical) !== toSortedString(original) };
};
