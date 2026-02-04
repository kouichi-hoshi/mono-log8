export type PostMode = "memo" | "note";

export type PostStatus = "active" | "trashed";

export type PostCursor = string;

export type PostTagId = string;

export type PostContent = unknown;

export type PostSummary = {
  postId: string;
  mode: PostMode;
  createdAt: string;
  tags: PostTagId[];
  favorite: boolean;
  contentText: string;
};

export type FindManyPostsParams = {
  status: PostStatus;
  mode?: PostMode;
  tags?: PostTagId[];
  favorite?: boolean;
  limit: number;
  cursor?: PostCursor;
};

export type FindManyPostsResult = {
  items: PostSummary[];
  nextCursor: PostCursor | null;
};

export type CreatePostParams = {
  mode: PostMode;
  content: PostContent;
  tags: PostTagId[];
  favorite?: boolean;
};

export type UpdatePostParams = {
  postId: string;
  content: PostContent;
  tags: PostTagId[];
  favorite?: boolean;
};

export interface PostRepository {
  findMany(params: FindManyPostsParams): Promise<FindManyPostsResult>;
  create(params: CreatePostParams): Promise<{ postId: string }>;
  update(params: UpdatePostParams): Promise<void>;
  trash(params: { postId: string }): Promise<void>;
  restore(params: { postId: string }): Promise<void>;
  hardDelete(params: { postId: string }): Promise<void>;
  hardDeleteMany(params: { postIds: string[] }): Promise<void>;
  hardDeleteAllTrashed(): Promise<void>;
}

export const postRepository: PostRepository = {
  async findMany() {
    throw new Error("postRepository.findMany is not implemented");
  },
  async create() {
    throw new Error("postRepository.create is not implemented");
  },
  async update() {
    throw new Error("postRepository.update is not implemented");
  },
  async trash() {
    throw new Error("postRepository.trash is not implemented");
  },
  async restore() {
    throw new Error("postRepository.restore is not implemented");
  },
  async hardDelete() {
    throw new Error("postRepository.hardDelete is not implemented");
  },
  async hardDeleteMany() {
    throw new Error("postRepository.hardDeleteMany is not implemented");
  },
  async hardDeleteAllTrashed() {
    throw new Error("postRepository.hardDeleteAllTrashed is not implemented");
  },
};

