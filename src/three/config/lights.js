/**
 * Lighting configuration
 */
export const ambientLightConfig = {
  color: 0xffffff,
  intensity: 0.6
}

export const pointLightConfig = {
  color: 0xffc58f,  // Warm orange-white light color
  intensity: 20,
  distance: 60,
  decay: 2,
  position: {
    x: 6,
    y: 8.25,
    z: -1.2
  },
  shadow: {
    enabled: true,
    bias: -0.001,
    mapSize: 1024
  }
}

