import "server-only";

export const isStubPostsEnabled = (
  nodeEnv: string | undefined,
  useStubPosts: string | undefined
): boolean => {
  if (nodeEnv === "production" || nodeEnv === "test") return false;
  return useStubPosts === "true";
};
