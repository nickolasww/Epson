import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";
import { postLogin, getMe } from "@/api/auth/api";
import {
  getAccessToken,
  setAccessToken,
  setRefreshToken,
  removeAllTokens,
} from "@/libs/localstorage";
import type { TPermissionWithGroup } from "@/api/auth/type";
import { queryClient } from "@/libs/react-query/react-query-clients";
import { useQuery } from "@/app/_hooks/request/use-query";

export type UserRole = "super_admin" | "admin" | "client";

export interface Permission {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  slug: string;
  permissions: TPermissionWithGroup[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  roles?: Role[];
}

interface SessionContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  refetchUser: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Query keys for session management
export const SESSION_QUERY_KEYS = {
  USER: ["session", "user"] as const,
};

// SECURITY: Only store user_id in localStorage, not PII (email, name)
// Full user data is kept in React Query cache only
const SESSION_KEY = "bas_session_id";

// ============================================================================
// HELPER FUNCTIONS - Extract & Transform Logic
// ============================================================================

/**
 * Extract tokens from API response
 * Works with normalized response from axios interceptor
 * Handles multiple backend response formats:
 * - Nested: { data: { data: { user, token: { access_token, refresh_token } } } }
 * - Flat: { id, username, token: "string", refresh_token: "string" }
 */
const extractTokensFromResponse = (response: any) => {
  console.log("[Token Extraction] Full response:", response);

  // Multiple levels to check based on axios normalization
  // Level 1: response.data.data (most nested - from backend)
  // Level 2: response.data (normalized by axios)
  // Level 3: response (direct)
  const possibleSources = [
    response.data?.data, // { data: { data: { user, token } } }
    response.data, // { data: { user, token } }
    response, // { user, token }
  ].filter(Boolean);

  console.log("[Token Extraction] Possible sources:", possibleSources);

  let tokenData = null;
  let sourceWithToken = null;

  for (const source of possibleSources) {
    // Check if token exists at this level
    if (source.token) {
      tokenData = source.token;
      sourceWithToken = source;
      console.log("[Token Extraction] Found token at source level");
      break;
    }

    // Check if token exists inside user object
    const user = source.user || source.users;
    if (user?.token) {
      tokenData = user.token;
      sourceWithToken = user;
      console.log("[Token Extraction] Found token inside user object");
      break;
    }
  }

  if (!tokenData) {
    console.error("[Token Extraction] No token found in response:", response);
    throw new Error("No token found in response");
  }

  // Handle both string and object token formats
  if (typeof tokenData === "string") {
    console.log("[Token Extraction] Token is string format (flat structure)");
    // Backend sends flat structure: { token: "access_token_string", refresh_token: "refresh_token_string" }
    // Need to get refresh_token from same source level
    const result = {
      access_token: tokenData,
      refresh_token: sourceWithToken?.refresh_token || "",
      access_token_expires_in: sourceWithToken?.access_token_expires_in || "",
      refresh_token_expires_in: sourceWithToken?.refresh_token_expires_in || "",
    };

    console.log("[Token Extraction] Extracted token data:", {
      hasAccessToken: !!result.access_token,
      hasRefreshToken: !!result.refresh_token,
      accessExpiresIn: result.access_token_expires_in,
      refreshExpiresIn: result.refresh_token_expires_in,
    });

    return result;
  }

  // Token is an object - extract all fields
  const result = {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    access_token_expires_in: tokenData.access_token_expires_in || "",
    refresh_token_expires_in: tokenData.refresh_token_expires_in || "",
  };

  console.log("[Token Extraction] Extracted token data:", {
    hasAccessToken: !!result.access_token,
    hasRefreshToken: !!result.refresh_token,
    accessExpiresIn: result.access_token_expires_in,
    refreshExpiresIn: result.refresh_token_expires_in,
  });

  return result;
};

/**
 * Extract user data from API response
 * Works with normalized response from axios interceptor
 * Handles both nested and flat structures
 */
const extractUserFromResponse = (response: any) => {
  console.log("[User Extraction] Full response:", response);

  // Multiple levels to check based on axios normalization
  const possibleSources = [
    response.data?.data, // { data: { data: { user } } }
    response.data, // { data: { user } }
    response, // { user }
  ].filter(Boolean);

  for (const source of possibleSources) {
    // Check for nested user object first
    const user = source.user || source.users;
    if (user && typeof user === "object" && user.id) {
      console.log("[User Extraction] Found user data in nested structure:", {
        id: user.id,
        email: user.email,
      });
      return user;
    }

    // Check for flat structure (user data directly in source)
    // Backend might send: { id, username, fullname, token, refresh_token }
    if (source.id && (source.username || source.fullname || source.email)) {
      console.log("[User Extraction] Found user data in flat structure:", {
        id: source.id,
        username: source.username,
      });
      return source;
    }
  }

  console.error("[User Extraction] No user found in response:", response);
  return null;
};

/**
 * Transform API user response to User object
 */
const transformApiUserToUser = (apiUser: any): User | null => {
  if (!apiUser) return null;

  return {
    id: apiUser.id,
    email: apiUser.email || "",
    name: apiUser.fullname || apiUser.username || "",
    role: (apiUser.roles?.[0]?.slug ||
      (typeof apiUser.role === "string" ? apiUser.role : apiUser.role?.slug) ||
      "client") as UserRole,
    roles: apiUser.roles || [],
  };
};

/**
 * Check if user data is complete (has all required fields)
 */
const isUserDataComplete = (user: User | null): boolean => {
  return !!(user?.id && user?.email && user?.name && user?.roles);
};

// Custom hook for fetching user session using React Query
function useUserSessionQuery() {
  return useQuery<User | null>({
    queryKey: SESSION_QUERY_KEYS.USER,
    queryFn: async () => {
      const token = getAccessToken();

      if (!token) {
        return null;
      }

      const response = await getMe();
      const apiUser = extractUserFromResponse(response);
      const userData = transformApiUserToUser(apiUser);

      if (userData) {
        localStorage.setItem(SESSION_KEY, userData.id);
      }

      return userData;
    },
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading, refetch } = useUserSessionQuery();

  // Token refresh is handled automatically by React Query error handlers
  // No need for manual scheduling - backend will return 401 when token expires
  // React Query error handler will catch 401, call /auth/refresh-token, and retry request

  const login = async (email: string, password: string) => {
    try {
      // Step 1: Login and get response
      const loginResponse = await postLogin({ email, password });

      // Step 2: Extract and store tokens
      const tokens = extractTokensFromResponse(loginResponse);

      // Store tokens in localStorage
      setAccessToken(tokens.access_token);
      setRefreshToken(tokens.refresh_token);

      // Step 3: Extract user data from login response
      const loginUserData = extractUserFromResponse(loginResponse);
      let userData = transformApiUserToUser(loginUserData);

      // Step 4: If user data incomplete, fetch from /me endpoint
      // This optimizes by only calling getMe() when necessary
      if (!isUserDataComplete(userData)) {
        console.log(
          "User data incomplete from login, fetching from /me endpoint",
        );
        const profileResponse = await getMe();
        const profileUserData = extractUserFromResponse(profileResponse);
        userData = transformApiUserToUser({
          ...profileUserData,
          id: profileUserData.id || loginUserData.id,
          email: profileUserData.email || loginUserData.email,
          fullname:
            profileUserData.fullname ||
            loginUserData.fullname ||
            loginUserData.username,
        });
      }

      // Step 5: Validate and store user data
      if (!userData) {
        throw new Error("No user data available");
      }

      // SECURITY: Only store user_id, not PII (email, name)
      localStorage.setItem(SESSION_KEY, userData.id);

      // Update React Query cache with user data
      queryClient.setQueryData(SESSION_QUERY_KEYS.USER, userData);

      return { success: true, user: userData };
    } catch (err: any) {
      // Clear any partial data on error
      removeAllTokens();
      localStorage.removeItem(SESSION_KEY);

      return {
        success: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Email atau password salah",
      };
    }
  };

  const logout = () => {
    queryClient.setQueryData(SESSION_QUERY_KEYS.USER, null);

    // Step 2: Baru hapus token & storage
    removeAllTokens();
    localStorage.removeItem(SESSION_KEY);

    // Step 3: Clear cache sisanya
    queryClient.clear();
  };

  // Direct boolean check instead of useMemo
  const isAuthenticated = !!user;

  return (
    <SessionContext.Provider
      value={{
        user: user ?? null,
        isAuthenticated,
        login,
        logout,
        isLoading,
        refetchUser: () => refetch(),
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}

/**
 * Component to handle automatic logout from axios interceptor
 * Must be placed inside Router context to use useNavigate
 */
export function SessionAuthListener() {
  const navigate = useNavigate();
  const { logout } = useSession();

  useEffect(() => {
    const handleAuthLogout = (event: Event) => {
      const customEvent = event as CustomEvent<{ message?: string }>;

      // Call logout to clear state
      logout();

      // Show notification
      notification.warning({
        title: "Sesi Berakhir",
        description:
          customEvent.detail?.message ||
          "Sesi Anda telah berakhir. Silakan login kembali.",
        placement: "topRight",
        duration: 4,
      });

      // Navigate to homepage after a short delay
      navigate("/", { replace: true });
    };

    window.addEventListener("auth:logout", handleAuthLogout);

    return () => {
      window.removeEventListener("auth:logout", handleAuthLogout);
    };
  }, [navigate, logout]);

  return null;
}
