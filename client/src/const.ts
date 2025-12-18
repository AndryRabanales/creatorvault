export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Get the login URL based on the configured auth provider
 */
export const getLoginUrl = () => {
  // Check which auth provider is configured
  const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;

  // Auth0
  if (auth0Domain) {
    const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
    return `${apiUrl}/api/oauth/login`;
  }

  // Clerk - client-side redirect
  if (clerkPublishableKey) {
    // Clerk uses client-side auth, return a placeholder
    // The actual auth will be handled by Clerk components
    return "/sign-in";
  }

  // Manus OAuth (development/fallback)
  if (oauthPortalUrl && appId) {
    const redirectUri = `${window.location.origin}/api/oauth/callback`;
    const state = btoa(redirectUri);

    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");

    return url.toString();
  }

  // Fallback: If no provider is configured, use internal Dev Auth page
  return "/login";
};

/**
 * Get the API URL
 */
export const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || window.location.origin;
};
