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
    // For debugging
    console.log(`Attempting to load hat image for: ${hatId}`)
  
    try {
      // Currently we only have CHat1 implemented with an actual image
      if (hatId === "CHat1") {
        return require("../assets/hats/CHat1.png")
      }
  
      // For other hats, we'll use CHat1 as a placeholder until proper assets are added
      // This ensures something is displayed rather than nothing
      return require("../assets/hats/CHat1.png")
    } catch (error) {
      console.error(`Failed to load hat image for ${hatId}:`, error)
  
      // As a fallback, try to return the CHat1 image
      try {
        return require("../assets/hats/CHat1.png")
      } catch (fallbackError) {
        console.error("Failed to load fallback hat image:", fallbackError)
        return null
      }
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
  