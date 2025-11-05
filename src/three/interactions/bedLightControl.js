import * as THREE from "three";
import { loadSimpleModel } from "../utils/modelLoader";
import { bedLightConfig } from "../config/bedLight";

/**
 * Load and setup the bed light model with clickable area
 * @param {THREE.Scene} scene - The scene to add the bed light to
 * @returns {Promise<THREE.Group>} - The bed light group with model and clickable area
 */
export async function loadBedLight(scene) {
  // Load bed light model
  const bedLightModel = await loadSimpleModel(bedLightConfig.modelPath);

  // Apply material to the bed light for better visibility
  bedLightModel.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({
        color: bedLightConfig.material.color,
        emissive: bedLightConfig.material.emissive,
        emissiveIntensity: bedLightConfig.material.emissiveIntensity,
        roughness: bedLightConfig.material.roughness,
        metalness: bedLightConfig.material.metalness,
      });
    }
  });

  // Calculate the center position of the bed light model
  const boundingBox = new THREE.Box3().setFromObject(bedLightModel);
  const center = new THREE.Vector3();
  boundingBox.getCenter(center);
  console.log("Bed light center position:", center);

  // Create a larger invisible clickable area around the bed light
  const clickableGeometry = new THREE.SphereGeometry(
    bedLightConfig.clickableArea.radius,
    bedLightConfig.clickableArea.segments,
    bedLightConfig.clickableArea.segments
  );
  const clickableMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const clickableArea = new THREE.Mesh(clickableGeometry, clickableMaterial);
  clickableArea.name = "bedLightClickArea";

  // Position the clickable area at the bed light's center
  clickableArea.position.copy(center);

  // Scale along x-axis to make it elliptical
  clickableArea.scale.set(bedLightConfig.clickableArea.scaleX, 1, 1);

  // Create a group to hold both the model and clickable area
  const bedLightGroup = new THREE.Group();
  bedLightGroup.add(bedLightModel);
  bedLightGroup.add(clickableArea);

  scene.add(bedLightGroup);
  console.log("✓ Bed light model loaded with expanded clickable area");

  return bedLightGroup;
}

/**
 * Setup click interaction for the bed light
 * @param {THREE.Camera} camera - The camera
 * @param {HTMLElement} domElement - The renderer DOM element
 * @param {THREE.Object3D} bedLightGroup - The bed light group
 * @param {THREE.PointLight} pointLight - The point light to toggle
 * @param {Function} onToggle - Callback function to toggle light (returns Promise)
 * @returns {Function} - Cleanup function to remove event listener
 */
export function setupBedLightInteraction(
  camera,
  domElement,
  bedLightGroup,
  pointLight,
  onToggle
) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let isProcessing = false;

  const onMouseClick = async (event) => {
    // Prevent multiple simultaneous clicks
    if (isProcessing) {
      return;
    }

    // Calculate mouse position in normalized device coordinates
    const rect = domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update the raycaster
    raycaster.setFromCamera(mouse, camera);

    // Check for intersections with bed light group
    if (bedLightGroup) {
      const intersects = raycaster.intersectObject(bedLightGroup, true);

      if (intersects.length > 0) {
        isProcessing = true;

        try {
          // If onToggle callback provided, use it (for HA integration)
          if (onToggle) {
            await onToggle();
            console.log("Light toggled via Home Assistant");
          } else {
            // Fallback to local toggle if no callback
            if (pointLight) {
              pointLight.visible = !pointLight.visible;
              console.log(
                "Light toggled locally:",
                pointLight.visible ? "ON" : "OFF"
              );
            }
          }
        } catch (error) {
          console.error("Failed to toggle light:", error);
        } finally {
          isProcessing = false;
        }
      }
    }
  };

  // Add click event listener
  domElement.addEventListener("click", onMouseClick);

  // Return cleanup function
  return () => {
    domElement.removeEventListener("click", onMouseClick);
  };
}

/**
 * Update light state from external source (e.g., Home Assistant)
 * @param {THREE.PointLight} pointLight - The point light to update
 * @param {boolean} isOn - Whether the light should be on
 */
export function updateLightState(pointLight, isOn) {
  if (pointLight) {
    pointLight.visible = isOn;
  }
}
