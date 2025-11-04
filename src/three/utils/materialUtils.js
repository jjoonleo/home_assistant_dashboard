import * as THREE from 'three'

/**
 * Create a MeshStandardMaterial with flat appearance
 * @param {THREE.Material} originalMaterial - Original material from the model
 * @param {THREE.Texture|null} texture - Texture to apply
 * @returns {THREE.MeshStandardMaterial}
 */
export function createFlatStandardMaterial(originalMaterial, texture) {
  return new THREE.MeshStandardMaterial({
    map: texture || null,
    color: texture ? 0xffffff : (originalMaterial.color || 0xcccccc),
    roughness: 1.0, // Fully rough to minimize reflections
    metalness: 0.0, // No metallic reflections
    side: originalMaterial.side || THREE.FrontSide,
    transparent: originalMaterial.transparent || false,
    opacity: originalMaterial.opacity !== undefined ? originalMaterial.opacity : 1,
    flatShading: false
  })
}

/**
 * Apply textures to model meshes based on their names
 * @param {THREE.Object3D} root - Root object of the loaded model
 * @param {Object} loadedTextures - Map of mesh names to loaded textures
 */
export function applyTexturesToModel(root, loadedTextures) {
  console.log('=== loadedTextures keys:', Object.keys(loadedTextures))
  console.log('=== loadedTextures UUIDs:', Object.entries(loadedTextures).map(([k, v]) => `${k}: ${v.uuid}`))

  root.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return

    // Try to get the name from the object itself, or from its parent node
    let meshName = obj.name

    // If the mesh name is generic, try the parent's name
    if (!loadedTextures[meshName] && obj.parent) {
      meshName = obj.parent.name
    }

    console.log(`Mesh: ${obj.name}, looking for texture: ${meshName}, found: ${!!loadedTextures[meshName]}`)

    // Convert to MeshStandardMaterial with flat appearance
    const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
    const newMaterials = materials.map((mat, idx) => {
      const standardMat = createFlatStandardMaterial(mat, loadedTextures[meshName])

      if (loadedTextures[meshName]) {
        console.log(`  → Applied ${meshName} texture to MeshStandardMaterial ${idx}`)
      }

      return standardMat
    })

    // Set the new materials on the mesh
    obj.material = Array.isArray(obj.material) ? newMaterials : newMaterials[0]

    // Enable shadows
    obj.castShadow = true
    obj.receiveShadow = true
  })
}

