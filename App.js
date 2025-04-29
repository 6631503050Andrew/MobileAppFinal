"use client"

import "react-native-gesture-handler"
import React, { useEffect, useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { LogBox, Text, View, ActivityIndicator } from "react-native"
import { GameProvider } from "./context/GameContext"
import GameScreen from "./screens/GameScreen"
import UpgradesScreen from "./screens/UpgradesScreen"
import StatsScreen from "./screens/StatsScreen"
import SettingsScreen from "./screens/SettingsScreen"
import { preloadSounds, unloadSounds } from "./utils/soundManager"
import { Audio } from "expo-av"

// Ignore specific warnings - updated for SDK 52
LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
  "VirtualizedLists should never be nested",
  // Add any new SDK 52 specific warnings here if they appear
])

const Tab = createBottomTabNavigator()

// Error boundary component updated for React 18
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error("Error caught by boundary:", error, info)

    // Log additional details for hat rendering issues
    if (error.message && error.message.includes("hat")) {
      console.error("Hat rendering error detected. Details:", {
        error: error.toString(),
        componentStack: info.componentStack,
      })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#0f172a" }}
        >
          <Text style={{ color: "white", fontSize: 20, marginBottom: 20 }}>Something went wrong!</Text>
          <Text style={{ color: "#94a3b8", textAlign: "center" }}>{this.state.error?.toString()}</Text>
        </View>
      )
    }
    return this.props.children
  }
}

export default function App() {
  const [soundsLoaded, setSoundsLoaded] = useState(false)
  const [audioPermission, setAudioPermission] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log("App initialized with Expo SDK 52.0.0")

    // Request audio permissions and initialize audio
    const setupAudio = async () => {
      try {
        console.log("Setting up audio...")
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        })
        setAudioPermission(true)
        console.log("Audio setup complete")
      } catch (error) {
        console.error("Error setting up audio:", error)
        setAudioPermission(false)
      }
    }

    // Preload sound effects when the app starts
    const loadSounds = async () => {
      try {
        await setupAudio()
        const success = await preloadSounds()
        setSoundsLoaded(success)
        console.log("Sound effects loaded:", success)
      } catch (error) {
        console.error("Failed to load sound effects:", error)
        setSoundsLoaded(false)
      } finally {
        setIsLoading(false)
      }
    }

    loadSounds()

    // Clean up sounds when the app is closed
    return () => {
      unloadSounds()
    }
  }, [])

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f172a" }}>
        <ActivityIndicator size="large" color="#8c5eff" />
        <Text style={{ color: "#fff", marginTop: 20 }}>Loading game resources...</Text>
      </View>
    )
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GameProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  let iconName

                  if (route.name === "Game") {
                    iconName = focused ? "planet" : "planet-outline"
                  } else if (route.name === "Upgrades") {
                    iconName = focused ? "rocket" : "rocket-outline"
                  } else if (route.name === "Stats") {
                    iconName = focused ? "stats-chart" : "stats-chart-outline"
                  } else if (route.name === "Settings") {
                    iconName = focused ? "settings" : "settings-outline"
                  }

                  return <Ionicons name={iconName} size={size} color={color} />
                },
                tabBarActiveTintColor: "#8c5eff",
                tabBarInactiveTintColor: "#7f7f7f",
                tabBarStyle: {
                  backgroundColor: "#111827",
                  borderTopColor: "#2d3748",
                  paddingBottom: 5,
                  paddingTop: 5,
                  height: 60,
                },
                headerStyle: {
                  backgroundColor: "#111827",
                  borderBottomColor: "#2d3748",
                  borderBottomWidth: 1,
                },
                headerTintColor: "#fff",
                headerTitleStyle: {
                  fontWeight: "bold",
                },
              })}
            >
              <Tab.Screen name="Game" component={GameScreen} options={{ title: "Space Clicker" }} />
              <Tab.Screen name="Upgrades" component={UpgradesScreen} />
              <Tab.Screen name="Stats" component={StatsScreen} />
              <Tab.Screen name="Settings" component={SettingsScreen} />
            </Tab.Navigator>
          </NavigationContainer>
        </GameProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  )
}
