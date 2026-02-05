import { QueryClient } from "@tanstack/react-query";

const MINUTE = 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * MINUTE,
      gcTime: 30 * MINUTE,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});
