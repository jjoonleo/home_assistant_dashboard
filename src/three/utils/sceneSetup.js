import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { 
  cameraConfig, 
  controlsConfig 
} from '../config/camera'
import { 
  ambientLightConfig, 
  pointLightConfig 
} from '../config/lights'
import { 
  rendererConfig, 
  sceneConfig 
} from '../config/renderer'

/**
 * Create and configure the scene
 * @returns {THREE.Scene}
 */
export function createScene() {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(sceneConfig.backgroundColor)
  return scene
}

/**
 * Create and configure the camera
 * @param {number} width - Container width
 * @param {number} height - Container height
 * @returns {THREE.PerspectiveCamera}
 */
export function createCamera(width, height) {
  const camera = new THREE.PerspectiveCamera(
    cameraConfig.fov,
    width / height,
    cameraConfig.near,
    cameraConfig.far
  )
  camera.position.set(
    cameraConfig.position.x,
    cameraConfig.position.y,
    cameraConfig.position.z
  )
  return camera
}

/**
 * Create and configure the renderer
 * @param {number} width - Container width
 * @param {number} height - Container height
 * @returns {THREE.WebGLRenderer}
 */
export function createRenderer(width, height) {
  const renderer = new THREE.WebGLRenderer({ 
    antialias: rendererConfig.antialias 
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, rendererConfig.maxPixelRatio))
  renderer.toneMapping = rendererConfig.toneMapping
  renderer.toneMappingExposure = rendererConfig.toneMappingExposure
  renderer.outputColorSpace = rendererConfig.outputColorSpace
  renderer.shadowMap.enabled = rendererConfig.shadowMap.enabled
  renderer.shadowMap.type = rendererConfig.shadowMap.type
  return renderer
}

/**
 * Create and configure orbit controls
 * @param {THREE.Camera} camera - Camera
 * @param {HTMLElement} domElement - Renderer DOM element
 * @returns {OrbitControls}
 */
export function createControls(camera, domElement) {
  const controls = new OrbitControls(camera, domElement)
  controls.enableDamping = controlsConfig.enableDamping
  controls.enablePan = controlsConfig.enablePan
  controls.screenSpacePanning = controlsConfig.screenSpacePanning
  controls.target.set(
    controlsConfig.target.x,
    controlsConfig.target.y,
    controlsConfig.target.z
  )
  return controls
}

/**
 * Add ambient light to the scene
 * @param {THREE.Scene} scene - Scene
 */
export function addAmbientLight(scene) {
  const ambientLight = new THREE.AmbientLight(
    ambientLightConfig.color,
    ambientLightConfig.intensity
  )
  scene.add(ambientLight)
}

/**
 * Add point light to the scene
 * @param {THREE.Scene} scene - Scene
 * @returns {THREE.PointLight} - The created point light
 */
export function addPointLight(scene) {
  const pointLight = new THREE.PointLight(
    pointLightConfig.color,
    pointLightConfig.intensity,
    pointLightConfig.distance,
    pointLightConfig.decay
  )
  pointLight.position.set(
    pointLightConfig.position.x,
    pointLightConfig.position.y,
    pointLightConfig.position.z
  )

  if (pointLightConfig.shadow.enabled) {
    pointLight.castShadow = true
    pointLight.shadow.bias = pointLightConfig.shadow.bias
    pointLight.shadow.mapSize.width = pointLightConfig.shadow.mapSize
    pointLight.shadow.mapSize.height = pointLightConfig.shadow.mapSize
  }

  scene.add(pointLight)
  console.log('✓ PointLight added')
  return pointLight
}

/**
 * Setup resize handler
 * @param {HTMLElement} container - Container element
 * @param {THREE.Camera} camera - Camera
 * @param {THREE.WebGLRenderer} renderer - Renderer
 * @returns {Function} - Cleanup function
 */
export function setupResizeHandler(container, camera, renderer) {
  const onResize = () => {
    const newWidth = container.clientWidth
    const newHeight = container.clientHeight
    camera.aspect = newWidth / newHeight
    camera.updateProjectionMatrix()
    renderer.setSize(newWidth, newHeight)
  }
  
  window.addEventListener('resize', onResize)
  
  return () => {
    window.removeEventListener('resize', onResize)
  }
}

