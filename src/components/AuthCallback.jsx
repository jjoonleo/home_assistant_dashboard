import { useEffect, useState } from 'react';
import { handleOAuthCallback } from '../services/auth';

/**
 * OAuth Callback Component
 * Handles the redirect from Home Assistant after user authorization
 */
function AuthCallback() {
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Parse URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const errorParam = urlParams.get('error');

        // Check for errors from Home Assistant
        if (errorParam) {
          const errorDescription = urlParams.get('error_description') || errorParam;
          throw new Error(errorDescription);
        }

        // Validate required parameters
        if (!code) {
          throw new Error('No authorization code received');
        }

        if (!state) {
          throw new Error('No state parameter received');
        }

        // Exchange code for tokens
        await handleOAuthCallback(code, state);

        setStatus('success');

        // Redirect to home page after successful authentication
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err.message);
        setStatus('error');
      }
    };

    processCallback();
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          padding: '2rem',
          maxWidth: '400px',
        }}
      >
        {status === 'processing' && (
          <>
            <div
              style={{
                width: '48px',
                height: '48px',
                border: '4px solid rgba(255, 255, 255, 0.2)',
                borderTopColor: '#3b82f6',
                borderRadius: '50%',
                margin: '0 auto 1.5rem',
                animation: 'spin 1s linear infinite',
              }}
            />
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem' }}>
              Authenticating...
            </h2>
            <p style={{ margin: 0, color: '#999', fontSize: '0.9rem' }}>
              Connecting to Home Assistant
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div
              style={{
                width: '48px',
                height: '48px',
                margin: '0 auto 1.5rem',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem' }}>
              Success!
            </h2>
            <p style={{ margin: 0, color: '#999', fontSize: '0.9rem' }}>
              Redirecting to dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div
              style={{
                width: '48px',
                height: '48px',
                margin: '0 auto 1.5rem',
                backgroundColor: '#ef4444',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem' }}>
              Authentication Failed
            </h2>
            <p style={{ margin: '0 0 1.5rem', color: '#999', fontSize: '0.9rem' }}>
              {error || 'An unknown error occurred'}
            </p>
            <button
              onClick={() => (window.location.href = '/')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Return to Home
            </button>
          </>
        )}

        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
}

export default AuthCallback;



