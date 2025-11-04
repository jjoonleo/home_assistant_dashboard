import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { applyTexturesToModel } from './materialUtils'

/**
 * Create and configure GLTF loader with Draco support
 * @returns {GLTFLoader}
 */
function createGLTFLoader() {
  const loader = new GLTFLoader()
  const dracoLoader = new DRACOLoader()
  // Use Google's hosted Draco decoders to avoid bundling assets
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
  loader.setDRACOLoader(dracoLoader)
  return loader
}

/**
 * Calculate camera bounds from model
 * @param {THREE.Object3D} root - Root object of the loaded model
 * @returns {Object} - Bounds information
 */
function calculateModelBounds(root) {
  const bounds = new THREE.Box3().setFromObject(root)
  const center = new THREE.Vector3()
  bounds.getCenter(center)
  const size = new THREE.Vector3()
  bounds.getSize(size)
  const maxDimension = Math.max(size.x, size.y, size.z)

  return { bounds, center, size, maxDimension }
}

/**
 * Create a fallback cube when model fails to load
 * @returns {THREE.Mesh}
 */
function createFallbackCube() {
  const fallbackGeo = new THREE.BoxGeometry(1, 1, 1)
  const fallbackMat = new THREE.MeshStandardMaterial({
    color: '#888888',
    roughness: 1.0,
    metalness: 0.0
  })
  return new THREE.Mesh(fallbackGeo, fallbackMat)
}

/**
 * Load a GLTF model and apply textures
 * @param {string} modelPath - Path to the GLTF model
 * @param {Object} loadedTextures - Map of mesh names to loaded textures
 * @param {THREE.Camera} camera - Camera to update based on model bounds
 * @param {OrbitControls} controls - Controls to update based on model bounds
 * @returns {Promise<THREE.Object3D>} - Loaded model root
 */
export async function loadModel(modelPath, loadedTextures, camera, controls) {
  const loader = createGLTFLoader()

  return new Promise((resolve, reject) => {
    loader.load(
      modelPath,
      (gltf) => {
        const root = gltf.scene || gltf.scenes[0]

        // Apply textures to the model
        applyTexturesToModel(root, loadedTextures)

        // Calculate bounds and update camera
        const { maxDimension } = calculateModelBounds(root)
        camera.position.set(37.27, 35.33, -36.92)
        camera.near = maxDimension / 100
        camera.far = maxDimension * 100
        camera.updateProjectionMatrix()

        // Update controls target
        controls.target.set(-4.71, -8.24, -2.00)
        controls.update()

        resolve(root)
      },
      undefined,
      (error) => {
        console.error('Failed to load GLTF:', error)
        const fallbackCube = createFallbackCube()
        reject(error)
        resolve(fallbackCube)
      }
    )
  })
}

/**
 * Load a simple GLTF model without texture mapping or camera adjustment
 * @param {string} modelPath - Path to the GLTF model
 * @returns {Promise<THREE.Object3D>} - Loaded model root
 */
export async function loadSimpleModel(modelPath) {
  const loader = createGLTFLoader()

  return new Promise((resolve, reject) => {
    loader.load(
      modelPath,
      (gltf) => {
        const root = gltf.scene || gltf.scenes[0]
        resolve(root)
      },
      undefined,
      (error) => {
        console.error('Failed to load GLTF:', error)
        reject(error)
      }
    )
  })
}

