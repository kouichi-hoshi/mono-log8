import "server-only";

import { randomUUID } from "node:crypto";

import { authAdapter } from "@/server/auth/authAdapter";
import type {
  PostContent,
  PostDetail,
  PostMode,
  PostStatus,
  PostSummary,
  PostTagId,
} from "@/lib/posts/types";

import { deriveContentText, normalizeContentForMode } from "./contentText";
import { isStubPostsEnabled } from "./stubPostsGuard";
import { createStubPostsStore } from "./stubPostsStore";
import type { StubPostRecord } from "./stubPostsStore";
import { normalizeTagIds, validatePostInput } from "./validation";

export type PostCursor = string;

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
  findById(params: { postId: string }): Promise<PostDetail>;
  create(params: CreatePostParams): Promise<{ postId: string }>;
  update(params: UpdatePostParams): Promise<void>;
  trash(params: { postId: string }): Promise<void>;
  restore(params: { postId: string }): Promise<void>;
  hardDelete(params: { postId: string }): Promise<void>;
  hardDeleteMany(params: { postIds: string[] }): Promise<void>;
  hardDeleteAllTrashed(): Promise<void>;
}

type PostRepositoryDeps = {
  isStubEnabled: () => boolean;
  getSession: () => Promise<{ user: { id: string } } | null>;
  store: ReturnType<typeof createStubPostsStore>;
  now: () => string;
  generateId?: () => string;
};

const createError = (status: number, message: string, code: string) => {
  const error = new Error(message) as Error & { status?: number; code?: string };
  error.status = status;
  error.code = code;
  return error;
};

const requireStubEnabled = (enabled: boolean) => {
  if (!enabled) {
    throw createError(403, "Stub posts are disabled", "stub/disabled");
  }
};

const requireSession = async (
  getSession: PostRepositoryDeps["getSession"]
) => {
  const session = await getSession();
  if (!session) {
    throw createError(401, "Authentication required", "auth/required");
  }
  return session;
};

const matchesTags = (postTags: PostTagId[], tags?: PostTagId[]) => {
  if (!tags || tags.length === 0) return true;
  return tags.some((tag) => postTags.includes(tag));
};

const sortPosts = (status: PostStatus, a: StubPostRecord, b: StubPostRecord) => {
  const aKey = status === "trashed" ? a.trashedAt ?? a.createdAt : a.createdAt;
  const bKey = status === "trashed" ? b.trashedAt ?? b.createdAt : b.createdAt;
  if (aKey !== bKey) return bKey.localeCompare(aKey);
  return b.postId.localeCompare(a.postId);
};

export const createPostRepository = ({
  isStubEnabled,
  getSession,
  store,
  now,
  generateId,
}: PostRepositoryDeps): PostRepository => {
  const ensureContext = async () => {
    requireStubEnabled(isStubEnabled());
    const session = await requireSession(getSession);
    return session;
  };

  return {
    async findMany({ status, mode, tags, favorite, limit, cursor }) {
      const session = await ensureContext();
      const data = await store.read();
      const normalizedTags = normalizeTagIds(tags ?? []);

      const filtered = data.posts
        .filter((post) => post.authorId === session.user.id)
        .filter((post) => post.status === status)
        .filter((post) => (mode ? post.mode === mode : true))
        .filter((post) => (favorite ? post.favorite : true))
        .filter((post) => matchesTags(post.tags, normalizedTags));

      const sorted = filtered.sort((a, b) => sortPosts(status, a, b));
      const cursorIndex = cursor
        ? sorted.findIndex((post) => post.postId === cursor)
        : -1;
      const startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0;
      const page = sorted.slice(startIndex, startIndex + limit);
      const nextCursor =
        startIndex + limit < sorted.length && page.length > 0
          ? page[page.length - 1].postId
          : null;

      return {
        items: page.map((post) => ({
          postId: post.postId,
          mode: post.mode,
          createdAt: post.createdAt,
          tags: post.tags,
          favorite: post.favorite,
          contentText: post.contentText,
        })),
        nextCursor,
      };
    },
    async findById({ postId }) {
      const session = await ensureContext();
      const data = await store.read();
      const post = data.posts.find(
        (record) =>
          record.postId === postId && record.authorId === session.user.id
      );
      if (!post) {
        throw createError(404, "Post not found", "post/not-found");
      }
      return {
        postId: post.postId,
        mode: post.mode,
        createdAt: post.createdAt,
        tags: post.tags,
        favorite: post.favorite,
        contentText: post.contentText,
        content: post.content,
        status: post.status,
        updatedAt: post.updatedAt,
        trashedAt: post.trashedAt,
      };
    },

    async create({ mode, content, tags, favorite }) {
      const session = await ensureContext();
      const postId = generateId ? generateId() : randomUUID();
      const normalizedContent = normalizeContentForMode(mode, content);
      const contentText = deriveContentText(mode, normalizedContent);
      const normalizedTags = normalizeTagIds(tags);
      validatePostInput({ mode, contentText, tags: normalizedTags });

      await store.write((data) => {
        const timestamp = now();
        const record: StubPostRecord = {
          postId,
          authorId: session.user.id,
          mode,
          status: "active",
          tags: normalizedTags,
          favorite: Boolean(favorite),
          content: normalizedContent,
          contentText,
          createdAt: timestamp,
          updatedAt: timestamp,
          trashedAt: null,
        };
        return { ...data, posts: [record, ...data.posts] };
      });

      return { postId };
    },

    async update(params) {
      const { postId, content, tags } = params;
      const session = await ensureContext();
      await store.write((data) => {
        const index = data.posts.findIndex(
          (post) =>
            post.postId === postId &&
            post.authorId === session.user.id &&
            post.status === "active"
        );
        if (index < 0) {
          throw createError(404, "Post not found", "post/not-found");
        }
        const current = data.posts[index];
        const normalizedContent = normalizeContentForMode(current.mode, content);
        const contentText = deriveContentText(current.mode, normalizedContent);
        const normalizedTags = normalizeTagIds(tags);
        validatePostInput({
          mode: current.mode,
          contentText,
          tags: normalizedTags,
        });
        const favoriteProvided = Object.prototype.hasOwnProperty.call(
          params,
          "favorite"
        );
        const nextFavorite = favoriteProvided
          ? Boolean(params.favorite)
          : current.favorite;
        const next: StubPostRecord = {
          ...current,
          content: normalizedContent,
          contentText,
          tags: normalizedTags,
          favorite: nextFavorite,
          updatedAt: now(),
        };
        const posts = data.posts.slice();
        posts[index] = next;
        return { ...data, posts };
      });
    },

    async trash({ postId }) {
      const session = await ensureContext();
      await store.write((data) => {
        const index = data.posts.findIndex(
          (post) =>
            post.postId === postId && post.authorId === session.user.id
        );
        if (index < 0) {
          throw createError(404, "Post not found", "post/not-found");
        }
        const current = data.posts[index];
        if (current.status === "trashed") return data;
        const next: StubPostRecord = {
          ...current,
          status: "trashed",
          trashedAt: now(),
        };
        const posts = data.posts.slice();
        posts[index] = next;
        return { ...data, posts };
      });
    },

    async restore({ postId }) {
      const session = await ensureContext();
      await store.write((data) => {
        const index = data.posts.findIndex(
          (post) =>
            post.postId === postId && post.authorId === session.user.id
        );
        if (index < 0) {
          throw createError(404, "Post not found", "post/not-found");
        }
        const current = data.posts[index];
        if (current.status !== "trashed") return data;
        const next: StubPostRecord = {
          ...current,
          status: "active",
          trashedAt: null,
          updatedAt: now(),
        };
        const posts = data.posts.slice();
        posts[index] = next;
        return { ...data, posts };
      });
    },

    async hardDelete({ postId }) {
      const session = await ensureContext();
      await store.write((data) => {
        const exists = data.posts.some(
          (post) =>
            post.postId === postId && post.authorId === session.user.id
        );
        if (!exists) {
          throw createError(404, "Post not found", "post/not-found");
        }
        const posts = data.posts.filter(
          (post) =>
            !(post.postId === postId && post.authorId === session.user.id)
        );
        return { ...data, posts };
      });
    },

    async hardDeleteMany({ postIds }) {
      const session = await ensureContext();
      await store.write((data) => {
        const removeSet = new Set(postIds);
        const posts = data.posts.filter(
          (post) =>
            post.authorId !== session.user.id || !removeSet.has(post.postId)
        );
        return { ...data, posts };
      });
    },

    async hardDeleteAllTrashed() {
      const session = await ensureContext();
      await store.write((data) => {
        const posts = data.posts.filter(
          (post) =>
            post.authorId !== session.user.id || post.status !== "trashed"
        );
        return { ...data, posts };
      });
    },
  };
};

const stubStore = createStubPostsStore({
  filePath: `${process.cwd()}/.local-data/stub-posts.json`,
});

export const postRepository: PostRepository = createPostRepository({
  isStubEnabled: () =>
    isStubPostsEnabled(process.env.NODE_ENV, process.env.USE_STUB_POSTS),
  getSession: () => authAdapter.getSession(),
  store: stubStore,
  now: () => new Date().toISOString(),
});
