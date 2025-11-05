# Home Assistant Integration Setup Guide

This guide explains how to set up and use the Home Assistant integration with your 3D bedroom dashboard.

## Prerequisites

- A running Home Assistant instance (https://ejun.duckdns.org:8123)
- A light entity configured in Home Assistant with entity ID: `light.bed_light`
- Network access from your development machine to your Home Assistant instance

## Features

✅ **OAuth2 Authentication** - Secure login flow with Home Assistant  
✅ **Real-time Two-Way Sync** - Changes in HA reflect in the 3D scene and vice versa  
✅ **WebSocket Connection** - Persistent connection for instant updates  
✅ **Auto-reconnect** - Automatically reconnects on connection loss  
✅ **Visual Feedback** - Connection status and light state indicators  
✅ **Error Handling** - Comprehensive error handling with retry mechanisms

## Getting Started

### 1. Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 2. Connect to Home Assistant

1. Click the **"Connect to Home Assistant"** button in the top-right corner
2. You'll be redirected to your Home Assistant login page
3. Log in with your Home Assistant credentials
4. Authorize the application
5. You'll be redirected back to the dashboard

### 3. Control Your Bed Light

Once connected:
- **Click the bed light** in the 3D scene to toggle it on/off
- The change will be sent to Home Assistant
- Changes made in Home Assistant (app, automation, etc.) will reflect in the 3D scene in real-time

## Configuration

### Home Assistant URL

The Home Assistant server URL is configured in `src/config/homeAssistant.js`:

```javascript
serverUrl: 'https://ejun.duckdns.org:8123'
```

### Entity ID

The bed light entity ID is also configured in `src/config/homeAssistant.js`:

```javascript
entities: {
  bedLight: 'light.bed_light',
}
```

To change the entity ID, update this value to match your Home Assistant light entity.

### OAuth2 Client ID

The OAuth2 client ID is automatically set to your app's origin (`window.location.origin`):
- Development: `http://localhost:5173`
- Production: Your deployed app URL

## Architecture

### Components

```
src/
├── config/
│   └── homeAssistant.js          # HA configuration
├── services/
│   ├── auth.js                    # OAuth2 authentication service
│   └── homeAssistant.js           # WebSocket service
├── contexts/
│   └── HomeAssistantContext.jsx   # React context for HA state
├── components/
│   ├── AuthButton.jsx             # Login/logout button
│   ├── AuthCallback.jsx           # OAuth callback handler
│   ├── StatusIndicator.jsx        # Connection status display
│   └── ErrorBoundary.jsx          # Error boundary component
└── three/
    └── interactions/
        └── bedLightControl.js     # 3D interaction with HA integration
```

### Authentication Flow

1. User clicks "Connect to Home Assistant"
2. App redirects to `https://ejun.duckdns.org:8123/auth/authorize`
3. User logs in and authorizes the app
4. Home Assistant redirects back to `/auth/callback` with authorization code
5. App exchanges code for access + refresh tokens
6. Tokens are stored in localStorage
7. WebSocket connection is established

### State Synchronization

**Home Assistant → 3D Scene:**
- WebSocket subscription to `light.bed_light` entity
- When state changes in HA, the 3D point light updates automatically

**3D Scene → Home Assistant:**
- Click on bed light in 3D scene
- Calls `light.toggle` service via WebSocket
- HA updates the light state
- State change propagates back via subscription

## Troubleshooting

### Connection Issues

**Problem:** "Failed to connect to Home Assistant"

**Solutions:**
1. Check that your Home Assistant instance is accessible at `https://ejun.duckdns.org:8123`
2. Verify SSL certificate is valid (browser should not show warnings)
3. Check browser console for specific error messages
4. Click "Retry Connection" in the status indicator

### Authentication Issues

**Problem:** "Authentication failed" or "Invalid authentication"

**Solutions:**
1. Logout and login again
2. Clear browser localStorage and try again
3. Check that you're using the correct Home Assistant credentials
4. Verify your user account is active in Home Assistant

### Entity Not Found

**Problem:** Light doesn't respond or "entity not found"

**Solutions:**
1. Verify the entity ID `light.bed_light` exists in Home Assistant
2. Check Developer Tools → States in Home Assistant
3. Update the entity ID in `src/config/homeAssistant.js` if different

### CORS Issues

**Problem:** CORS errors in browser console

**Solutions:**
1. Home Assistant should automatically allow CORS for OAuth2
2. Check Home Assistant configuration.yaml for trusted_networks or cors_allowed_origins
3. Ensure you're accessing via HTTPS (not HTTP)

## Security Notes

- **Tokens are stored in localStorage** - They persist across browser sessions
- **Tokens are NOT in source control** - Never commit tokens or .env files
- **OAuth2 is secure** - Uses industry-standard authentication
- **Refresh tokens** - Automatically refresh expired access tokens
- **Revocation** - Logout properly revokes tokens from Home Assistant

## Extending the Integration

### Adding More Entities

To control additional lights or devices:

1. Add entity IDs to `src/config/homeAssistant.js`:
```javascript
entities: {
  bedLight: 'light.bed_light',
  deskLight: 'light.desk_light',
  // Add more...
}
```

2. Subscribe to entities in `HomeAssistantContext.jsx`
3. Add 3D models and interaction handlers as needed

### Customizing the UI

- **AuthButton** - Modify styling in `src/components/AuthButton.jsx`
- **StatusIndicator** - Customize display in `src/components/StatusIndicator.jsx`
- **3D Scene** - Update bed light visuals in `src/three/config/bedLight.js`

## API Reference

### useHomeAssistant Hook

```javascript
const {
  connectionState,      // 'disconnected' | 'connecting' | 'connected' | 'error'
  error,               // Error message if any
  isConnected,         // Boolean: true if connected
  isLoading,           // Boolean: true during API calls
  bedLightState,       // Current bed light state object
  bedLightIsOn,        // Boolean: true if light is on
  toggleBedLight,      // Function: Toggle the light
  turnOnBedLight,      // Function: Turn light on
  turnOffBedLight,     // Function: Turn light off
  retryConnection,     // Function: Retry connection
  disconnect,          // Function: Disconnect from HA
  connect,             // Function: Connect to HA
} = useHomeAssistant();
```

## Production Deployment

When deploying to production:

1. **Update OAuth2 Client ID**
   - The client ID will automatically use your production URL
   - Add a `<link rel='redirect_uri'>` tag to your index.html if needed

2. **SSL/HTTPS Required**
   - Both your app and Home Assistant must use HTTPS
   - Mixed content (HTTP + HTTPS) will be blocked

3. **Build the App**
   ```bash
   npm run build
   ```

4. **Deploy**
   - Deploy the `dist/` folder to your hosting service
   - Ensure the redirect URI matches your deployed URL

## Support

For issues specific to:
- **Home Assistant API**: See [Home Assistant Developer Docs](https://developers.home-assistant.io/docs/api/websocket)
- **OAuth2 Flow**: See [Home Assistant Auth API](https://developers.home-assistant.io/docs/auth_api)
- **This Integration**: Check browser console for errors and review error messages in the status indicator

## License

This integration uses the official [home-assistant-js-websocket](https://github.com/home-assistant/home-assistant-js-websocket) library.



