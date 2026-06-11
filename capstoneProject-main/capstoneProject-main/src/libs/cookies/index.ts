import Cookies from "js-cookie";

export interface TokenData {
  access_token: string;
  refresh_token: string;
  access_token_expires_in?: string;
  refresh_token_expires_in?: string;
  access_token_expires_at?: number; // timestamp when access token expires
  refresh_token_expires_at?: number; // timestamp when refresh token expires
}

export const SessionToken = {
  set: (val: TokenData) => {
    // Calculate expiry timestamps if expires_in is provided
    if (val.access_token_expires_in && !val.access_token_expires_at) {
      const expiresInSeconds = parseInt(val.access_token_expires_in);
      val.access_token_expires_at = Date.now() + expiresInSeconds * 1000;
      console.log('[SessionToken] Access token will expire at:', new Date(val.access_token_expires_at).toISOString());
    }
    if (val.refresh_token_expires_in && !val.refresh_token_expires_at) {
      const expiresInSeconds = parseInt(val.refresh_token_expires_in);
      val.refresh_token_expires_at = Date.now() + expiresInSeconds * 1000;
      console.log('[SessionToken] Refresh token will expire at:', new Date(val.refresh_token_expires_at).toISOString());
    }
    
    console.log('[SessionToken] Storing token with expiry info:', {
      hasAccessToken: !!val.access_token,
      hasRefreshToken: !!val.refresh_token,
      accessExpiresIn: val.access_token_expires_in,
      refreshExpiresIn: val.refresh_token_expires_in,
      accessExpiresAt: val.access_token_expires_at,
      refreshExpiresAt: val.refresh_token_expires_at,
    });
    
    Cookies.set("token", JSON.stringify(val));
  },
  get: (): TokenData | undefined => {
    const token = Cookies.get("token");
    if (!token) return undefined;
    return JSON.parse(token);
  },
  remove: () => Cookies.remove("token"),
  
  // Check if access token will expire soon (within 5 minutes)
  isAccessTokenExpiringSoon: (): boolean => {
    const token = SessionToken.get();
    if (!token?.access_token_expires_at) return false;
    const fiveMinutes = 5 * 60 * 1000;
    return token.access_token_expires_at - Date.now() < fiveMinutes;
  },
  
  // Check if access token is expired
  isAccessTokenExpired: (): boolean => {
    const token = SessionToken.get();
    if (!token?.access_token_expires_at) return false;
    return token.access_token_expires_at <= Date.now();
  },
  
  // Check if refresh token is expired
  isRefreshTokenExpired: (): boolean => {
    const token = SessionToken.get();
    if (!token?.refresh_token_expires_at) return false;
    return token.refresh_token_expires_at <= Date.now();
  },
};
