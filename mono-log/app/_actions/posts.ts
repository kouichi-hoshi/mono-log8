"use server";

import { postRepository } from "@/server/posts/postRepository";

type ActionError = {
  ok: false;
  status?: number;
  code?: string;
  message: string;
};

type ActionSuccess<T> = {
  ok: true;
  data: T;
};

type ActionResult<T> = ActionSuccess<T> | ActionError;

const toActionError = (error: unknown): ActionError => {
  if (error && typeof error === "object") {
    const err = error as { status?: number; code?: string; message?: string };
    return {
      ok: false,
      status: err.status,
      code: err.code,
      message: err.message ?? "Unexpected error",
    };
  }
  return { ok: false, message: "Unexpected error" };
};

export const createPostAction = async (params: Parameters<typeof postRepository.create>[0]) => {
  try {
    const result = await postRepository.create(params);
    return { ok: true, data: result } satisfies ActionResult<typeof result>;
  } catch (error) {
    return toActionError(error);
  }
};

export const updatePostAction = async (params: Parameters<typeof postRepository.update>[0]) => {
  try {
    await postRepository.update(params);
    return { ok: true, data: null } satisfies ActionResult<null>;
  } catch (error) {
    return toActionError(error);
  }
};

export const trashPostAction = async (params: Parameters<typeof postRepository.trash>[0]) => {
  try {
    await postRepository.trash(params);
    return { ok: true, data: null } satisfies ActionResult<null>;
  } catch (error) {
    return toActionError(error);
  }
};

export const restorePostAction = async (params: Parameters<typeof postRepository.restore>[0]) => {
  try {
    await postRepository.restore(params);
    return { ok: true, data: null } satisfies ActionResult<null>;
  } catch (error) {
    return toActionError(error);
  }
};

export const hardDeletePostAction = async (
  params: Parameters<typeof postRepository.hardDelete>[0]
) => {
  try {
    await postRepository.hardDelete(params);
    return { ok: true, data: null } satisfies ActionResult<null>;
  } catch (error) {
    return toActionError(error);
  }
};

export const hardDeleteManyAction = async (
  params: Parameters<typeof postRepository.hardDeleteMany>[0]
) => {
  try {
    await postRepository.hardDeleteMany(params);
    return { ok: true, data: null } satisfies ActionResult<null>;
  } catch (error) {
    return toActionError(error);
  }
};

export const hardDeleteAllTrashedAction = async () => {
  try {
    await postRepository.hardDeleteAllTrashed();
    return { ok: true, data: null } satisfies ActionResult<null>;
  } catch (error) {
    return toActionError(error);
  }
};
