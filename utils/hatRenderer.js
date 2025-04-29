// This utility file helps with hat rendering and debugging

/**
 * Validates that a hat can be properly rendered
 * @param {string} hatId - The ID of the hat to validate
 * @param {object} hats - The hats data object
 * @param {object} unlockedHats - The unlocked hats object
 * @returns {object} - Validation result with status and message
 */
export const validateHatRendering = (hatId, hats, unlockedHats) => {
  const result = {
    canRender: false,
    issues: [],
  }

  // Check if hat exists in the hats data
  if (!hats[hatId]) {
    result.issues.push(`Hat ID "${hatId}" not found in hats data`)
    return result
  }

  // Check if hat is unlocked
  if (!unlockedHats[hatId] || !unlockedHats[hatId].unlocked) {
    result.issues.push(`Hat "${hatId}" is not unlocked`)
    return result
  }

  // Check if hat has valid offset
  const hatData = hats[hatId]
  if (!hatData.offset || typeof hatData.offset.x !== "number" || typeof hatData.offset.y !== "number") {
    result.issues.push(`Hat "${hatId}" has invalid offset data`)
    return result
  }

  // All checks passed
  result.canRender = true
  return result
}

/**
 * Gets the correct image source for a hat
 * @param {string} hatId - The ID of the hat
 * @returns {any} - The image source or null if not available
 */
export const getHatImageSource = (hatId) => {
  try {
    // Map hat IDs to their corresponding image files
    switch (hatId) {
      case "AHat1":
        return require("../assets/hats/AHat1.png")
      case "AHat2":
        return require("../assets/hats/AHat2.png")
      case "AHat3":
        return require("../assets/hats/AHat3.png")
      case "AHat4":
        return require("../assets/hats/AHat4.png")
      case "AHat5":
        return require("../assets/hats/AHat5.png")
      case "AHat6":
        return require("../assets/hats/AHat6.png")
      case "AHat7":
        return require("../assets/hats/AHat7.png")
      case "AHat8":
        return require("../assets/hats/AHat8.png")
      case "AHat9":
        return require("../assets/hats/AHat9.png")
      case "AHat10":
        return require("../assets/hats/AHat10.png")
      case "CHat1":
        return require("../assets/hats/CHat1.png")
      case "CHat2":
        return require("../assets/hats/CHat2.png")
      case "CHat3":
        return require("../assets/hats/CHat3.png")
      case "CHat4":
        return require("../assets/hats/CHat4.png")
      case "CHat5":
        return require("../assets/hats/CHat5.png")
      case "CHat6":
        return require("../assets/hats/CHat6.png")
      case "CHat7":
        return require("../assets/hats/CHat7.png")
      case "CHat8":
        return require("../assets/hats/CHat8.png")
      case "CHat9":
        return require("../assets/hats/CHat9.png")
      case "CHat10":
        return require("../assets/hats/CHat10.png")
      case "mercuryHat":
        return require("../assets/hats/MercuryHat.png")
      case "venusHat":
        return require("../assets/hats/VenusHat.png")
      case "earthHat":
        return require("../assets/hats/EarthHat.png")
      case "marsHat":
        return require("../assets/hats/MarsHat.png")
      case "jupiterHat":
        return require("../assets/hats/JupiterHat.png")
      case "saturnHat":
        return require("../assets/hats/SaturnHat.png")
      case "uranusHat":
        return require("../assets/hats/UranusHat.png")
      case "neptuneHat":
        return require("../assets/hats/NeptuneHat.png")
      case "plutoHat":
        return require("../assets/hats/PlutoHat.png")
      case "sunHat":
        return require("../assets/hats/SunHat.png")
      default:
        console.warn(`No image source available for hat: ${hatId}`)
        return null
    }
  } catch (error) {
    console.error(`Failed to load hat image for ${hatId}:`, error)
    return null
  }
}

/**
 * Calculates the optimal position for a hat based on planet size
 * @param {string} hatId - The ID of the hat
 * @param {number} planetSize - The size of the planet in pixels
 * @returns {object} - The x and y offsets for the hat
 */
export const calculateHatPosition = (hatId, planetSize = 220) => {
  // Get the base offset from the hat data
  const hatData = require("../data/hats").hats[hatId]
  if (!hatData || !hatData.offset) {
    return { x: 0, y: -planetSize / 2 - 10 } // Default fallback position
  }

  // Use the hat's defined offset
  return hatData.offset
}

/**
 * Logs hat rendering information for debugging
 * @param {string} hatId - The ID of the hat being rendered
 * @param {object} hatData - The hat data object
 * @param {object} renderPosition - The position where the hat is being rendered
 */
export const logHatRenderingInfo = (hatId, hatData, renderPosition) => {
  console.log("=== Hat Rendering Debug Info ===")
  console.log(`Hat ID: ${hatId}`)
  console.log(`Hat Name: ${hatData?.name || "Unknown"}`)
  console.log(`Hat Rarity: ${hatData?.rarity || "Unknown"}`)
  console.log(`Render Position:`, renderPosition)
  console.log("===============================")
}
