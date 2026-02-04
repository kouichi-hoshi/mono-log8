import "server-only";

export const isStubAuthEnabled = (
  nodeEnv: string | undefined,
  useStubAuth: string | undefined
): boolean => {
  if (nodeEnv === "production" || nodeEnv === "test") return false;
  return useStubAuth === "true";
};

