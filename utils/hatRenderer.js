// Improve cross-platform hat positioning
import { Platform } from "react-native"

export const calculateHatPosition = (hatId, planetSize = 220) => {
  // Get the base offset from the hat data
  const hatData = require("../data/hats").hats[hatId]
  if (!hatData || !hatData.offset) {
    return { x: 0, y: -planetSize / 2 - 10 } // Default fallback position
  }

  // Platform-specific adjustments
  const platformAdjustment = Platform.OS === "ios" ? { x: 0, y: 0 } : { x: 0, y: -5 }

  // Use the hat's defined offset with platform adjustment
  return {
    x: hatData.offset.x + platformAdjustment.x,
    y: hatData.offset.y + platformAdjustment.y,
  }
}
