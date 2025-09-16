// Utility function to get the correct API base URL
export const getApiBaseUrl = (): string => {
  // 1. Check for runtime injected config (set by backend when serving HTML)
  const injectedConfig = (
    window as unknown as { __APP_CONFIG__?: { apiBaseUrl?: string } }
  ).__APP_CONFIG__?.apiBaseUrl;
  if (injectedConfig) {
    return `${injectedConfig}/api`;
  }

  // 2. Check for build-time environment variable
  const baseUrl =
    import.meta.env.VITE_APP_SERVER_URL || import.meta.env.VITE_API_BASE_URL;
  if (baseUrl) {
    // Remove /api suffix if present, as we add it back
    const cleanBaseUrl = baseUrl.replace(/\/api$/, "");
    return `${cleanBaseUrl}/api`;
  }

  // 3. Fallback to relative path
  return "/api";
};

// Export the enhanced API service as the main one
export { apiService } from "./api";
export * from "./api";