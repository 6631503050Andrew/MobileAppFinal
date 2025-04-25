"use client"

import { createContext, useState, useEffect, useContext, useCallback, useRef } from "react"
import { Alert } from "react-native"
import { saveGameState, loadGameState } from "../utils/storage"
import { planets } from "../data/planets"
import { upgrades as upgradesList } from "../data/upgrades"
import { achievements } from "../data/achievements"

const GameContext = createContext()

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}

export const GameProvider = ({ children }) => {
  // Game state
  const [currency, setCurrency] = useState(0)
  const [clickValue, setClickValue] = useState(1)
  const [passiveIncome, setPassiveIncome] = useState(0)
  const [currentPlanet, setCurrentPlanet] = useState(0)
  const [upgrades, setUpgrades] = useState({})
  const [stats, setStats] = useState({
    totalClicks: 0,
    totalCurrency: 0,
    totalSpent: 0,
    gameStarted: new Date().toISOString(),
    lastPlayed: new Date().toISOString(),
  })
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(null)
  const [settings, setSettings] = useState({
    soundEnabled: true,
    vibrationEnabled: true,
    notificationsEnabled: true,
  })
  const [unlockedAchievements, setUnlockedAchievements] = useState({})

  // Critical fix: Use refs for accurate currency tracking and transaction locking
  const currencyRef = useRef(0)
  const clickValueRef = useRef(1)
  const statsRef = useRef(stats)
  const saveTimeoutRef = useRef(null)
  const isTransactionInProgressRef = useRef(false) // Lock for purchase transactions
  const pendingCurrencyUpdatesRef = useRef(0) // Track pending currency updates

  // Update refs when state changes
  useEffect(() => {
    currencyRef.current = currency
  }, [currency])

  useEffect(() => {
    clickValueRef.current = clickValue
  }, [clickValue])

  useEffect(() => {
    statsRef.current = stats
  }, [stats])

  // Debug log
  useEffect(() => {
    console.log("GameContext initialized")
  }, [])

  // Load game state on startup
  useEffect(() => {
    const loadGame = async () => {
      try {
        console.log("Loading game state...")
        const savedState = await loadGameState()
        if (savedState) {
          console.log("Game state loaded successfully")
          // Ensure currency is never negative when loading
          const safeInitialCurrency = Math.max(0, savedState.currency || 0)
          setCurrency(safeInitialCurrency)
          currencyRef.current = safeInitialCurrency

          setClickValue(savedState.clickValue || 1)
          clickValueRef.current = savedState.clickValue || 1

          setPassiveIncome(savedState.passiveIncome || 0)
          setCurrentPlanet(savedState.currentPlanet || 0)
          setUpgrades(savedState.upgrades || {})

          const loadedStats = savedState.stats || {
            totalClicks: 0,
            totalCurrency: 0,
            totalSpent: 0,
            gameStarted: new Date().toISOString(),
            lastPlayed: new Date().toISOString(),
          }
          setStats(loadedStats)
          statsRef.current = loadedStats

          setSettings(
            savedState.settings || {
              soundEnabled: true,
              vibrationEnabled: true,
              notificationsEnabled: true,
            },
          )
          setUnlockedAchievements(savedState.unlockedAchievements || {})
        } else {
          console.log("No saved game state found, using defaults")
        }
      } catch (err) {
        console.error("Error loading game state:", err)
        setError("Failed to load game state")
        Alert.alert("Error Loading Game", "There was a problem loading your saved game. Starting with default values.")
      } finally {
        setIsLoaded(true)
      }
    }

    loadGame()
  }, [])

  // Optimization: Debounce save operations to prevent excessive writes
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const gameState = {
          currency: currencyRef.current,
          clickValue,
          passiveIncome,
          currentPlanet,
          upgrades,
          stats: {
            ...statsRef.current,
            lastPlayed: new Date().toISOString(),
          },
          settings,
          unlockedAchievements,
        }
        await saveGameState(gameState)
        console.log("Game state saved successfully")
      } catch (err) {
        console.error("Error saving game state:", err)
      }
    }, 1000) // Save after 1 second of inactivity
  }, [clickValue, passiveIncome, currentPlanet, upgrades, settings, unlockedAchievements])

  // Save game state when it changes
  useEffect(() => {
    if (isLoaded) {
      debouncedSave()
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [
    currency,
    clickValue,
    passiveIncome,
    currentPlanet,
    upgrades,
    stats,
    isLoaded,
    settings,
    unlockedAchievements,
    debouncedSave,
  ])

  // Passive income timer with single batch update
  useEffect(() => {
    if (!isLoaded) return

    const timer = setInterval(() => {
      if (passiveIncome > 0) {
        // Calculate total passive income for the interval
        const totalIncome = passiveIncome // Grant the full amount at once
        addCurrency(totalIncome)
      }
    }, 1000) // Update every second

    return () => clearInterval(timer)
  }, [passiveIncome, isLoaded, addCurrency])

  // Critical fix: Safe currency update function that prevents race conditions
  const updateCurrencyState = useCallback((newValue) => {
    // Ensure currency never goes below zero
    const safeValue = Math.max(0, newValue)

    // Update both the state and ref
    setCurrency(safeValue)
    currencyRef.current = safeValue

    // Process any pending updates
    if (pendingCurrencyUpdatesRef.current > 0) {
      const pendingAmount = pendingCurrencyUpdatesRef.current
      pendingCurrencyUpdatesRef.current = 0

      // Apply the pending updates
      const finalValue = Math.max(0, safeValue + pendingAmount)
      setCurrency(finalValue)
      currencyRef.current = finalValue
    }
  }, [])

  // Critical fix: Improved click handler with immediate display update and optimized handling
  const handleClick = useCallback(() => {
    // Get current values from refs for accuracy
    const currentCurrency = currencyRef.current
    const currentClickValue = clickValueRef.current

    // Calculate new currency value
    const newCurrency = currentCurrency + currentClickValue

    // Update currency state safely
    updateCurrencyState(newCurrency)

    // Update display immediately
    setCurrency(newCurrency)

    // Update stats
    const newStats = {
      ...statsRef.current,
      totalClicks: statsRef.current.totalClicks + 1,
      totalCurrency: statsRef.current.totalCurrency + currentClickValue,
    }
    setStats(newStats)
    statsRef.current = newStats

    // Debounce the save operation to prevent excessive writes
    debouncedSave()
  }, [updateCurrencyState, debouncedSave])

  // Critical fix: Safe currency addition with pending updates tracking
  const addCurrency = useCallback(
    (amount) => {
      if (amount <= 0) return

      // If we're in the middle of a transaction, queue this update
      if (isTransactionInProgressRef.current) {
        pendingCurrencyUpdatesRef.current += amount
        return
      }

      const currentCurrency = currencyRef.current
      const newCurrency = currentCurrency + amount

      // Update currency state safely
      updateCurrencyState(newCurrency)

      // Update total currency stat
      setStats((prev) => {
        const newStats = {
          ...prev,
          totalCurrency: prev.totalCurrency + amount,
        }
        statsRef.current = newStats
        return newStats
      })
    },
    [updateCurrencyState],
  )

  // Critical fix: Transaction-based purchase system to prevent negative currency
  const purchaseUpgrade = useCallback(
    (upgradeId) => {
      // Prevent concurrent purchases
      if (isTransactionInProgressRef.current) {
        console.log("Transaction in progress, please wait")
        return false
      }

      try {
        // Start transaction
        isTransactionInProgressRef.current = true

        console.log("Attempting to purchase upgrade:", upgradeId)
        const upgrade = upgradesList.find((u) => u.id === upgradeId)
        if (!upgrade) {
          console.log("Upgrade not found:", upgradeId)
          return false
        }

        const currentLevel = upgrades[upgradeId] || 0
        const cost = upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel)

        // Critical fix: Get the most up-to-date currency value and validate
        const currentCurrency = currencyRef.current

        if (currentCurrency < cost) {
          console.log(`Not enough currency to purchase upgrade ${upgradeId}. Have: ${currentCurrency}, Need: ${cost}`)
          return false
        }

        console.log(`Purchasing upgrade ${upgradeId} for ${cost} currency`)

        // Critical fix: Calculate new currency and ensure it's not negative
        const newCurrency = Math.max(0, currentCurrency - cost)

        // Update currency state safely
        updateCurrencyState(newCurrency)

        // Update stats
        setStats((prev) => {
          const newStats = {
            ...prev,
            totalSpent: prev.totalSpent + cost,
          }
          statsRef.current = newStats
          return newStats
        })

        // Apply upgrade effects
        if (upgrade.type === "click") {
          setClickValue((prev) => {
            const newValue = prev + upgrade.value
            clickValueRef.current = newValue
            return newValue
          })
        } else if (upgrade.type === "passive") {
          setPassiveIncome((prev) => prev + upgrade.value)
        } else if (upgrade.type === "planet" && currentLevel === 0) {
          // Unlock new planet
          setCurrentPlanet((prev) => Math.min(prev + 1, planets.length - 1))
        }

        // Update upgrade level
        setUpgrades((prev) => ({
          ...prev,
          [upgradeId]: (prev[upgradeId] || 0) + 1,
        }))

        return true
      } finally {
        // End transaction and process any pending updates
        isTransactionInProgressRef.current = false

        // Process any pending currency updates that came in during the transaction
        if (pendingCurrencyUpdatesRef.current > 0) {
          const pendingAmount = pendingCurrencyUpdatesRef.current
          pendingCurrencyUpdatesRef.current = 0
          addCurrency(pendingAmount)
        }
      }
    },
    [upgrades, updateCurrencyState, addCurrency],
  )

  // Reset game
  const resetGame = useCallback(() => {
    console.log("Resetting game...")

    // Reset all values safely
    updateCurrencyState(0)

    setClickValue(1)
    clickValueRef.current = 1

    setPassiveIncome(0)
    setCurrentPlanet(0)
    setUpgrades({})

    const newStats = {
      totalClicks: 0,
      totalCurrency: 0,
      totalSpent: 0,
      gameStarted: new Date().toISOString(),
      lastPlayed: new Date().toISOString(),
    }
    setStats(newStats)
    statsRef.current = newStats

    setUnlockedAchievements({})

    // Clear any pending updates
    pendingCurrencyUpdatesRef.current = 0
  }, [updateCurrencyState])

  const updateSettings = useCallback((newSettings) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }))
  }, [])

  useEffect(() => {
    if (!isLoaded) return

    // Check for new achievements
    achievements.forEach((achievement) => {
      const achievementId = achievement.id

      // Skip if already unlocked
      if (unlockedAchievements[achievementId]) return

      // Check if requirement is met
      if (achievement.requirement(statsRef.current, currentPlanet, passiveIncome)) {
        // Unlock achievement
        setUnlockedAchievements((prev) => ({
          ...prev,
          [achievementId]: {
            unlockedAt: new Date().toISOString(),
            claimed: false,
          },
        }))

        // Show notification (if we had a notification system)
        if (settings.notificationsEnabled) {
          console.log(`Achievement unlocked: ${achievement.name}`)
          // In a real app, we would show a proper notification here
        }
      }
    })
  }, [isLoaded, stats, currentPlanet, passiveIncome, unlockedAchievements, settings.notificationsEnabled])

  // Add claimAchievement function
  const claimAchievement = useCallback(
    (achievementId) => {
      const achievement = achievements.find((a) => a.id === achievementId)
      if (!achievement) return false

      const achievementData = unlockedAchievements[achievementId]
      if (!achievementData || achievementData.claimed) return false

      // Mark as claimed
      setUnlockedAchievements((prev) => ({
        ...prev,
        [achievementId]: {
          ...prev[achievementId],
          claimed: true,
        },
      }))

      // Add reward
      addCurrency(achievement.reward)

      return true
    },
    [unlockedAchievements, addCurrency],
  )

  // Create value object
  const value = {
    currency,
    clickValue,
    passiveIncome,
    currentPlanet,
    upgrades,
    stats,
    isLoaded,
    error,
    handleClick,
    purchaseUpgrade,
    resetGame,
    planets,
    upgradesList,
    settings,
    updateSettings,
    achievements,
    unlockedAchievements,
    claimAchievement,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
