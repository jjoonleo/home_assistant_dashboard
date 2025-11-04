/**
 * Bed Light configuration
 */
export const bedLightConfig = {
  modelPath: "/models/bed_light.gltf",
  material: {
    color: 0xffcc88,
    emissive: 0xffaa44,
    emissiveIntensity: 0.3,
    roughness: 0.4,
    metalness: 0.6,
  },
  clickableArea: {
    radius: 2.0,
    segments: 4,
    scaleX: 2,
  },
};
