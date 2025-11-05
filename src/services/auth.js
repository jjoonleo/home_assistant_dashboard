/**
 * Home Assistant OAuth2 Authentication Service
 */

import { HOME_ASSISTANT_CONFIG, getAuthorizationUrl } from '../config/homeAssistant';

const TOKEN_STORAGE_KEY = 'ha_tokens';
const STATE_STORAGE_KEY = 'ha_oauth_state';

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  const tokens = getStoredTokens();
  return tokens && tokens.access_token && tokens.refresh_token;
}

/**
 * Get stored authentication tokens
 */
export function getStoredTokens() {
  try {
    const tokensJson = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!tokensJson) return null;
    
    const tokens = JSON.parse(tokensJson);
    return tokens;
  } catch (error) {
    console.error('Error reading stored tokens:', error);
    return null;
  }
}

/**
 * Save authentication tokens to localStorage
 */
export function saveTokens(tokens) {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
  } catch (error) {
    console.error('Error saving tokens:', error);
    throw error;
  }
}

/**
 * Clear stored authentication tokens
 */
export function clearTokens() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(STATE_STORAGE_KEY);
}

/**
 * Initiate OAuth2 authorization flow
 * Redirects user to Home Assistant authorization page
 */
export function initiateOAuth() {
  const authUrl = getAuthorizationUrl();
  
  // Store state for validation when callback returns
  const urlParams = new URLSearchParams(authUrl.split('?')[1]);
  const state = urlParams.get('state');
  if (state) {
    localStorage.setItem(STATE_STORAGE_KEY, state);
  }
  
  // Redirect to Home Assistant authorization page
  window.location.href = authUrl;
}

/**
 * Handle OAuth callback and exchange authorization code for tokens
 * @param {string} code - Authorization code from Home Assistant
 * @param {string} state - State parameter for validation
 * @returns {Promise<object>} - Tokens object
 */
export async function handleOAuthCallback(code, state) {
  // Validate state to prevent CSRF attacks
  const storedState = localStorage.getItem(STATE_STORAGE_KEY);
  if (state !== storedState) {
    throw new Error('Invalid state parameter. Possible CSRF attack.');
  }
  
  // Clear stored state
  localStorage.removeItem(STATE_STORAGE_KEY);
  
  // Exchange authorization code for tokens
  const tokens = await exchangeCodeForTokens(code);
  
  // Save tokens
  saveTokens(tokens);
  
  return tokens;
}

/**
 * Exchange authorization code for access and refresh tokens
 * @param {string} code - Authorization code
 * @returns {Promise<object>} - Tokens object
 */
async function exchangeCodeForTokens(code) {
  const tokenUrl = `${HOME_ASSISTANT_CONFIG.serverUrl}/auth/token`;
  
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    client_id: HOME_ASSISTANT_CONFIG.oauth.clientId,
  });
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error_description || 
      errorData.error || 
      `Token exchange failed with status ${response.status}`
    );
  }
  
  const tokens = await response.json();
  
  // Add timestamp for token expiration tracking
  tokens.expires_at = Date.now() + (tokens.expires_in * 1000);
  
  return tokens;
}

/**
 * Refresh the access token using the refresh token
 * @returns {Promise<object>} - New tokens object
 */
export async function refreshAccessToken() {
  const tokens = getStoredTokens();
  
  if (!tokens || !tokens.refresh_token) {
    throw new Error('No refresh token available');
  }
  
  const tokenUrl = `${HOME_ASSISTANT_CONFIG.serverUrl}/auth/token`;
  
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: tokens.refresh_token,
    client_id: HOME_ASSISTANT_CONFIG.oauth.clientId,
  });
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // If refresh token is invalid, clear all tokens
    if (response.status === 400 || response.status === 401) {
      clearTokens();
    }
    
    throw new Error(
      errorData.error_description || 
      errorData.error || 
      `Token refresh failed with status ${response.status}`
    );
  }
  
  const newTokens = await response.json();
  
  // Add timestamp for token expiration tracking
  newTokens.expires_at = Date.now() + (newTokens.expires_in * 1000);
  
  // Keep the refresh token from previous tokens (not always returned)
  if (!newTokens.refresh_token && tokens.refresh_token) {
    newTokens.refresh_token = tokens.refresh_token;
  }
  
  // Save updated tokens
  saveTokens(newTokens);
  
  return newTokens;
}

/**
 * Check if access token is expired or about to expire (within 60 seconds)
 */
export function isTokenExpired() {
  const tokens = getStoredTokens();
  if (!tokens || !tokens.expires_at) return true;
  
  // Consider token expired if it expires within the next 60 seconds
  return Date.now() >= (tokens.expires_at - 60000);
}

/**
 * Get a valid access token, refreshing if necessary
 * @returns {Promise<string>} - Valid access token
 */
export async function getValidAccessToken() {
  if (!isAuthenticated()) {
    throw new Error('User is not authenticated');
  }
  
  if (isTokenExpired()) {
    const newTokens = await refreshAccessToken();
    return newTokens.access_token;
  }
  
  const tokens = getStoredTokens();
  return tokens.access_token;
}

/**
 * Revoke refresh token and logout
 */
export async function revokeToken() {
  const tokens = getStoredTokens();
  
  if (!tokens || !tokens.refresh_token) {
    clearTokens();
    return;
  }
  
  try {
    const tokenUrl = `${HOME_ASSISTANT_CONFIG.serverUrl}/auth/token`;
    
    const body = new URLSearchParams({
      token: tokens.refresh_token,
      action: 'revoke',
    });
    
    await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
    
    // Always returns 200, so just clear tokens
  } catch (error) {
    console.error('Error revoking token:', error);
  } finally {
    clearTokens();
  }
}

/**
 * Logout user
 */
export async function logout() {
  await revokeToken();
}



