import { useHomeAssistant } from '../contexts/HomeAssistantContext';

/**
 * Status Indicator Component
 * Shows Home Assistant connection status and bed light state
 */
function StatusIndicator() {
  const {
    isConnected,
    bedLightState,
    bedLightIsOn,
    error,
    retryConnection,
  } = useHomeAssistant();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '1rem',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        borderRadius: '0.75rem',
        padding: '1rem',
        color: '#ffffff',
        fontSize: '0.875rem',
        minWidth: '200px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
      }}
    >
      <div style={{ marginBottom: '0.75rem', fontWeight: '600', fontSize: '1rem' }}>
        Home Assistant
      </div>

      {/* Connection Status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.5rem',
        }}
      >
        <div
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: isConnected ? '#10b981' : '#6b7280',
          }}
        />
        <span style={{ color: '#d1d5db' }}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Bed Light State */}
      {isConnected && bedLightState && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem',
          }}
        >
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: bedLightIsOn ? '#fbbf24' : '#374151',
            }}
          />
          <span style={{ color: '#d1d5db' }}>
            Bed Light: {bedLightIsOn ? 'ON' : 'OFF'}
          </span>
        </div>
      )}

      {/* Brightness */}
      {isConnected && bedLightState && bedLightState.brightness && (
        <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginLeft: '1.25rem' }}>
          Brightness: {Math.round((bedLightState.brightness / 255) * 100)}%
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.5rem',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            borderRadius: '0.375rem',
            border: '1px solid rgba(239, 68, 68, 0.5)',
          }}
        >
          <div style={{ color: '#fca5a5', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
            {error}
          </div>
          <button
            onClick={retryConnection}
            style={{
              padding: '0.375rem 0.75rem',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Last Updated */}
      {isConnected && bedLightState && bedLightState.lastUpdated && (
        <div
          style={{
            marginTop: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#6b7280',
            fontSize: '0.75rem',
          }}
        >
          Last updated: {new Date(bedLightState.lastUpdated).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

export default StatusIndicator;



