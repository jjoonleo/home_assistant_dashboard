import * as THREE from 'three'

/**
 * Load all WebP textures from the texture map
 * @param {Object} textureMap - Map of mesh names to texture paths
 * @returns {Promise<Object>} - Map of mesh names to loaded textures
 */
export async function loadTextures(textureMap) {
  const textureLoader = new THREE.TextureLoader()
  const loadedTextures = {}

  const texturePromises = Object.entries(textureMap).map(([meshName, texturePath]) => {
    return new Promise((resolve) => {
      textureLoader.load(
        texturePath,
        (texture) => {
          // Configure texture for color maps
          texture.colorSpace = THREE.SRGBColorSpace
          texture.wrapS = THREE.RepeatWrapping
          texture.wrapT = THREE.RepeatWrapping
          texture.flipY = false
          texture.name = meshName

          if (!loadedTextures[meshName]) {
            loadedTextures[meshName] = texture
            console.log(`✓ Loaded WebP texture for ${meshName}: ${texturePath}`)
          } else {
            console.warn(`⚠ Texture for ${meshName} already exists! Skipping duplicate.`)
          }
          resolve()
        },
        undefined,
        (error) => {
          console.warn(`Failed to load texture for ${meshName}:`, error)
          resolve()
        }
      )
    })
  })

  await Promise.all(texturePromises)
  return loadedTextures
}

