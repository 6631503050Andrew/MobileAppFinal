"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  Platform,
  Pressable,
  Vibration,
  ActivityIndicator,
  ImageBackground,
} from "react-native"
import { useGame } from "../context/GameContext"
import { formatNumber } from "../utils/formatters"

// Optimization: Use a constant for animation configurations
const ANIMATION_CONFIG = {
  CLICK_EFFECT_DURATION: 1000,
  BOUNCE_DURATION_MIN: 80,
  BOUNCE_DURATION_MAX: 150,
  SCALE_MIN: 0.92,
  SCALE_MAX: 0.96,
}

export default function GameScreen() {
  const { currency, clickValue, passiveIncome, currentPlanet, handleClick, planets, isLoaded, error, settings } =
    useGame()

  // State for UI elements
  const [clickEffects, setClickEffects] = useState([])
  const [isPressed, setIsPressed] = useState(false)

  // Critical fix: Improved currency display system
  const [displayCurrency, setDisplayCurrency] = useState(0)
  const displayCurrencyRef = useRef(0)
  const currencyAnimationRef = useRef(null)
  const lastCurrencyUpdateTime = useRef(Date.now())

  // Animation refs
  const planetScale = useRef(new Animated.Value(1)).current
  const effectTimeouts = useRef([])
  const animationsInProgress = useRef([])
  const lastClickTime = useRef(0)

  // Critical fix: Improved currency display animation
  // Optimized for React 18 and SDK 52
  useEffect(() => {
    // Cancel any ongoing animation
    if (currencyAnimationRef.current) {
      clearTimeout(currencyAnimationRef.current)
    }

    // Don't animate if this is the initial load
    if (displayCurrencyRef.current === 0 && currency > 0) {
      displayCurrencyRef.current = currency
      setDisplayCurrency(currency)
      return
    }

    // Calculate animation parameters
    const now = Date.now()
    const timeSinceLastUpdate = now - lastCurrencyUpdateTime.current

    // If updates are coming in very rapidly, use a shorter animation
    // or skip animation entirely for very rapid updates
    const shouldAnimate = timeSinceLastUpdate > 50
    const animationDuration = timeSinceLastUpdate < 200 ? 100 : 300

    lastCurrencyUpdateTime.current = now

    if (!shouldAnimate) {
      // Skip animation for very rapid updates
      displayCurrencyRef.current = currency
      setDisplayCurrency(currency)
      return
    }

    // Start values
    const startValue = displayCurrencyRef.current
    const endValue = currency
    const difference = endValue - startValue

    // Don't animate tiny changes
    if (Math.abs(difference) < 5) {
      displayCurrencyRef.current = currency
      setDisplayCurrency(currency)
      return
    }

    // Animation variables
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / animationDuration, 1)

      // Easing function for smoother animation
      const easedProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress

      // Calculate current value
      const currentValue = Math.floor(startValue + difference * easedProgress)

      // Update display
      displayCurrencyRef.current = currentValue
      setDisplayCurrency(currentValue)

      // Continue animation if not complete
      if (progress < 1) {
        currencyAnimationRef.current = setTimeout(animate, 16) // ~60fps
      } else {
        // Ensure we end exactly at the target value
        displayCurrencyRef.current = endValue
        setDisplayCurrency(endValue)
        currencyAnimationRef.current = null
      }
    }

    // Start animation
    animate()

    // Cleanup on unmount
    return () => {
      if (currencyAnimationRef.current) {
        clearTimeout(currencyAnimationRef.current)
      }
    }
  }, [currency])

  // Debug log to verify component is rendering
  useEffect(() => {
    console.log("GameScreen rendered with SDK 52, isLoaded:", isLoaded)
    if (planets && planets.length > 0 && currentPlanet < planets.length) {
      console.log("Current planet:", planets[currentPlanet]?.name)
    }
  }, [isLoaded, currentPlanet, planets])

  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      effectTimeouts.current.forEach(clearTimeout)
      animationsInProgress.current.forEach((anim) => anim.stop())
      if (currencyAnimationRef.current) {
        clearTimeout(currencyAnimationRef.current)
      }
    }
  }, [])

  // Optimization: Memoize the planet click handler
  // Updated for SDK 52 animation handling
  const onPlanetPress = useCallback(() => {
    // Throttle clicks slightly to prevent overwhelming the animation system
    const now = Date.now()
    if (now - lastClickTime.current < 50) {
      // Still process the click for game state, just don't animate every single one
      handleClick()
      return
    }
    lastClickTime.current = now

    // Optional vibration feedback
    if (Platform.OS === "android" && settings.vibrationEnabled) {
      Vibration.vibrate(10)
    }

    // Generate random bounce parameters for variety
    const scaleValue =
      Math.random() * (ANIMATION_CONFIG.SCALE_MAX - ANIMATION_CONFIG.SCALE_MIN) + ANIMATION_CONFIG.SCALE_MIN

    const duration = Math.floor(
      Math.random() * (ANIMATION_CONFIG.BOUNCE_DURATION_MAX - ANIMATION_CONFIG.BOUNCE_DURATION_MIN) +
        ANIMATION_CONFIG.BOUNCE_DURATION_MIN,
    )

    // Stop any running animations
    planetScale.stopAnimation()

    // Create new bounce animation sequence
    // Updated for SDK 52 animation handling
    const bounceAnimation = Animated.sequence([
      Animated.timing(planetScale, {
        toValue: scaleValue,
        duration: duration,
        useNativeDriver: true,
      }),
      Animated.timing(planetScale, {
        toValue: 1,
        duration: duration * 1.2,
        useNativeDriver: true,
      }),
    ])

    // Start the animation and track it
    bounceAnimation.start()
    animationsInProgress.current.push(bounceAnimation)

    // Add click effect with more randomization
    const id = Date.now() + Math.random()

    // Create a larger area around the planet for click effects
    const areaSize = 300
    const x = Math.random() * areaSize - areaSize / 2
    const y = Math.random() * areaSize - areaSize / 2

    const newEffect = {
      id,
      value: `+${formatNumber(clickValue)}`,
      x,
      y,
      opacity: new Animated.Value(1),
      translateY: new Animated.Value(0),
    }

    setClickEffects((prev) => [...prev, newEffect])

    // Animate the click effect
    Animated.parallel([
      Animated.timing(newEffect.opacity, {
        toValue: 0,
        duration: ANIMATION_CONFIG.CLICK_EFFECT_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(newEffect.translateY, {
        toValue: -50,
        duration: ANIMATION_CONFIG.CLICK_EFFECT_DURATION,
        useNativeDriver: true,
      }),
    ]).start()

    // Remove effect after animation
    const timeoutId = setTimeout(() => {
      setClickEffects((prev) => prev.filter((effect) => effect.id !== id))
    }, ANIMATION_CONFIG.CLICK_EFFECT_DURATION)

    effectTimeouts.current.push(timeoutId)

    // Call the actual click handler
    handleClick()
  }, [handleClick, clickValue, settings.vibrationEnabled, planetScale])

  // Handle press in/out for visual feedback
  const handlePressIn = useCallback(() => {
    setIsPressed(true)
  }, [])

  const handlePressOut = useCallback(() => {
    setIsPressed(false)
  }, [])

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8c5eff" />
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Safety check for planets array
  if (!planets || planets.length === 0 || currentPlanet >= planets.length) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading planet data</Text>
      </View>
    )
  }

  const planet = planets[currentPlanet]

  return (
    <ImageBackground source={require("../assets/space-background.png")} style={styles.container} resizeMode="cover">
      <View style={styles.header}>
        <Text style={styles.currencyText}>{formatNumber(displayCurrency)} Stardust</Text>
        <Text style={styles.rateText}>
          +{formatNumber(clickValue)} per click | +{formatNumber(passiveIncome)} per second
        </Text>
      </View>

      <View style={styles.planetContainer}>
        <Text style={styles.planetName}>{planet.name}</Text>

        <View style={styles.clickArea}>
          {clickEffects.map((effect) => (
            <Animated.Text
              key={effect.id}
              style={[
                styles.clickEffect,
                {
                  transform: [{ translateX: effect.x }, { translateY: effect.translateY }],
                  opacity: effect.opacity,
                },
              ]}
            >
              {effect.value}
            </Animated.Text>
          ))}

          {Platform.OS === "ios" ? (
            <Pressable
              onPress={onPlanetPress}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={[styles.planetButton, isPressed && styles.planetButtonPressed]}
            >
              <Animated.View
                style={[
                  styles.planetImageContainer,
                  {
                    transform: [{ scale: planetScale }],
                  },
                ]}
              >
                <Image source={planet.image} style={styles.planetImage} resizeMode="contain" />
              </Animated.View>
            </Pressable>
          ) : (
            <TouchableOpacity activeOpacity={0.8} onPress={onPlanetPress} style={styles.planetButton}>
              <Animated.View
                style={[
                  styles.planetImageContainer,
                  {
                    transform: [{ scale: planetScale }],
                  },
                ]}
              >
                <Image source={planet.image} style={styles.planetImage} resizeMode="contain" />
              </Animated.View>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.planetDescription}>{planet.description}</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Tap the planet to collect Stardust!</Text>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
    gap: 16,
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
    padding: 20,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  header: {
    alignItems: "center",
    marginBottom: 10,
    paddingTop: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
    padding: 10,
  },
  currencyText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  rateText: {
    fontSize: 16,
    color: "#94a3b8",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  planetContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  planetName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
    position: "absolute",
    top: 10,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  clickArea: {
    width: 320,
    height: 320,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  planetButton: {
    width: 240,
    height: 240,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 120,
    overflow: "hidden",
  },
  planetButtonPressed: {
    opacity: 0.8,
  },
  planetImageContainer: {
    width: 240,
    height: 240,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
  },
  planetImage: {
    width: 220,
    height: 220,
  },
  clickEffect: {
    position: "absolute",
    color: "#fbbf24",
    fontSize: 20,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  planetDescription: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 8,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 14,
    color: "#64748b",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
})
