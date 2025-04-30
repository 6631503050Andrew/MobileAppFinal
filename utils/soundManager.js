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

// Update preloadSounds function for better compatibility with SDK 52
export const preloadSounds = async () => {
  try {
    console.log("Preloading sound effects for SDK 52...")

    // Define only the required sounds to preload
    const soundsToLoad = {
      click: require("../assets/sounds/click.mp3"),
      purchase: require("../assets/sounds/purchase.mp3"),
      achievement: require("../assets/sounds/achievement.mp3"),
      chestOpen: require("../assets/sounds/chest_open.mp3"),
    }

    // Load each sound into cache with updated loading approach
    for (const [key, source] of Object.entries(soundsToLoad)) {
      try {
        const { sound } = await Audio.Sound.createAsync(source, {
          shouldPlay: false,
          volume: 0.5,
          progressUpdateIntervalMillis: 100, // Add for SDK 52 compatibility
        })
        soundCache[key] = sound
        console.log(`Sound loaded: ${key}`)
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

// Update playSound for better compatibility with SDK 52
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
      // Get sound status first to avoid repeat calls on same sound object
      const status = await sound.getStatusAsync()

      // Reset sound to beginning (in case it was played before)
      await sound.setPositionAsync(0)
      await sound.setVolumeAsync(adjustedVolume)

      // On Android, ensure we don't play too many sounds simultaneously
      if (Platform.OS === "android") {
        if (status.isPlaying) {
          // If already playing, just reset position instead of playing again
          return
        }
      }

      // Use the updated playFromPositionAsync with improved error handling
      await sound.playFromPositionAsync(0)
    } catch (innerError) {
      // Handle playback errors gracefully
      console.warn(`Non-critical error playing sound "${soundName}":`, innerError)
    }
  } catch (error) {
    console.error(`Error playing sound "${soundName}":`, error)
  }
}

// Update unloadSounds for more reliable cleanup with SDK 52
export const unloadSounds = async () => {
  try {
    console.log("Unloading sounds for SDK 52...")

    // Create a copy of the keys to avoid modification during iteration
    const soundKeys = Object.keys(soundCache)

    for (const key of soundKeys) {
      try {
        const sound = soundCache[key]
        if (sound) {
          const status = await sound.getStatusAsync().catch(() => ({ isLoaded: false }))

          if (status.isLoaded) {
            // Stop the sound before unloading
            if (status.isPlaying) {
              await sound.stopAsync().catch(() => {})
            }
            await sound.unloadAsync().catch(() => {})
          }

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
