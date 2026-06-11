import { Auth0Provider } from "@auth0/auth0-react";
import { env } from "@/libs/env";
import type { ReactNode } from "react";

export function Auth0ProviderWrapper({ children }: { children: ReactNode }) {
  // Only enable Auth0 if all required env variables are set
  const isAuth0Enabled =
    env.VITE_SSO_TENANT_ID &&
    env.VITE_SSO_CLIENT_ID &&
    env.VITE_SSO_CALLBACK_URL;

  if (!isAuth0Enabled) {
    return <>{children}</>;
  }

  // TypeScript needs explicit assertion since we checked existence above
  const domain = env.VITE_SSO_TENANT_ID as string;
  const clientId = env.VITE_SSO_CLIENT_ID as string;
  const redirectUri = env.VITE_SSO_CALLBACK_URL as string;

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        scope: env.VITE_SSO_SCOPE || "openid profile email",
        // Only include audience if it's a valid API identifier (not the /authorize endpoint)
        // The audience should be something like "https://your-api.example.com" or just omit it
        ...(env.VITE_SSO_AUTHROIZATION_URL &&
            !env.VITE_SSO_AUTHROIZATION_URL.includes('/authorize') &&
            { audience: env.VITE_SSO_AUTHROIZATION_URL }),
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
}
