/**
 * Home Assistant Configuration
 */

export const HOME_ASSISTANT_CONFIG = {
  // Home Assistant server URL
  serverUrl: 'https://ejun.duckdns.org:8123',
  
  // OAuth2 Configuration
  oauth: {
    // Client ID is the URL of your application
    // For local development, this should be the Vite dev server URL
    // For production, this should be your deployed app URL
    clientId: window.location.origin,
    
    // Redirect URI after OAuth authorization
    // Must be same origin as clientId
    redirectUri: `${window.location.origin}/auth/callback`,
  },
  
  // Entity IDs to control
  entities: {
    bedLight: 'light.bed_light',
  },
  
  // WebSocket reconnection settings
  reconnect: {
    maxAttempts: 5,
    delayMs: 3000,
  },
};

/**
 * Generate the OAuth authorization URL
 */
export function getAuthorizationUrl() {
  const params = new URLSearchParams({
    client_id: HOME_ASSISTANT_CONFIG.oauth.clientId,
    redirect_uri: HOME_ASSISTANT_CONFIG.oauth.redirectUri,
    state: generateState(),
  });
  
  return `${HOME_ASSISTANT_CONFIG.serverUrl}/auth/authorize?${params.toString()}`;
}

/**
 * Generate a random state string for OAuth security
 */
function generateState() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Get WebSocket URL from server URL
 */
export function getWebSocketUrl() {
  const url = new URL(HOME_ASSISTANT_CONFIG.serverUrl);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = '/api/websocket';
  return url.toString();
}



