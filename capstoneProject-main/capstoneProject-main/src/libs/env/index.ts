/**
 * Environment variables helper
 * Access environment variables with proper typing
 */
export const env = {
  // Auth0 SSO Configuration
  VITE_SSO_TENANT_ID: import.meta.env.VITE_SSO_TENANT_ID as string | undefined,
  VITE_SSO_CLIENT_ID: import.meta.env.VITE_SSO_CLIENT_ID as string | undefined,
  VITE_SSO_CALLBACK_URL: import.meta.env.VITE_SSO_CALLBACK_URL as string | undefined,
  VITE_SSO_SCOPE: import.meta.env.VITE_SSO_SCOPE as string | undefined,
  VITE_SSO_AUTHROIZATION_URL: import.meta.env.VITE_SSO_AUTHROIZATION_URL as string | undefined,
  
  // API Configuration
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL as string | undefined,
  
  // App Configuration
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME as string | undefined,
  MODE: import.meta.env.MODE as string,
  DEV: import.meta.env.DEV as boolean,
  PROD: import.meta.env.PROD as boolean,
};

/**
 * Type-safe way to get environment variable
 */
export function getEnv(key: keyof typeof env): string | undefined {
  return env[key] as string | undefined;
}

/**
 * Get environment variable with fallback
 */
export function getEnvOrDefault(key: keyof typeof env, defaultValue: string): string {
  return (env[key] as string) || defaultValue;
}

/**
 * Check if environment variable is set
 */
export function hasEnv(key: keyof typeof env): boolean {
  return Boolean(env[key]);
}
