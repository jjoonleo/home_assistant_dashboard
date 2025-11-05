import { HomeAssistantProvider } from './contexts/HomeAssistantContext'
import ThreeScene from './ThreeScene'
import AuthCallback from './components/AuthCallback'
import AuthButton from './components/AuthButton'
import StatusIndicator from './components/StatusIndicator'
import ErrorBoundary from './components/ErrorBoundary'
import { isAuthenticated } from './services/auth'

function App() {
  // Simple routing based on pathname
  const pathname = window.location.pathname

  // OAuth callback route
  if (pathname === '/auth/callback') {
    return (
      <ErrorBoundary>
        <AuthCallback />
      </ErrorBoundary>
    )
  }

  // Main app
  return (
    <ErrorBoundary>
      <HomeAssistantProvider>
        <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
          {/* 3D Scene */}
          <ThreeScene />
          
          {/* Authentication Button Overlay */}
          <div
            style={{
              position: 'fixed',
              top: '1rem',
              right: '1rem',
              zIndex: 1000,
            }}
          >
            <AuthButton />
          </div>
          
          {/* Status Indicator (only show when authenticated) */}
          {isAuthenticated() && <StatusIndicator />}
        </div>
      </HomeAssistantProvider>
    </ErrorBoundary>
  )
}

export default App
