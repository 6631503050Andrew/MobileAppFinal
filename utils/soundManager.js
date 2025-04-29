import { Audio } from "expo-av"

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

// Import only the available sound files
import clickSound from "../assets/sounds/click.mp3";
import purchaseSound from "../assets/sounds/purchase.mp3";
import achievementSound from "../assets/sounds/achievement.mp3";
import chestOpenSound from "../assets/sounds/chest_open.mp3";

// Preload sounds for better performance
export const preloadSounds = async () => {
  try {
    console.log("Preloading sound effects...")

    // Define only the available sounds to preload
    const soundsToLoad = {
      click: clickSound,
      purchase: purchaseSound,
      achievement: achievementSound,
      chestOpen: chestOpenSound,
    }

    // Load each sound into cache
    for (const [key, source] of Object.entries(soundsToLoad)) {
      const { sound } = await Audio.Sound.createAsync(source, {
        shouldPlay: false,
        volume: 0.5,
      })
      soundCache[key] = sound
    }

    console.log("Sound preloading complete")
    return true
  } catch (error) {
    console.error("Error preloading sounds:", error)
    return false
  }
}

// Play a sound effect
export const playSound = async (soundName, volume = 0.5) => {
  try {
    // Check if sound is enabled in settings
    if (!soundSettings.soundEnabled) {
      return;
    }

    console.log(`Attempting to play sound: ${soundName}`);

    // Get sound from cache
    const sound = soundCache[soundName];

    if (!sound) {
      console.error(`Sound "${soundName}" not preloaded`);
      return;
    }

    // Reset sound to beginning (in case it was played before)
    await sound.setPositionAsync(0);
    await sound.setVolumeAsync(volume);
    await sound.playAsync();
    console.log(`Sound played: ${soundName}`);
  } catch (error) {
    console.error(`Error playing sound "${soundName}":`, error);
  }
}

// Clean up sounds when app is closing
export const unloadSounds = async () => {
  try {
    console.log("Unloading sounds...")
    for (const [key, sound] of Object.entries(soundCache)) {
      try {
        await sound.unloadAsync()
        console.log(`Sound unloaded: ${key}`)
      } catch (error) {
        console.error(`Error unloading sound ${key}:`, error)
      }
    }
    console.log("Sounds unloaded successfully")
  } catch (error) {
    console.error("Error unloading sounds:", error)
  }
}
