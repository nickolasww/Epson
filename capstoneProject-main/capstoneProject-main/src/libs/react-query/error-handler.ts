import { Mutation, Query } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { 
  getRefreshToken, 
  setAccessToken, 
  setRefreshToken, 
  removeAllTokens 
} from "@/libs/localstorage";
import { postRefreshToken } from "@/api/auth/api";

// ============================================================================
// ERROR RESPONSE TYPES
// ============================================================================

interface IErrorResponse {
  message?: string;
  errors?: Array<{ path: string; messages: string[] }>;
}

// ============================================================================
// REFRESH TOKEN QUEUE MANAGEMENT
// ============================================================================

/**
 * Prevent multiple simultaneous refresh token requests
 */
let isRefreshing = false;

/**
 * Prevent multiple redirects to login page
 */
let isRedirecting = false;

/**
 * Queue to store failed requests that will be retried after token refresh
 */
let failedQueue: {
  query?: Query;
  mutation?: Mutation<unknown, unknown, unknown, unknown>;
  variables?: unknown;
}[] = [];

// ============================================================================
// ERROR HANDLER FUNCTIONS
// ============================================================================

/**
 * Main error handler for both queries and mutations
 * Checks for 401/500 errors and triggers refresh token flow
 * Only triggers on FIRST error - subsequent retries are handled by React Query
 */
const errorHandler = (
  error: unknown,
  query?: Query,
  mutation?: Mutation<unknown, unknown, unknown, unknown>,
  variables?: unknown
) => {
  const axiosError = error as AxiosError<IErrorResponse>;
  const status = axiosError.response?.status;
  const data = axiosError.response?.data;

  // Handle 401 Unauthorized or 500 Internal Server Error
  // Backend returns 401 when access token expires, sometimes 500 with "token is expired" message
  const isTokenExpired = status === 401 || (status === 500 && data?.message?.toLowerCase().includes('token is expired'));
  
  if (isTokenExpired) {
    // Only log and trigger refresh if not already refreshing
    // React Query will retry automatically after refresh completes
    if (!isRefreshing) {
      console.log('[Error Handler] Token expired - triggering refresh token flow');
      
      if (mutation) {
        refreshTokenAndRetry(undefined, mutation, variables);
      } else {
        refreshTokenAndRetry(query);
      }
    } else {
      console.log('[Error Handler] Token refresh already in progress, query will auto-retry');
    }
  } else {
    // Log other errors for debugging
    console.error('[Error Handler] API Error:', {
      status,
      message: data?.message || 'Unknown error',
      query: query?.queryKey,
      mutation: mutation?.options.mutationKey,
    });
  }
};

/**
 * Error handler for React Query queries
 * Called automatically by QueryCache when a query fails
 */
export const queryErrorHandler = (error: unknown, query: Query) => {
  errorHandler(error, query);
};

/**
 * Error handler for React Query mutations
 * Called automatically by MutationCache when a mutation fails
 */
export const mutationErrorHandler = (
  error: unknown,
  variables: unknown,
  _context: unknown,
  mutation: Mutation<unknown, unknown, unknown, unknown>
) => {
  errorHandler(error, undefined, mutation, variables);
};

// ============================================================================
// REFRESH TOKEN LOGIC
// ============================================================================

/**
 * Process all failed requests in the queue after successful token refresh
 * Retries all queries and mutations that failed due to expired token
 */
const processFailedQueue = () => {
  console.log('[Refresh Token] Processing', failedQueue.length, 'failed requests');
  
  failedQueue.forEach(({ query, mutation, variables }) => {
    if (mutation) {
      // Retry mutation with original variables
      // Note: We need to manually trigger the mutation again
      // This is a simplified approach - in production you might need
      // to store more context about the mutation
      mutation.execute(variables);
    }
    if (query) {
      // Retry query
      query.fetch();
    }
  });
  
  // Clear the queue and reset refresh state
  isRefreshing = false;
  failedQueue = [];
};

/**
 * Refresh the access token and retry failed requests
 * Handles the complete refresh token flow:
 * 1. Check if refresh is already in progress
 * 2. Add current request to queue
 * 3. Call refresh token endpoint
 * 4. Store new tokens
 * 5. Retry all failed requests
 * 6. Handle refresh failure by redirecting to login
 */
const refreshTokenAndRetry = async (
  query?: Query,
  mutation?: Mutation<unknown, unknown, unknown, unknown>,
  variables?: unknown
) => {
  try {
    // If not already refreshing, start the refresh process
    if (!isRefreshing) {
      isRefreshing = true;
      failedQueue.push({ query, mutation, variables });
      
      const currentRefreshToken = getRefreshToken();
      
      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('[Refresh Token] Calling refresh token endpoint');
      
      // Call backend refresh token endpoint
      const response = await postRefreshToken({
        refresh_token: currentRefreshToken,
      });

      console.log('[Refresh Token] Response received:', {
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
      });

      // Extract new tokens from response
      // Backend might return:
      // 1. Nested: { message, data: { user, token: { access_token, refresh_token } } }
      // 2. Flat: { id, token: "string", refresh_token: "string" }
      
      // Use any to handle various response structures from backend
      const responseData = response as any;
      let access_token: string | undefined;
      let refresh_token: string | undefined;

      // Try nested structure first (response.data.token as object)
      const nestedToken = responseData.data?.token;
      if (nestedToken && typeof nestedToken === 'object' && nestedToken.access_token) {
        access_token = nestedToken.access_token;
        refresh_token = nestedToken.refresh_token;
        console.log('[Refresh Token] Found tokens in nested structure');
      }
      // Try flat structure (response.data.token as string for access, response.data.refresh_token separate)
      else if (responseData.data?.token && typeof responseData.data.token === 'string') {
        access_token = responseData.data.token;
        refresh_token = responseData.data.refresh_token;
        console.log('[Refresh Token] Found tokens in flat structure');
      }
      // Try direct response structure
      else if (responseData.token && typeof responseData.token === 'string') {
        access_token = responseData.token;
        refresh_token = responseData.refresh_token;
        console.log('[Refresh Token] Found tokens in direct response structure');
      }

      if (!access_token || !refresh_token) {
        console.error('[Refresh Token] Invalid response structure:', response);
        throw new Error('Invalid token response from refresh endpoint');
      }

      console.log('[Refresh Token] Successfully extracted tokens:', {
        hasAccessToken: !!access_token,
        hasRefreshToken: !!refresh_token,
      });

      // Store new tokens in localStorage
      setAccessToken(access_token);
      setRefreshToken(refresh_token);

      // Retry all failed requests with new access token
      processFailedQueue();
    } else {
      // If refresh is already in progress, just add to queue
      console.log('[Refresh Token] Refresh already in progress, adding to queue');
      failedQueue.push({ query, mutation, variables });
    }
  } catch (error) {
    console.error('[Refresh Token] Failed to refresh token:', error);
    
    // Clear all tokens on refresh failure
    removeAllTokens();
    
    // Redirect to login page (only once)
    if (!isRedirecting) {
      isRedirecting = true;
      
      // Dispatch custom event for logout
      window.dispatchEvent(new CustomEvent('auth:logout', { 
        detail: { 
          message: 'Sesi Anda telah berakhir. Silakan login kembali untuk melanjutkan.' 
        }
      }));
      
      // Redirect to login or session expired page
      window.location.href = "/auth/session-expired";
    }
  }
};
