import * as THREE from 'three'

/**
 * Renderer configuration
 */
export const rendererConfig = {
  antialias: true,
  toneMapping: THREE.ACESFilmicToneMapping,
  toneMappingExposure: 1.3,
  outputColorSpace: THREE.SRGBColorSpace,
  shadowMap: {
    enabled: true,
    type: THREE.PCFSoftShadowMap
  },
  maxPixelRatio: 2
}

export const sceneConfig = {
  backgroundColor: '#111111'
}

