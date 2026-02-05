import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import type {
  PostContent,
  PostMode,
  PostStatus,
  PostTagId,
} from "@/lib/posts/types";

export type StubTagRecord = {
  tagId: PostTagId;
  ownerId: string;
  label: string;
  createdAt: string;
  updatedAt: string;
};

export type StubPostRecord = {
  postId: string;
  authorId: string;
  mode: PostMode;
  status: PostStatus;
  tags: PostTagId[];
  favorite: boolean;
  content: PostContent;
  contentText: string;
  createdAt: string;
  updatedAt: string;
  trashedAt: string | null;
};

export type StubPostsStoreData = {
  version: 2;
  posts: StubPostRecord[];
  tags: StubTagRecord[];
};

export type StubPostsStore = {
  read: () => Promise<StubPostsStoreData>;
  write: (
    updater: (data: StubPostsStoreData) => StubPostsStoreData
  ) => Promise<StubPostsStoreData>;
};

const defaultData = (): StubPostsStoreData => ({
  version: 2,
  posts: [],
  tags: [],
});

const parseData = (raw: string): StubPostsStoreData => {
  const parsed = JSON.parse(raw) as Partial<StubPostsStoreData> & {
    version?: number;
  };
  if (!parsed || !Array.isArray(parsed.posts)) {
    throw new Error("Invalid stub posts store data");
  }
  if (parsed.version === 2 && Array.isArray(parsed.tags)) {
    return parsed as StubPostsStoreData;
  }
  if (parsed.version === 1) {
    const tagMap = new Map<string, StubTagRecord>();
    for (const post of parsed.posts) {
      if (!post || !Array.isArray(post.tags)) continue;
      for (const tagId of post.tags) {
        if (!tagId) continue;
        const key = `${post.authorId}:${tagId}`;
        if (tagMap.has(key)) continue;
        tagMap.set(key, {
          tagId,
          ownerId: post.authorId,
          label: tagId,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        });
      }
    }
    return {
      version: 2,
      posts: parsed.posts as StubPostRecord[],
      tags: Array.from(tagMap.values()),
    };
  }
  throw new Error("Invalid stub posts store data");
};

export const createStubPostsStore = ({
  filePath,
}: {
  filePath: string;
}): StubPostsStore => {
  let queue = Promise.resolve();

  const read = async (): Promise<StubPostsStoreData> => {
    try {
      const raw = await readFile(filePath, "utf-8");
      return parseData(raw);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return defaultData();
      }
      throw error;
    }
  };

  const write = async (
    updater: (data: StubPostsStoreData) => StubPostsStoreData
  ): Promise<StubPostsStoreData> => {
    const run = async () => {
      const data = await read();
      const next = updater(data);
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, JSON.stringify(next, null, 2), "utf-8");
      return next;
    };
    queue = queue.then(run, run);
    return queue;
  };

  return { read, write };
};
