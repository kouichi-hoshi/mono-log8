import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { createPostRepository } from "./postRepository";
import { createStubPostsStore } from "./stubPostsStore";

const makeSession = (userId = "user-1") => ({
  user: { id: userId, name: "User", email: "user@example.com", image: null },
});

const makeClock = () => {
  let tick = 0;
  return () => {
    tick += 1;
    return new Date(2025, 0, 1, 0, 0, tick).toISOString();
  };
};

const createRepo = async (options?: {
  enabled?: boolean;
  session?: ReturnType<typeof makeSession> | null;
}) => {
  const dir = mkdtempSync(join(tmpdir(), "stub-posts-"));
  const filePath = join(dir, "posts.json");
  const store = createStubPostsStore({ filePath });
  const now = makeClock();
  const enabled = Object.prototype.hasOwnProperty.call(options ?? {}, "enabled")
    ? options?.enabled
    : true;
  const session = Object.prototype.hasOwnProperty.call(options ?? {}, "session")
    ? options?.session ?? null
    : makeSession();
  const repo = createPostRepository({
    isStubEnabled: () => enabled ?? true,
    getSession: async () => session,
    store,
    now,
  });
  return { repo, dir, store };
};

const cleanup = (dir: string) => {
  rmSync(dir, { recursive: true, force: true });
};

const getStatus = (error: unknown) =>
  typeof error === "object" && error && "status" in error
    ? (error as { status?: number }).status
    : undefined;

describe("postRepository (stub)", () => {
  const makeNoteDoc = (text: string) => ({
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: text ? [{ type: "text", text }] : [],
      },
    ],
  });

  test("returns 401 when session is missing", async () => {
    const { repo, dir } = await createRepo({ session: null });
    await expect(
      repo.create({
        mode: "memo",
        content: "hello",
        tags: [],
      })
    ).rejects.toMatchObject({ status: 401 });
    cleanup(dir);
  });

  test("returns 403 when stub is disabled", async () => {
    const { repo, dir } = await createRepo({ enabled: false });
    await expect(
      repo.findMany({ status: "active", limit: 10 })
    ).rejects.toMatchObject({ status: 403 });
    cleanup(dir);
  });

  test("create and findMany", async () => {
    const { repo, dir } = await createRepo();
    await repo.create({ mode: "memo", content: "hello", tags: ["a"] });
    const result = await repo.findMany({ status: "active", limit: 10 });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.contentText).toBe("hello");
    cleanup(dir);
  });

  test("filters by mode/tags/favorite", async () => {
    const { repo, dir } = await createRepo();
    await repo.create({ mode: "memo", content: "m1", tags: ["a"], favorite: true });
    await repo.create({
      mode: "note",
      content: makeNoteDoc("n1"),
      tags: ["b"],
      favorite: false,
    });
    await repo.create({ mode: "memo", content: "m2", tags: ["b"], favorite: false });

    const byMode = await repo.findMany({
      status: "active",
      mode: "note",
      limit: 10,
    });
    expect(byMode.items).toHaveLength(1);

    const byTags = await repo.findMany({
      status: "active",
      tags: ["b"],
      limit: 10,
    });
    expect(byTags.items).toHaveLength(2);

    const byFavorite = await repo.findMany({
      status: "active",
      favorite: true,
      limit: 10,
    });
    expect(byFavorite.items).toHaveLength(1);
    cleanup(dir);
  });

  test("cursor paging returns next items", async () => {
    const { repo, dir } = await createRepo();
    await repo.create({ mode: "memo", content: "m1", tags: [] });
    await repo.create({ mode: "memo", content: "m2", tags: [] });
    await repo.create({ mode: "memo", content: "m3", tags: [] });

    const first = await repo.findMany({ status: "active", limit: 2 });
    expect(first.items).toHaveLength(2);
    expect(first.nextCursor).not.toBeNull();

    const next = await repo.findMany({
      status: "active",
      limit: 2,
      cursor: first.nextCursor ?? undefined,
    });
    expect(next.items).toHaveLength(1);
    cleanup(dir);
  });

  test("trash and restore", async () => {
    const { repo, dir } = await createRepo();
    const { postId } = await repo.create({
      mode: "memo",
      content: "m1",
      tags: [],
    });
    await repo.trash({ postId });
    const trashed = await repo.findMany({ status: "trashed", limit: 10 });
    expect(trashed.items).toHaveLength(1);

    await repo.restore({ postId });
    const active = await repo.findMany({ status: "active", limit: 10 });
    expect(active.items).toHaveLength(1);
    cleanup(dir);
  });

  test("hard delete removes item", async () => {
    const { repo, dir } = await createRepo();
    const { postId } = await repo.create({
      mode: "memo",
      content: "m1",
      tags: [],
    });
    await repo.hardDelete({ postId });
    const active = await repo.findMany({ status: "active", limit: 10 });
    expect(active.items).toHaveLength(0);
    cleanup(dir);
  });

  test("validation errors use 422", async () => {
    const { repo, dir } = await createRepo();
    try {
      await repo.create({ mode: "memo", content: "", tags: [] });
      throw new Error("expected to throw");
    } catch (error) {
      expect(getStatus(error)).toBe(422);
    }
    cleanup(dir);
  });

  test("memo content is normalized to ProseMirror JSON", async () => {
    const { repo, dir, store } = await createRepo();
    await repo.create({
      mode: "memo",
      content: " hello\nworld ",
      tags: [],
    });
    const data = await store.read();
    expect(data.posts[0]?.content).toEqual({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "hello world" }],
        },
      ],
    });
    cleanup(dir);
  });

  test("update keeps favorite when not specified", async () => {
    const { repo, dir, store } = await createRepo();
    const { postId } = await repo.create({
      mode: "memo",
      content: "hello",
      tags: [],
      favorite: true,
    });
    await repo.update({
      postId,
      content: "hello again",
      tags: [],
    });
    const data = await store.read();
    expect(data.posts[0]?.favorite).toBe(true);
    cleanup(dir);
  });
});
