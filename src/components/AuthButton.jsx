import { isAuthenticated, initiateOAuth, logout } from '../services/auth';
import { useHomeAssistant } from '../contexts/HomeAssistantContext';

/**
 * Authentication Button Component
 * Shows login/logout button based on authentication state
 */
function AuthButton() {
  const authenticated = isAuthenticated();
  const { isConnected, connectionState } = useHomeAssistant();

  const handleLogin = () => {
    initiateOAuth();
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout from Home Assistant?')) {
      await logout();
      window.location.reload();
    }
  };

  if (!authenticated) {
    return (
      <button
        onClick={handleLogin}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '1rem',
          fontWeight: '500',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#2563eb';
          e.target.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#3b82f6';
          e.target.style.transform = 'translateY(0)';
        }}
      >
        Connect to Home Assistant
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          color: '#ffffff',
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isConnected ? '#10b981' : '#ef4444',
            animation: isConnected ? 'none' : 'pulse 2s infinite',
          }}
        />
        <span>{connectionState}</span>
      </div>
      <button
        onClick={handleLogout}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: 'rgba(239, 68, 68, 0.9)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(220, 38, 38, 1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.9)';
        }}
      >
        Logout
      </button>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
}

export default AuthButton;



