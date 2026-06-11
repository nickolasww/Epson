import {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import {
  getAccessToken,
  setAccessToken,
  removeAccessToken,
  getRefreshToken,
  removeRefreshToken,
  setRefreshToken,
} from "../localstorage/index";
import { env } from "../env";
import axios from "axios";
import { queryClient } from "@/libs/react-query/react-query-clients";

// ============================================================================
// TOKEN REFRESH STATE
// ============================================================================
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ============================================================================
// RESPONSE NORMALIZATION
// ============================================================================

/**
 * Normalize API response to consistent structure
 * Handles various backend response formats:
 * - { data: { user, token } }
 * - { users: {...} } or { user: {...} }
 * - Direct response without wrapper
 * - { message, data, ... }
 *
 * @param response - Axios response object
 * @returns Normalized response with standardized structure
 */
function normalizeApiResponse(response: AxiosResponse): AxiosResponse {
  // Preserve original response
  const originalData = response.data;

  // If response is already normalized or empty, return as-is
  if (!originalData || typeof originalData !== "object") {
    return response;
  }

  // Create normalized response structure
  const normalized: any = {
    ...originalData,
    // Add standard fields if they exist
    _meta: {
      status: response.status,
      statusText: response.statusText,
      // Preserve original structure for debugging (only in development)
      _original: import.meta.env.DEV ? originalData : undefined,
    },
  };

  // Normalize data location - prioritize explicit 'data' field but keep alternatives accessible
  if (!normalized.data) {
    // Check for common alternative field names
    if (originalData.users) {
      normalized.data = originalData.users;
    } else if (originalData.user) {
      normalized.data = originalData.user;
    } else if (originalData.items) {
      normalized.data = originalData.items;
    } else if (originalData.results) {
      normalized.data = originalData.results;
    }
  }

  // Preserve all original fields at root level for backward compatibility
  // This ensures existing code doesn't break
  response.data = normalized;

  return response;
}

// ============================================================================
// AXIOS CONFIGURATION
// ============================================================================

export const axiosConfig: AxiosRequestConfig = {
  baseURL: env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: (params) => {
    const queryString = Object.entries(params)
      .filter(([, value]) => {
        // Filter out undefined, empty strings, and empty arrays
        if (value === undefined || value === "") return false;
        if (Array.isArray(value) && value.length === 0) return false;
        return true;
      })
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return value
            .map((val) => `${key}=${encodeURIComponent(val)}`)
            .join("&");
        }
        return `${key}=${encodeURIComponent(value)}`;
      })
      .join("&");
    return queryString;
  },
};

// ============================================================================
// REQUEST INTERCEPTOR
// ============================================================================

/**
 * Request interceptor to add access token to all requests
 * Reads token from localStorage and adds to Authorization header
 * IMPORTANT: Skip Authorization header for refresh-token endpoint
 */
export const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  // Skip adding Authorization header for refresh token endpoint
  // Backend doesn't require (and might reject) Authorization header for this endpoint
  if (config.url?.includes("/auth/refresh-token")) {
    console.log(
      "[Axios Interceptor] Skipping Authorization header for refresh-token endpoint",
    );
    return config;
  }

  // Get access token from localStorage
  const token = getAccessToken();

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

// ============================================================================
// RESPONSE INTERCEPTOR
// ============================================================================

/**
 * Response interceptor for response normalization and error handling
 * Token refresh is handled by React Query error handlers, not here
 */
export const responseInterceptor = {
  onFulfilled: (response: AxiosResponse) => {
    return normalizeApiResponse(response);
  },

  onRejected: async (error: any) => {
    const originalRequest = error.config;

    const status = error?.response?.status;
    const message = error?.response?.data?.message?.toLowerCase() ?? "";
    const isTokenError =
      status === 401 ||
      (status === 500 && message.includes("token is expired"));

    // Bukan token error, atau endpoint refresh itu sendiri yang gagal → logout
    const isRefreshEndpoint = originalRequest?.url?.includes(
      "/auth/refresh-token",
    );

    if (!isTokenError || originalRequest?._retry || isRefreshEndpoint) {
      if (isRefreshEndpoint) {
        // Refresh token expired → paksa logout tanpa reload
        removeAccessToken();
        removeRefreshToken();
        processQueue(error, null);
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }
      if (error?.response?.data?.message) {
        console.error("[Axios Error]", status, error.response.data.message);
      }
      return Promise.reject(error);
    }

    // Jika sedang refresh, antri request ini sampai token baru tersedia
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axios.create(axiosConfig)(originalRequest); // ulangi dengan instance bersih
        })
        .catch((err) => Promise.reject(err));
    }

    // Mulai refresh token
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = getRefreshToken(); //

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axios.post(
        `${env.VITE_API_BASE_URL}/auth/refresh-token`,
        { refresh_token: refreshToken },
      );

      // Sesuaikan dengan struktur response backend Anda
      const newAccessToken = response.data?.users?.token;

      if (!newAccessToken)
        throw new Error("No access token in refresh response");

      setAccessToken(newAccessToken);

      const newRefreshToken = response.data?.users?.refresh_token;
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken);
      }

      processQueue(null, newAccessToken);

      // Ulangi request original dengan token baru
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return axios.create(axiosConfig)(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      removeAccessToken();
      removeRefreshToken();
      queryClient.clear(); 

      window.location.href = "/";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
};
