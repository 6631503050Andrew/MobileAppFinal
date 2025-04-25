"use client"

import { useState, useRef, useEffect } from "react"
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
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useGame } from "../context/GameContext"
import { formatNumber } from "../utils/formatters"

export default function GameScreen() {
  const { currency, clickValue, passiveIncome, currentPlanet, handleClick, planets, isLoaded, error } = useGame()

  const [clickEffects, setClickEffects] = useState([])
  const planetScale = useRef(new Animated.Value(1)).current
  const [isPressed, setIsPressed] = useState(false)

  // Debug log to verify component is rendering
  useEffect(() => {
    console.log("GameScreen rendered, isLoaded:", isLoaded)
    if (planets && planets.length > 0 && currentPlanet < planets.length) {
      console.log("Current planet:", planets[currentPlanet]?.name)
    }
  }, [isLoaded, currentPlanet, planets])

  // Handle planet click with animation
  const onPlanetPress = () => {
    console.log("Planet pressed!")

    // Optional vibration feedback
    if (Platform.OS === "android") {
      Vibration.vibrate(10)
    }

    // Scale animation
    Animated.sequence([
      Animated.timing(planetScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(planetScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()

    // Add click effect
    const id = Date.now()
    const newEffect = {
      id,
      value: `+${formatNumber(clickValue)}`,
      x: Math.random() * 100 - 50, // Random position around the click
      y: -20,
    }

    setClickEffects((prev) => [...prev, newEffect])

    // Remove effect after animation
    setTimeout(() => {
      setClickEffects((prev) => prev.filter((effect) => effect.id !== id))
    }, 1000)

    // Call the actual click handler
    handleClick()
  }

  // Handle press in/out for visual feedback
  const handlePressIn = () => {
    setIsPressed(true)
  }

  const handlePressOut = () => {
    setIsPressed(false)
  }

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
    <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.currencyText}>{formatNumber(currency)} Stardust</Text>
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
                  transform: [{ translateX: effect.x }, { translateY: effect.y }],
                  opacity: new Animated.Value(1),
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
                <Image
                  source={planet.image}
                  style={styles.planetImage}
                  resizeMode="contain"
                  defaultSource={require("../assets/planets/placeholder.png")}
                />
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
                <Image
                  source={planet.image}
                  style={styles.planetImage}
                  resizeMode="contain"
                  defaultSource={require("../assets/planets/placeholder.png")}
                />
              </Animated.View>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.planetDescription}>{planet.description}</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Tap the planet to collect Stardust!</Text>
      </View>
    </LinearGradient>
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
    marginBottom: 20,
    paddingTop: 10,
  },
  currencyText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  rateText: {
    fontSize: 16,
    color: "#94a3b8",
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
    marginBottom: 10,
  },
  clickArea: {
    width: 250,
    height: 250,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  planetButton: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
    overflow: "hidden",
  },
  planetButtonPressed: {
    opacity: 0.8,
  },
  planetImageContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  planetImage: {
    width: 180,
    height: 180,
  },
  clickEffect: {
    position: "absolute",
    color: "#fbbf24",
    fontSize: 18,
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
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 14,
    color: "#64748b",
  },
})
