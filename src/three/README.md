# Three.js Scene Structure

This directory contains the organized Three.js scene setup for the Home Assistant Dashboard.

## Directory Structure

```
three/
├── config/          # Configuration files
│   ├── bedLight.js  # Bed light model and interaction settings
│   ├── camera.js    # Camera and controls settings
│   ├── lights.js    # Ambient and point light settings
│   ├── renderer.js  # WebGL renderer settings
│   └── textureMap.js # Texture path mappings
├── interactions/    # Interactive elements
│   └── bedLightControl.js # Bed light loading and click interactions
└── utils/           # Utility modules
    ├── materialUtils.js  # Material creation and application
    ├── modelLoader.js    # GLTF model loading
    ├── sceneSetup.js     # Scene, camera, renderer initialization
    └── textureLoader.js  # Texture loading utilities
```

## Configuration Files

### `config/bedLight.js`

- Bed light model path
- Material settings (color, emissive properties)
- Clickable area configuration (radius, segments)

### `config/camera.js`

- Camera field of view, position, and clipping planes
- OrbitControls settings (damping, panning, target)

### `config/lights.js`

- Ambient light configuration (color, intensity)
- Point light configuration (color, intensity, shadows)

### `config/renderer.js`

- WebGL renderer settings (antialiasing, tone mapping, shadows)
- Scene background color

### `config/textureMap.js`

- Mapping of mesh names to texture file paths
- Model file path constant

## Interactive Elements

### `interactions/bedLightControl.js`

- `loadBedLight(scene)` - Loads bed light model with clickable area
- `setupBedLightInteraction(camera, domElement, bedLightGroup, pointLight)` - Sets up click detection and light toggling
- Returns cleanup function for event listener removal

## Utility Modules

### `utils/textureLoader.js`

- `loadTextures(textureMap)` - Loads all textures asynchronously
- Returns a map of mesh names to loaded THREE.Texture objects

### `utils/modelLoader.js`

- `loadModel(modelPath, textures, camera, controls)` - Loads GLTF model with textures
- `loadSimpleModel(modelPath)` - Loads GLTF model without texture mapping
- Applies textures to meshes (loadModel only)
- Updates camera and controls based on model bounds (loadModel only)
- Returns the loaded model root object

### `utils/materialUtils.js`

- `createFlatStandardMaterial(originalMaterial, texture)` - Creates materials
- `applyTexturesToModel(root, textures)` - Applies textures to model meshes

### `utils/sceneSetup.js`

- `createScene()` - Creates and configures the scene
- `createCamera(width, height)` - Creates perspective camera
- `createRenderer(width, height)` - Creates WebGL renderer
- `createControls(camera, domElement)` - Creates OrbitControls
- `addAmbientLight(scene)` - Adds ambient light
- `addPointLight(scene)` - Adds point light with shadows (returns light reference)
- `setupResizeHandler(container, camera, renderer)` - Handles window resize

## Usage

The main `ThreeScene.jsx` component imports and uses these utilities:

```javascript
import { textureMap, MODEL_PATH } from './three/config/textureMap'
import { loadTextures } from './three/utils/textureLoader'
import { loadModel } from './three/utils/modelLoader'
import { createScene, createCamera, ... } from './three/utils/sceneSetup'
import { loadBedLight, setupBedLightInteraction } from './three/interactions/bedLightControl'
```

### Example: Adding Interactive Elements

```javascript
// Load bed light model
const bedLightGroup = await loadBedLight(scene);

// Setup interaction (returns cleanup function)
const cleanupBedLight = setupBedLightInteraction(
  camera,
  renderer.domElement,
  bedLightGroup,
  pointLight
);

// Clean up on unmount
cleanupBedLight();
```

## Benefits of This Structure

1. **Separation of Concerns** - Each module has a single responsibility
2. **Easy Configuration** - Modify settings without touching logic
3. **Reusability** - Utilities can be reused across different scenes
4. **Testability** - Individual modules can be tested independently
5. **Maintainability** - Clear organization makes code easier to understand
6. **Scalability** - Easy to add new features or configurations
