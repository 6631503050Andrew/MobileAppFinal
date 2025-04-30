import { Audio } from "expo-av"
import { Platform } from "react-native"

// Sound effect cache to prevent reloading
const soundCache = {}

// Sound settings reference (will be updated from GameContext)
let soundSettings = {
  soundEnabled: true,
}

// Update settings from the game context
export const updateSoundSettings = (settings) => {
  soundSettings = {
    ...soundSettings,
    ...settings,
  }
  console.log("Sound settings updated:", soundSettings)
}

// Preload sounds for better performance
export const preloadSounds = async () => {
  try {
    console.log("Preloading sound effects...")

    // Define only the required sounds to preload
    const soundsToLoad = {
      click: require("../assets/sounds/click.mp3"),
      purchase: require("../assets/sounds/purchase.mp3"),
      achievement: require("../assets/sounds/achievement.mp3"),
      chestOpen: require("../assets/sounds/chest_open.mp3"),
    }

    // Load each sound into cache
    for (const [key, source] of Object.entries(soundsToLoad)) {
      try {
        const { sound } = await Audio.Sound.createAsync(source, {
          shouldPlay: false,
          volume: 0.5,
        })
        soundCache[key] = sound
      } catch (error) {
        console.error(`Failed to load sound ${key}:`, error)
      }
    }

    console.log("Sound preloading complete")
    return true
  } catch (error) {
    console.error("Failed to load sound effects:", error)
    return false
  }
}

// Improve cross-platform audio handling
export const playSound = async (soundName, volume = 0.5) => {
  try {
    // Check if sound is enabled in settings
    if (!soundSettings.soundEnabled) {
      return
    }

    // Add a check to ensure the sound is preloaded
    if (!soundCache[soundName]) {
      console.error(`Sound "${soundName}" not preloaded. Available sounds:`, Object.keys(soundCache))
      return
    }

    // Get sound from cache
    const sound = soundCache[soundName]

    if (!sound) {
      console.error(`Sound "${soundName}" not preloaded`)
      return
    }

    // Platform-specific volume adjustments
    const adjustedVolume = Platform.OS === "android" ? Math.min(volume * 1.2, 1.0) : volume

    try {
      // Reset sound to beginning (in case it was played before)
      await sound.setPositionAsync(0)
      await sound.setVolumeAsync(adjustedVolume)

      // On Android, ensure we don't play too many sounds simultaneously
      if (Platform.OS === "android") {
        // Check if the sound is already playing
        const status = await sound.getStatusAsync()
        if (status.isPlaying) {
          // If already playing, just reset position instead of playing again
          return
        }
      }

      await sound.playAsync()
    } catch (innerError) {
      // Handle playback errors gracefully
      console.warn(`Non-critical error playing sound "${soundName}":`, innerError)
    }
  } catch (error) {
    console.error(`Error playing sound "${soundName}":`, error)
  }
}

// Improve sound unloading to ensure proper cleanup
export const unloadSounds = async () => {
  try {
    console.log("Unloading sounds...")

    // Create a copy of the keys to avoid modification during iteration
    const soundKeys = Object.keys(soundCache)

    for (const key of soundKeys) {
      try {
        const sound = soundCache[key]
        if (sound) {
          // Stop the sound before unloading
          await sound.stopAsync().catch(() => {})
          await sound.unloadAsync()
          delete soundCache[key]
          console.log(`Sound unloaded: ${key}`)
        }
      } catch (error) {
        console.error(`Error unloading sound ${key}:`, error)
      }
    }

    console.log("Sounds unloaded successfully")
  } catch (error) {
    console.error("Error unloading sounds:", error)
  }
}
