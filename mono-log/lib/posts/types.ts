export type PostMode = "memo" | "note";

export type PostStatus = "active" | "trashed";

export type PostTagId = string;

export type PostSummary = {
  postId: string;
  mode: PostMode;
  createdAt: string;
  tags: PostTagId[];
  favorite: boolean;
  contentText: string;
};

export type PostContent = unknown;

export type PostDetail = PostSummary & {
  content: PostContent;
  status: PostStatus;
  updatedAt: string;
  trashedAt: string | null;
};
