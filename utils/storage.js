import AsyncStorage from "@react-native-async-storage/async-storage"

const GAME_STATE_KEY = "@SpaceClicker:gameState"

// Enhanced save mechanism with error handling for SDK 52
export const saveGameState = async (gameState) => {
  try {
    // Add version information if not present
    if (!gameState.stats.version) {
      gameState.stats.version = "2.0.0"
    }

    const jsonValue = JSON.stringify(gameState)
    await AsyncStorage.setItem(GAME_STATE_KEY, jsonValue)
    console.log("Game state saved successfully")
    return true
  } catch (e) {
    console.error("Error saving game state:", e)
    return false
  }
}

// Enhanced load mechanism with migration support for SDK 52
export const loadGameState = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(GAME_STATE_KEY)
    if (jsonValue === null) {
      console.log("No saved game state found")
      return null
    }

    try {
      const parsedValue = JSON.parse(jsonValue)

      // Check for version and migrate if needed
      const gameVersion = parsedValue.stats?.version || "1.0.0"
      if (gameVersion !== "2.0.0") {
        console.log(`Migrating game state from version ${gameVersion} to 2.0.0`)
        return migrateGameState(parsedValue, gameVersion)
      }

      console.log("Game state loaded successfully")
      return parsedValue
    } catch (parseError) {
      console.error("Error parsing game state:", parseError)
      // If parsing fails, remove the corrupted state
      await AsyncStorage.removeItem(GAME_STATE_KEY)
      return null
    }
  } catch (e) {
    console.error("Error loading game state:", e)
    return null
  }
}

// Migration function to handle version changes
const migrateGameState = (state, fromVersion) => {
  // Create a deep copy to avoid mutations
  const migratedState = JSON.parse(JSON.stringify(state))

  // Set the new version
  if (!migratedState.stats) {
    migratedState.stats = {}
  }
  migratedState.stats.version = "2.0.0"

  // Add any migration logic here based on fromVersion
  // For example:
  if (fromVersion === "1.0.0") {
    // Migrate from 1.0.0 to 2.0.0
    console.log("Applying 1.0.0 to 2.0.0 migrations")

    // Example: ensure all required fields exist
    if (!migratedState.settings) {
      migratedState.settings = {
        soundEnabled: true,
        vibrationEnabled: true,
        notificationsEnabled: true,
      }
    }

    // Ensure stats has all required fields
    if (!migratedState.stats.totalClicks) migratedState.stats.totalClicks = 0
    if (!migratedState.stats.totalCurrency) migratedState.stats.totalCurrency = 0
    if (!migratedState.stats.totalSpent) migratedState.stats.totalSpent = 0
    if (!migratedState.stats.gameStarted) migratedState.stats.gameStarted = new Date().toISOString()
    if (!migratedState.stats.lastPlayed) migratedState.stats.lastPlayed = new Date().toISOString()
  }

  return migratedState
}

export const clearGameState = async () => {
  try {
    await AsyncStorage.removeItem(GAME_STATE_KEY)
    console.log("Game state cleared successfully")
    return true
  } catch (e) {
    console.error("Error clearing game state:", e)
    return false
  }
}
