# Home Assistant 3D Dashboard

An interactive 3D bedroom visualization with real-time Home Assistant integration. Control your smart home devices by interacting with a realistic 3D scene.

![3D Bedroom Dashboard](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Home Assistant](https://img.shields.io/badge/Home_Assistant-41BDF5?style=for-the-badge&logo=home-assistant&logoColor=white)

## Features

### 🎮 Interactive 3D Scene
- Realistic bedroom visualization built with Three.js
- Clickable objects to control devices
- Smooth camera controls and navigation

### 🏠 Home Assistant Integration
- **OAuth2 Authentication** - Secure login with your Home Assistant instance
- **Real-time Two-Way Sync** - Changes reflect instantly in both directions
- **WebSocket Connection** - Persistent connection for immediate updates
- **Auto-reconnect** - Automatically handles connection interruptions
- **Visual Feedback** - Live connection status and device states

### 💡 Smart Light Control
- Click the bed light in the 3D scene to toggle it on/off
- Changes in Home Assistant (app, automations) instantly reflect in the scene
- Brightness and state information displayed in real-time

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## Home Assistant Setup

For detailed setup instructions, see [HOME_ASSISTANT_SETUP.md](./HOME_ASSISTANT_SETUP.md)

### Quick Setup

1. **Start the app**: `npm run dev`
2. **Click "Connect to Home Assistant"** in the top-right corner
3. **Login** with your Home Assistant credentials
4. **Authorize** the application
5. **Control** your devices by clicking objects in the 3D scene

### Configuration

Edit `src/config/homeAssistant.js` to configure:
- Home Assistant server URL (default: `https://ejun.duckdns.org:8123`)
- Entity IDs (default: `light.bed_light`)
- Reconnection settings

## Project Structure

```
src/
├── config/
│   ├── homeAssistant.js          # Home Assistant configuration
│   └── textureMap.js             # 3D texture mappings
├── services/
│   ├── auth.js                   # OAuth2 authentication service
│   └── homeAssistant.js          # WebSocket service
├── contexts/
│   └── HomeAssistantContext.jsx  # React context for HA state
├── components/
│   ├── AuthButton.jsx            # Login/logout button
│   ├── AuthCallback.jsx          # OAuth callback handler
│   ├── StatusIndicator.jsx       # Connection status display
│   └── ErrorBoundary.jsx         # Error boundary component
├── three/
│   ├── config/                   # Three.js configurations
│   ├── interactions/             # 3D interaction handlers
│   └── utils/                    # Three.js utilities
├── App.jsx                       # Main app component
└── ThreeScene.jsx               # 3D scene component
```

## Technology Stack

- **React 19** - UI framework
- **Three.js** - 3D graphics
- **Vite** - Build tool and dev server
- **home-assistant-js-websocket** - Official HA WebSocket library
- **OAuth2** - Secure authentication

## How It Works

### Authentication Flow
1. User initiates OAuth2 flow
2. Redirected to Home Assistant for login
3. Authorization code exchanged for access/refresh tokens
4. Tokens stored securely in localStorage
5. WebSocket connection established

### Device Control Flow
**3D Scene → Home Assistant:**
1. User clicks bed light in 3D scene
2. `light.toggle` service called via WebSocket
3. Home Assistant executes the service
4. State change propagates back via subscription

**Home Assistant → 3D Scene:**
1. Device state changes in Home Assistant
2. WebSocket subscription receives update
3. 3D scene updates to reflect new state
4. Visual feedback shows current state

## Troubleshooting

### Connection Issues
- Verify Home Assistant is accessible at the configured URL
- Check SSL certificate validity
- Review browser console for error messages
- Click "Retry Connection" in the status indicator

### Authentication Issues
- Logout and login again
- Clear browser localStorage
- Verify Home Assistant credentials
- Check user account is active

### Entity Issues
- Verify entity ID exists in Home Assistant
- Check Developer Tools → States in HA
- Update entity ID in configuration if needed

For more detailed troubleshooting, see [HOME_ASSISTANT_SETUP.md](./HOME_ASSISTANT_SETUP.md)

## Development

### Adding New Devices

1. Add entity ID to `src/config/homeAssistant.js`
2. Subscribe to entity in `HomeAssistantContext.jsx`
3. Create 3D model and interaction handler
4. Update ThreeScene to integrate the new device

### Customizing the UI

- **Styling**: Update component styles in respective JSX files
- **3D Models**: Replace models in `public/models/`
- **Textures**: Update textures in `public/textures/`
- **Colors**: Modify color schemes in config files

## API Documentation

See [Home Assistant Developer Docs](https://developers.home-assistant.io/docs/api/websocket) for API details.

## License

MIT

## Acknowledgments

- Built with [Three.js](https://threejs.org/)
- Powered by [Home Assistant](https://www.home-assistant.io/)
- Uses [home-assistant-js-websocket](https://github.com/home-assistant/home-assistant-js-websocket)
