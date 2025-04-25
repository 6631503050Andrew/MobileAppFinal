"use client"

import { createContext, useState, useEffect, useContext, useCallback } from "react"
import { Alert } from "react-native"
import { saveGameState, loadGameState } from "../utils/storage"
import { planets } from "../data/planets"
import { upgrades as upgradesList } from "../data/upgrades"

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
          setCurrency(savedState.currency || 0)
          setClickValue(savedState.clickValue || 1)
          setPassiveIncome(savedState.passiveIncome || 0)
          setCurrentPlanet(savedState.currentPlanet || 0)
          setUpgrades(savedState.upgrades || {})
          setStats(
            savedState.stats || {
              totalClicks: 0,
              totalCurrency: 0,
              totalSpent: 0,
              gameStarted: new Date().toISOString(),
              lastPlayed: new Date().toISOString(),
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

  // Save game state when it changes
  useEffect(() => {
    if (isLoaded) {
      const saveGame = async () => {
        try {
          const gameState = {
            currency,
            clickValue,
            passiveIncome,
            currentPlanet,
            upgrades,
            stats: {
              ...stats,
              lastPlayed: new Date().toISOString(),
            },
          }
          await saveGameState(gameState)
        } catch (err) {
          console.error("Error saving game state:", err)
        }
      }

      saveGame()
    }
  }, [currency, clickValue, passiveIncome, currentPlanet, upgrades, stats, isLoaded])

  // Passive income timer
  useEffect(() => {
    if (!isLoaded) return

    const timer = setInterval(() => {
      if (passiveIncome > 0) {
        addCurrency(passiveIncome)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [passiveIncome, isLoaded])

  // Handle clicks - using useCallback to prevent unnecessary re-renders
  const handleClick = useCallback(() => {
    console.log("Click handled! Adding currency:", clickValue)
    addCurrency(clickValue)
    setStats((prev) => ({
      ...prev,
      totalClicks: prev.totalClicks + 1,
    }))
  }, [clickValue])

  // Add currency
  const addCurrency = useCallback((amount) => {
    setCurrency((prev) => {
      const newValue = prev + amount
      console.log(`Currency updated: ${prev} + ${amount} = ${newValue}`)
      return newValue
    })
    setStats((prev) => ({
      ...prev,
      totalCurrency: prev.totalCurrency + amount,
    }))
  }, [])

  // Purchase upgrade
  const purchaseUpgrade = useCallback(
    (upgradeId) => {
      console.log("Attempting to purchase upgrade:", upgradeId)
      const upgrade = upgradesList.find((u) => u.id === upgradeId)
      if (!upgrade) {
        console.log("Upgrade not found:", upgradeId)
        return false
      }

      const currentLevel = upgrades[upgradeId] || 0
      const cost = upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel)

      if (currency >= cost) {
        console.log(`Purchasing upgrade ${upgradeId} for ${cost} currency`)
        setCurrency((prev) => prev - cost)
        setStats((prev) => ({
          ...prev,
          totalSpent: prev.totalSpent + cost,
        }))

        // Apply upgrade effects
        if (upgrade.type === "click") {
          setClickValue((prev) => prev + upgrade.value)
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
      }

      console.log(`Not enough currency to purchase upgrade ${upgradeId}. Have: ${currency}, Need: ${cost}`)
      return false
    },
    [currency, upgrades],
  )

  // Reset game
  const resetGame = useCallback(() => {
    console.log("Resetting game...")
    setCurrency(0)
    setClickValue(1)
    setPassiveIncome(0)
    setCurrentPlanet(0)
    setUpgrades({})
    setStats({
      totalClicks: 0,
      totalCurrency: 0,
      totalSpent: 0,
      gameStarted: new Date().toISOString(),
      lastPlayed: new Date().toISOString(),
    })
  }, [])

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
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
