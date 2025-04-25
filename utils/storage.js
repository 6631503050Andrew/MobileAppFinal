import AsyncStorage from "@react-native-async-storage/async-storage"

const GAME_STATE_KEY = "@SpaceClicker:gameState"

export const saveGameState = async (gameState) => {
  try {
    const jsonValue = JSON.stringify(gameState)
    await AsyncStorage.setItem(GAME_STATE_KEY, jsonValue)
    console.log("Game state saved successfully")
    return true
  } catch (e) {
    console.error("Error saving game state:", e)
    return false
  }
}

export const loadGameState = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(GAME_STATE_KEY)
    if (jsonValue === null) {
      console.log("No saved game state found")
      return null
    }

    try {
      const parsedValue = JSON.parse(jsonValue)
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
