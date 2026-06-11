import { QueryClient, InvalidateQueryFilters, MutationCache, QueryCache } from "@tanstack/react-query";
import { queryErrorHandler, mutationErrorHandler } from "./error-handler";


export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Smart retry: retry token expired errors to allow time for refresh
      retry: (failureCount, error: any) => {
        // Don't retry more than 3 times
        if (failureCount >= 3) return false;
        
        // Retry on token expired errors (401 or 500 with "token is expired" message)
        const status = error?.response?.status;
        const message = error?.response?.data?.message?.toLowerCase();
        const isTokenExpired = status === 401 || (status === 500 && message?.includes('token is expired'));
        
        if (isTokenExpired) {
          console.log(`[React Query] Retry attempt ${failureCount} for token expired error`);
          return true; // Allow retry for token errors
        }
        
        // Don't retry other errors
        return false;
      },
      // Add retry delay to give time for token refresh (2 seconds)
      retryDelay: (attemptIndex) => Math.min(2000, 1000 * 2 ** attemptIndex),
      // Keep previous data during refetch to prevent UI flicker
      // placeholderData: (previousData: unknown) => previousData,
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
      staleTime: 0,
      gcTime: 0,
    },
    mutations: {
      // Allow one retry for mutations with token expired errors
      retry: (failureCount, error: any) => {
        if (failureCount >= 1) return false;
        
        const status = error?.response?.status;
        const message = error?.response?.data?.message?.toLowerCase();
        const isTokenExpired = status === 401 || (status === 500 && message?.includes('token is expired'));
        
        return isTokenExpired;
      },
      retryDelay: 2000, // 2 second delay for token refresh
    },
  },
  queryCache: new QueryCache({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: queryErrorHandler as any, // Global error handler for all queries
  }),
  mutationCache: new MutationCache({
    onSuccess(_data, _variables, _context, mutation) {
      // Auto-invalidate queries after successful mutation (if specified in meta)
      if (mutation.meta?.invalidateQueries) {
        queryClient.invalidateQueries(
          mutation.meta.invalidateQueries as InvalidateQueryFilters<readonly unknown[]>,
        );
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: mutationErrorHandler as any, // Global error handler for all mutations
  }),
});
