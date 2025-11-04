import { useEffect, useRef } from 'react'
import { textureMap, MODEL_PATH } from './three/config/textureMap'
import { loadTextures } from './three/utils/textureLoader'
import { loadModel } from './three/utils/modelLoader'
import {
  createScene,
  createCamera,
  createRenderer,
  createControls,
  addAmbientLight,
  addPointLight,
  setupResizeHandler
} from './three/utils/sceneSetup'
import { loadBedLight, setupBedLightInteraction } from './three/interactions/bedLightControl'

function ThreeScene() {
  const containerRef = useRef(null)
  const animationFrameIdRef = useRef(0)
  const rendererRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight

    // Initialize scene, camera, and renderer
    const scene = createScene()
    const camera = createCamera(width, height)
    const renderer = createRenderer(width, height)
    
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Add lights
    addAmbientLight(scene)
    const pointLight = addPointLight(scene)

    // Setup controls
    const controls = createControls(camera, renderer.domElement)

    // Load textures and models
    const initializeScene = async () => {
      try {
        // Load main bedroom model
        const loadedTextures = await loadTextures(textureMap)
        const model = await loadModel(MODEL_PATH, loadedTextures, camera, controls)
        scene.add(model)

        // Load bed light model with clickable area
        const bedLightGroup = await loadBedLight(scene)
        
        // Setup bed light interaction
        const cleanupBedLightInteraction = setupBedLightInteraction(
          camera,
          renderer.domElement,
          bedLightGroup,
          pointLight
        )
        
        // Store cleanup function for later
        container.dataset.cleanupBedLight = 'attached'
        container.cleanupBedLight = cleanupBedLightInteraction
      } catch (error) {
        console.error('Error initializing scene:', error)
      }
    }

    initializeScene()

    // Setup resize handler
    const cleanupResize = setupResizeHandler(container, camera, renderer)

    // Animation loop
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameIdRef.current)
      cleanupResize()
      
      // Cleanup bed light interaction
      if (container.cleanupBedLight) {
        container.cleanupBedLight()
      }
      
      scene.clear()
      if (rendererRef.current) {
        rendererRef.current.dispose()
        if (rendererRef.current.domElement.parentNode) {
          rendererRef.current.domElement.parentNode.removeChild(
            rendererRef.current.domElement
          )
        }
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    />
  )
}

export default ThreeScene


