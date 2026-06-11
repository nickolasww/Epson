import type { TUserItem } from "@/api/user/type";

// ============================================================================
// TOKEN MANAGEMENT - localStorage based
// ============================================================================

/**
 * Set access token in localStorage
 */
export const setAccessToken = (token: string): void => {
  localStorage.setItem("access_token", token);
};

/**
 * Get access token from localStorage
 */
export const getAccessToken = (): string | null => {
  return typeof localStorage === "object"
    ? localStorage.getItem("access_token")
    : null;
};

/**
 * Remove access token from localStorage
 */
export const removeAccessToken = (): void => {
  if (getAccessToken() != null) localStorage.removeItem("access_token");
};

/**
 * Set refresh token in localStorage
 */
export const setRefreshToken = (token: string): void => {
  localStorage.setItem("refresh_token", token);
};

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  return typeof localStorage === "object"
    ? localStorage.getItem("refresh_token")
    : null;
};

/**
 * Remove refresh token from localStorage
 */
export const removeRefreshToken = (): void => {
  if (getRefreshToken() != null) localStorage.removeItem("refresh_token");
};

/**
 * Remove all tokens from localStorage
 */
export const removeAllTokens = (): void => {
  removeAccessToken();
  removeRefreshToken();
};

// ============================================================================
// USER SESSION MANAGEMENT
// ============================================================================

export const SessionUser = {
  set: (val: { user: TUserItem }) => localStorage.setItem("users", JSON.stringify(val)),

  get: (): { user: TUserItem } | undefined => {
    const users = localStorage.getItem("users");
    return users ? JSON.parse(users) : undefined;
  },

  remove: () => localStorage.removeItem("users"),
};
