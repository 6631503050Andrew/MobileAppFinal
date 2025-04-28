"use client"

import { createContext, useState, useEffect, useContext, useCallback, useRef, useMemo } from "react"
import { Alert } from "react-native"
import { saveGameState, loadGameState } from "../utils/storage"
import { planets } from "../data/planets"
import { upgrades as upgradesList } from "../data/upgrades"
import { achievements } from "../data/achievements"
import { hats, getRandomHat, calculateCurrencyChestCost, getPlanetHat } from "../data/hats"

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
    version: "2.0.0", // Added version tracking for migrations
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

  // New state for chests and hats
  const [unlockedHats, setUnlockedHats] = useState({})
  const [equippedHat, setEquippedHat] = useState(null)
  const [chests, setChests] = useState({
    advertisement: {
      available: true,
      lastOpened: null,
      cooldownMinutes: 30, // 30 minutes cooldown for ad chests
    },
    currency: {
      purchaseCount: 0,
      nextCost: 500, // Initial cost
    },
    planet: {
      unopened: 0, // Number of unopened planet chests
      lastPlanetUnlocked: null, // Last planet that gave a chest
    },
  })

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
    console.log("GameContext initialized with SDK 52.0.0")
  }, [])

  // Load game state on startup with migration support
  useEffect(() => {
    const loadGame = async () => {
      try {
        console.log("Loading game state...")
        const savedState = await loadGameState()
        if (savedState) {
          console.log("Game state loaded successfully")

          // Check for version and migrate if needed
          const gameVersion = savedState.stats?.version || "1.0.0"
          const needsMigration = gameVersion !== "2.0.0"

          if (needsMigration) {
            console.log(`Migrating game state from version ${gameVersion} to 2.0.0`)
            // Perform any necessary migrations here
          }

          // Ensure currency is never negative when loading
          const safeInitialCurrency = Math.max(0, savedState.currency || 0)
          setCurrency(safeInitialCurrency)
          currencyRef.current = safeInitialCurrency

          setClickValue(savedState.clickValue || 1)
          clickValueRef.current = savedState.clickValue || 1

          setPassiveIncome(savedState.passiveIncome || 0)
          setCurrentPlanet(savedState.currentPlanet || 0)
          setUpgrades(savedState.upgrades || {})

          const loadedStats = {
            ...(savedState.stats || {
              totalClicks: 0,
              totalCurrency: 0,
              totalSpent: 0,
              gameStarted: new Date().toISOString(),
              lastPlayed: new Date().toISOString(),
            }),
            version: "2.0.0", // Ensure version is set
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

          // Load chest and hat data
          setUnlockedHats(savedState.unlockedHats || {})
          setEquippedHat(savedState.equippedHat || null)
          setChests(
            savedState.chests || {
              advertisement: {
                available: true,
                lastOpened: null,
                cooldownMinutes: 30,
              },
              currency: {
                purchaseCount: 0,
                nextCost: 500,
              },
              planet: {
                unopened: 0,
                lastPlanetUnlocked: null,
              },
            },
          )
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
  // Updated for React 18's automatic batching
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
            version: "2.0.0", // Always include version
          },
          settings,
          unlockedAchievements,
          // Save chest and hat data
          unlockedHats,
          equippedHat,
          chests,
        }
        await saveGameState(gameState)
        console.log("Game state saved successfully")
      } catch (err) {
        console.error("Error saving game state:", err)
      }
    }, 1000) // Save after 1 second of inactivity
  }, [
    clickValue,
    passiveIncome,
    currentPlanet,
    upgrades,
    settings,
    unlockedAchievements,
    unlockedHats,
    equippedHat,
    chests,
  ])

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
    unlockedHats,
    equippedHat,
    chests,
    debouncedSave,
  ])

  // Passive income timer with single batch update
  // Optimized for React 18
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
  }, [passiveIncome, isLoaded])

  // Critical fix: Safe currency update function that prevents race conditions
  // Optimized for React 18's automatic batching
  const updateCurrencyState = useCallback((newValue) => {
    // Ensure currency never goes below zero
    const safeValue = Math.max(0, newValue)

    // Update both the state and ref in a single operation
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

    // Update stats
    setStats((prev) => {
      const newStats = {
        ...prev,
        totalClicks: prev.totalClicks + 1,
        totalCurrency: prev.totalCurrency + currentClickValue,
      }
      statsRef.current = newStats
      return newStats
    })

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

          // Add a planet chest when unlocking a new planet
          const newPlanetId = planets[Math.min(currentPlanet + 1, planets.length - 1)].id

          // Check if this planet is different from the last one that gave a chest
          if (chests.planet.lastPlanetUnlocked !== newPlanetId) {
            setChests((prev) => ({
              ...prev,
              planet: {
                ...prev.planet,
                unopened: prev.planet.unopened + 1,
                lastPlanetUnlocked: newPlanetId,
              },
            }))
          }
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
    [upgrades, updateCurrencyState, addCurrency, chests.planet.lastPlanetUnlocked, currentPlanet],
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
      version: "2.0.0", // Include version
    }
    setStats(newStats)
    statsRef.current = newStats

    setUnlockedAchievements({})

    // Reset chest and hat data
    setUnlockedHats({})
    setEquippedHat(null)
    setChests({
      advertisement: {
        available: true,
        lastOpened: null,
        cooldownMinutes: 30,
      },
      currency: {
        purchaseCount: 0,
        nextCost: 500,
      },
      planet: {
        unopened: 0,
        lastPlanetUnlocked: null,
      },
    })

    // Clear any pending updates
    pendingCurrencyUpdatesRef.current = 0
  }, [updateCurrencyState])

  const updateSettings = useCallback((newSettings) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }))
  }, [])

  // Check for achievements - optimized for React 18
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

  // New functions for chest and hat system

  // Open advertisement chest
  const openAdChest = useCallback(() => {
    // Check if ad chest is available
    if (!chests.advertisement.available) {
      console.log("Advertisement chest is on cooldown")
      return { success: false, message: "Chest is on cooldown" }
    }

    // Simulate watching an ad (in a real app, you would integrate an ad SDK here)
    console.log("Simulating ad watch...")

    // Get a random hat from the advertisement chest
    const hatId = getRandomHat("advertisement")
    if (!hatId) {
      return { success: false, message: "Failed to get a hat" }
    }

    // Add the hat to unlocked hats
    setUnlockedHats((prev) => ({
      ...prev,
      [hatId]: {
        unlocked: true,
        unlockedAt: new Date().toISOString(),
      },
    }))

    // Set cooldown for the ad chest
    setChests((prev) => ({
      ...prev,
      advertisement: {
        ...prev.advertisement,
        available: false,
        lastOpened: new Date().toISOString(),
      },
    }))

    return {
      success: true,
      message: `You got a new hat: ${hats[hatId].name}!`,
      hat: hatId,
    }
  }, [chests.advertisement])

  // Open currency chest
  const openCurrencyChest = useCallback(() => {
    // Check if player has enough currency
    const cost = chests.currency.nextCost

    if (currencyRef.current < cost) {
      return { success: false, message: `Not enough stardust. Need ${cost}.` }
    }

    // Deduct currency
    const newCurrency = Math.max(0, currencyRef.current - cost)
    updateCurrencyState(newCurrency)

    // Update stats
    setStats((prev) => ({
      ...prev,
      totalSpent: prev.totalSpent + cost,
    }))

    // Get a random hat from the currency chest
    const hatId = getRandomHat("currency")
    if (!hatId) {
      return { success: false, message: "Failed to get a hat" }
    }

    // Add the hat to unlocked hats
    setUnlockedHats((prev) => {
      console.log("Adding hat to unlocked hats:", hatId)
      return {
        ...prev,
        [hatId]: {
          unlocked: true,
          unlockedAt: new Date().toISOString(),
        },
      }
    })

    // Increase the cost for the next purchase
    const newPurchaseCount = chests.currency.purchaseCount + 1
    const nextCost = calculateCurrencyChestCost(newPurchaseCount)

    setChests((prev) => ({
      ...prev,
      currency: {
        purchaseCount: newPurchaseCount,
        nextCost: nextCost,
      },
    }))

    return {
      success: true,
      message: `You got a new hat: ${hats[hatId].name}!`,
      hat: hatId,
    }
  }, [chests.currency, updateCurrencyState])

  // Open planet chest
  const openPlanetChest = useCallback(() => {
    // Check if there are unopened planet chests
    if (chests.planet.unopened <= 0) {
      return { success: false, message: "No planet chests available" }
    }

    // Get the current planet
    const planet = planets[currentPlanet]
    if (!planet) {
      return { success: false, message: "Invalid planet" }
    }

    // Get the hat for this planet
    const hatId = getPlanetHat(planet.id)
    if (!hatId) {
      return { success: false, message: "No hat available for this planet" }
    }

    // Add the hat to unlocked hats
    setUnlockedHats((prev) => ({
      ...prev,
      [hatId]: {
        unlocked: true,
        unlockedAt: new Date().toISOString(),
      },
    }))

    // Decrease the number of unopened chests
    setChests((prev) => ({
      ...prev,
      planet: {
        ...prev.planet,
        unopened: Math.max(0, prev.planet.unopened - 1),
      },
    }))

    return {
      success: true,
      message: `You got a new hat: ${hats[hatId].name}!`,
      hat: hatId,
    }
  }, [chests.planet, currentPlanet])

  // Equip/unequip hat
  const toggleEquipHat = useCallback(
    (hatId) => {
      console.log("Toggling hat:", hatId, "Current equipped hat:", equippedHat)

      // If the hat is already equipped, unequip it
      if (equippedHat === hatId) {
        console.log("Unequipping hat:", hatId)
        setEquippedHat(null)
        return { equipped: false, hatId: null }
      }

      // Check if the hat is unlocked
      if (!unlockedHats[hatId] || !unlockedHats[hatId].unlocked) {
        console.log("Hat not unlocked:", hatId)
        return { equipped: false, hatId: null, error: "Hat not unlocked" }
      }

      // Equip the hat
      console.log("Equipping hat:", hatId)

      // Debug log hat data
      if (hats[hatId]) {
        console.log("Hat data:", {
          name: hats[hatId].name,
          rarity: hats[hatId].rarity,
          offset: hats[hatId].offset,
        })
      } else {
        console.warn("Warning: Hat data not found for ID:", hatId)
      }

      setEquippedHat(hatId)
      return { equipped: true, hatId }
    },
    [equippedHat, unlockedHats, hats],
  )

  // Check if ad chest is available (considering cooldown)
  useEffect(() => {
    if (!isLoaded) return

    // Check ad chest cooldown
    const checkAdChestCooldown = () => {
      if (!chests.advertisement.lastOpened) {
        // No cooldown if never opened
        if (!chests.advertisement.available) {
          setChests((prev) => ({
            ...prev,
            advertisement: {
              ...prev.advertisement,
              available: true,
            },
          }))
        }
        return
      }

      const now = new Date()
      const lastOpened = new Date(chests.advertisement.lastOpened)
      const cooldownMs = chests.advertisement.cooldownMinutes * 60 * 1000
      const cooldownEnds = new Date(lastOpened.getTime() + cooldownMs)

      if (now >= cooldownEnds && !chests.advertisement.available) {
        // Cooldown has ended, make chest available again
        setChests((prev) => ({
          ...prev,
          advertisement: {
            ...prev.advertisement,
            available: true,
          },
        }))
      }
    }

    // Check cooldown immediately and then every minute
    checkAdChestCooldown()
    const interval = setInterval(checkAdChestCooldown, 60000)

    return () => clearInterval(interval)
  }, [isLoaded, chests.advertisement])

  // Memoize the value object for better performance in React 18
  const value = useMemo(
    () => ({
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
      // Add chest and hat related values and functions
      unlockedHats,
      equippedHat,
      chests,
      openAdChest,
      openCurrencyChest,
      openPlanetChest,
      toggleEquipHat,
      hats,
    }),
    [
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
      settings,
      updateSettings,
      unlockedAchievements,
      claimAchievement,
      unlockedHats,
      equippedHat,
      chests,
      openAdChest,
      openCurrencyChest,
      openPlanetChest,
      toggleEquipHat,
    ],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
