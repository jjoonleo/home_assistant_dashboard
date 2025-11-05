/**
 * Home Assistant WebSocket Service
 * Handles connection and communication with Home Assistant
 */

import {
  createConnection,
  subscribeEntities,
  callService,
  ERR_INVALID_AUTH,
} from 'home-assistant-js-websocket';

import { getValidAccessToken, refreshAccessToken, clearTokens } from './auth';
import { HOME_ASSISTANT_CONFIG } from '../config/homeAssistant';

let connection = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

/**
 * Create authentication object for WebSocket connection
 * Returns an auth-like object that the library can use
 */
async function createAuth() {
  const tokens = await getValidAccessToken();
  
  // Create an auth object that matches what the library expects
  const auth = {
    // The hassUrl property that the library uses to determine WebSocket URL
    hassUrl: HOME_ASSISTANT_CONFIG.serverUrl,
    
    // Access token getter
    get accessToken() {
      return tokens;
    },
    
    // WebSocket URL getter - the library uses this
    get wsUrl() {
      const url = new URL(HOME_ASSISTANT_CONFIG.serverUrl);
      url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      url.pathname = '/api/websocket';
      return url.toString();
    },
    
    // Method the library calls to get fresh tokens
    async getAccessToken() {
      try {
        return await getValidAccessToken();
      } catch (error) {
        console.error('Failed to get access token:', error);
        throw error;
      }
    },
    
    // Optional: refresh method
    async refreshAccessToken() {
      await refreshAccessToken();
    },
  };
  
  return auth;
}

/**
 * Connect to Home Assistant WebSocket API
 * @returns {Promise<Connection>} - WebSocket connection object
 */
export async function connect() {
  if (connection) {
    return connection;
  }

  try {
    const auth = await createAuth();

    console.log('Connecting to Home Assistant WebSocket at:', auth.wsUrl);
    
    // Create connection with our custom auth object
    // The library will automatically use auth.wsUrl for the connection
    connection = await createConnection({ auth });

    console.log('✓ Connected to Home Assistant');
    reconnectAttempts = 0;

    // Handle connection close
    connection.addEventListener('ready', () => {
      console.log('WebSocket ready, HA version:', connection.haVersion);
    });

    connection.addEventListener('disconnected', () => {
      console.log('WebSocket disconnected');
      connection = null;
    });

    return connection;
  } catch (error) {
    connection = null;

    // If authentication error, clear tokens
    if (error === ERR_INVALID_AUTH) {
      console.error('Invalid authentication, clearing tokens');
      clearTokens();
      throw new Error('Authentication failed. Please login again.');
    }

    console.error('Failed to connect to Home Assistant:', error);
    throw error;
  }
}

/**
 * Disconnect from Home Assistant
 */
export function disconnect() {
  if (connection) {
    connection.close();
    connection = null;
    console.log('Disconnected from Home Assistant');
  }
}

/**
 * Get current connection
 * @returns {Connection|null}
 */
export function getConnection() {
  return connection;
}

/**
 * Ensure we have an active connection
 * @returns {Promise<Connection>}
 */
async function ensureConnection() {
  if (!connection) {
    return await connect();
  }
  return connection;
}

/**
 * Subscribe to all entity state changes
 * @param {Function} callback - Called when entity states change
 * @returns {Promise<Function>} - Unsubscribe function
 */
export async function subscribeToEntities(callback) {
  const conn = await ensureConnection();

  return subscribeEntities(conn, (entities) => {
    callback(entities);
  });
}

/**
 * Subscribe to a specific entity's state changes
 * @param {string} entityId - Entity ID to subscribe to
 * @param {Function} callback - Called when entity state changes
 * @returns {Promise<Function>} - Unsubscribe function
 */
export async function subscribeToEntity(entityId, callback) {
  return subscribeToEntities((entities) => {
    const entity = entities[entityId];
    if (entity) {
      callback(entity);
    }
  });
}

/**
 * Call a Home Assistant service
 * @param {string} domain - Service domain (e.g., 'light')
 * @param {string} service - Service name (e.g., 'turn_on')
 * @param {object} serviceData - Service data including entity_id
 * @returns {Promise}
 */
export async function callHAService(domain, service, serviceData = {}) {
  try {
    const conn = await ensureConnection();
    await callService(conn, domain, service, serviceData);
    console.log(`Called service: ${domain}.${service}`, serviceData);
  } catch (error) {
    console.error(`Failed to call service ${domain}.${service}:`, error);
    throw error;
  }
}

/**
 * Toggle a light
 * @param {string} entityId - Light entity ID
 */
export async function toggleLight(entityId) {
  return callHAService('light', 'toggle', { entity_id: entityId });
}

/**
 * Turn on a light
 * @param {string} entityId - Light entity ID
 * @param {object} options - Additional options (brightness, color, etc.)
 */
export async function turnOnLight(entityId, options = {}) {
  return callHAService('light', 'turn_on', {
    entity_id: entityId,
    ...options,
  });
}

/**
 * Turn off a light
 * @param {string} entityId - Light entity ID
 */
export async function turnOffLight(entityId) {
  return callHAService('light', 'turn_off', { entity_id: entityId });
}

/**
 * Get current state of an entity
 * @param {string} entityId - Entity ID
 * @returns {Promise<object|null>} - Entity state object
 */
export async function getEntityState(entityId) {
  try {
    const conn = await ensureConnection();

    // Subscribe to get initial state, then unsubscribe
    return new Promise((resolve, reject) => {
      subscribeEntities(conn, (entities) => {
        const entity = entities[entityId];
        if (entity) {
          resolve(entity);
        } else {
          resolve(null);
        }
      })
        .then((unsubscribe) => {
          // Unsubscribe after getting initial state
          setTimeout(unsubscribe, 100);
        })
        .catch(reject);
    });
  } catch (error) {
    console.error(`Failed to get entity state for ${entityId}:`, error);
    return null;
  }
}

/**
 * Reconnect with exponential backoff
 */
export async function reconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('Max reconnection attempts reached');
    throw new Error('Failed to reconnect to Home Assistant');
  }

  reconnectAttempts++;
  const delay = RECONNECT_DELAY * reconnectAttempts;

  console.log(
    `Reconnecting to Home Assistant (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`
  );

  await new Promise((resolve) => setTimeout(resolve, delay));

  try {
    await connect();
    reconnectAttempts = 0;
  } catch (error) {
    console.error('Reconnection failed:', error);
    throw error;
  }
}

