import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import type { PostContent, PostMode, PostStatus, PostTagId } from "./postRepository";

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
  version: 1;
  posts: StubPostRecord[];
};

export type StubPostsStore = {
  read: () => Promise<StubPostsStoreData>;
  write: (
    updater: (data: StubPostsStoreData) => StubPostsStoreData
  ) => Promise<StubPostsStoreData>;
};

const defaultData = (): StubPostsStoreData => ({ version: 1, posts: [] });

const parseData = (raw: string): StubPostsStoreData => {
  const parsed = JSON.parse(raw) as StubPostsStoreData;
  if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.posts)) {
    throw new Error("Invalid stub posts store data");
  }
  return parsed;
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
