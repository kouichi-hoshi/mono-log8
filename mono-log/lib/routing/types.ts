export type HomeMode = "memo" | "note";
export type HomeView = "trash";

export type NextSearchParams = Record<string, string | string[] | undefined>;

export type NormalizeHomeSearchParamsResult = {
  canonical: URLSearchParams;
  changed: boolean;
};

export type MergeHomeSearchParamsPatch = {
  mode?: HomeMode;
  view?: HomeView;
  tags?: string[];
  favorite?: boolean;
};

