import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { isAuthenticated } from '../services/auth';
import {
  connect,
  disconnect,
  subscribeToEntity,
  toggleLight as toggleLightService,
  turnOnLight as turnOnLightService,
  turnOffLight as turnOffLightService,
  reconnect,
} from '../services/homeAssistant';
import { HOME_ASSISTANT_CONFIG } from '../config/homeAssistant';

const HomeAssistantContext = createContext(null);

/**
 * Connection states
 */
export const ConnectionState = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error',
};

/**
 * Home Assistant Provider Component
 */
export function HomeAssistantProvider({ children }) {
  const [connectionState, setConnectionState] = useState(ConnectionState.DISCONNECTED);
  const [error, setError] = useState(null);
  const [bedLightState, setBedLightState] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const unsubscribeRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  /**
   * Initialize connection to Home Assistant
   */
  const initializeConnection = useCallback(async () => {
    if (!isAuthenticated()) {
      setConnectionState(ConnectionState.DISCONNECTED);
      return;
    }

    try {
      setConnectionState(ConnectionState.CONNECTING);
      setError(null);

      // Connect to Home Assistant
      await connect();
      setConnectionState(ConnectionState.CONNECTED);

      // Subscribe to bed light entity
      const unsubscribe = await subscribeToEntity(
        HOME_ASSISTANT_CONFIG.entities.bedLight,
        (entity) => {
          console.log('Bed light state updated:', entity.state);
          setBedLightState({
            state: entity.state,
            brightness: entity.attributes?.brightness,
            attributes: entity.attributes,
            lastChanged: entity.last_changed,
            lastUpdated: entity.last_updated,
          });
        }
      );

      unsubscribeRef.current = unsubscribe;
    } catch (err) {
      console.error('Failed to initialize Home Assistant connection:', err);
      setError(err.message);
      setConnectionState(ConnectionState.ERROR);

      // Attempt to reconnect after delay
      scheduleReconnect();
    }
  }, []);

  /**
   * Schedule a reconnection attempt
   */
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(async () => {
      if (isAuthenticated() && connectionState !== ConnectionState.CONNECTED) {
        console.log('Attempting to reconnect...');
        try {
          await reconnect();
          await initializeConnection();
        } catch (err) {
          console.error('Reconnection failed:', err);
          scheduleReconnect();
        }
      }
    }, HOME_ASSISTANT_CONFIG.reconnect.delayMs);
  }, [connectionState, initializeConnection]);

  /**
   * Disconnect from Home Assistant
   */
  const disconnectFromHA = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    disconnect();
    setConnectionState(ConnectionState.DISCONNECTED);
    setBedLightState(null);
  }, []);

  /**
   * Toggle bed light
   */
  const toggleBedLight = useCallback(async () => {
    if (connectionState !== ConnectionState.CONNECTED) {
      console.warn('Not connected to Home Assistant');
      return;
    }

    try {
      setIsLoading(true);
      await toggleLightService(HOME_ASSISTANT_CONFIG.entities.bedLight);
    } catch (err) {
      console.error('Failed to toggle light:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [connectionState]);

  /**
   * Turn on bed light
   */
  const turnOnBedLight = useCallback(
    async (options = {}) => {
      if (connectionState !== ConnectionState.CONNECTED) {
        console.warn('Not connected to Home Assistant');
        return;
      }

      try {
        setIsLoading(true);
        await turnOnLightService(HOME_ASSISTANT_CONFIG.entities.bedLight, options);
      } catch (err) {
        console.error('Failed to turn on light:', err);
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [connectionState]
  );

  /**
   * Turn off bed light
   */
  const turnOffBedLight = useCallback(async () => {
    if (connectionState !== ConnectionState.CONNECTED) {
      console.warn('Not connected to Home Assistant');
      return;
    }

    try {
      setIsLoading(true);
      await turnOffLightService(HOME_ASSISTANT_CONFIG.entities.bedLight);
    } catch (err) {
      console.error('Failed to turn off light:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [connectionState]);

  /**
   * Retry connection
   */
  const retryConnection = useCallback(() => {
    setError(null);
    initializeConnection();
  }, [initializeConnection]);

  // Initialize connection on mount if authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      initializeConnection();
    }

    // Cleanup on unmount
    return () => {
      disconnectFromHA();
    };
  }, []);

  // Context value
  const value = {
    connectionState,
    error,
    isConnected: connectionState === ConnectionState.CONNECTED,
    isLoading,
    bedLightState,
    bedLightIsOn: bedLightState?.state === 'on',
    toggleBedLight,
    turnOnBedLight,
    turnOffBedLight,
    retryConnection,
    disconnect: disconnectFromHA,
    connect: initializeConnection,
  };

  return (
    <HomeAssistantContext.Provider value={value}>
      {children}
    </HomeAssistantContext.Provider>
  );
}

/**
 * Hook to use Home Assistant context
 */
export function useHomeAssistant() {
  const context = useContext(HomeAssistantContext);
  
  if (!context) {
    throw new Error('useHomeAssistant must be used within HomeAssistantProvider');
  }
  
  return context;
}

export default HomeAssistantContext;



