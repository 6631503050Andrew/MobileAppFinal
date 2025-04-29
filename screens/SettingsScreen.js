"use client"
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ScrollView, ActivityIndicator } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useGame } from "../context/GameContext"
import { playSound } from "../utils/soundManager"

export default function SettingsScreen() {
  const { resetGame, isLoaded, settings, updateSettings } = useGame()

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8c5eff" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    )
  }

  const confirmReset = () => {
    // Use one of our allowed sounds instead of "error"
    playSound("click")

    Alert.alert(
      "Reset Game",
      "Are you sure you want to reset your game? All progress will be lost.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => playSound("click"), // Use one of our allowed sounds instead of "tabSwitch"
        },
        {
          text: "Reset",
          onPress: () => {
            resetGame()
            Alert.alert("Game Reset", "Your game has been reset successfully.")
          },
          style: "destructive",
        },
      ],
      { cancelable: true },
    )
  }

  const handleToggleSetting = (setting, value) => {
    // Use one of our allowed sounds instead of "tabSwitch"
    playSound("click")
    updateSettings({ [setting]: value })
  }

  return (
    <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.settingsCard}>
          <Text style={styles.cardTitle}>Game Settings</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Sound Effects</Text>
              <Text style={styles.settingDescription}>Enable or disable game sounds</Text>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(value) => handleToggleSetting("soundEnabled", value)}
              trackColor={{ false: "#334155", true: "#3b82f6" }}
              thumbColor={settings.soundEnabled ? "#60a5fa" : "#94a3b8"}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Vibration</Text>
              <Text style={styles.settingDescription}>Enable or disable haptic feedback</Text>
            </View>
            <Switch
              value={settings.vibrationEnabled}
              onValueChange={(value) => handleToggleSetting("vibrationEnabled", value)}
              trackColor={{ false: "#334155", true: "#3b82f6" }}
              thumbColor={settings.vibrationEnabled ? "#60a5fa" : "#94a3b8"}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingDescription}>Enable or disable game notifications</Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={(value) => handleToggleSetting("notificationsEnabled", value)}
              trackColor={{ false: "#334155", true: "#3b82f6" }}
              thumbColor={settings.notificationsEnabled ? "#60a5fa" : "#94a3b8"}
            />
          </View>
        </View>

        <View style={styles.settingsCard}>
          <Text style={styles.cardTitle}>Game Data</Text>

          <TouchableOpacity style={styles.dangerButton} onPress={confirmReset}>
            <Ionicons name="refresh-circle" size={24} color="#fff" />
            <Text style={styles.dangerButtonText}>Reset Game Progress</Text>
          </TouchableOpacity>

          <Text style={styles.warningText}>
            Warning: This will permanently delete all your progress and cannot be undone.
          </Text>
        </View>

        <View style={styles.settingsCard}>
          <Text style={styles.cardTitle}>About</Text>

          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>

          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Developer</Text>
            <Text style={styles.aboutValue}>Space Clicker Team</Text>
          </View>

          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Contact</Text>
            <Text style={styles.aboutValue}>support@spaceclicker.com</Text>
          </View>
        </View>

        <View style={styles.settingsCard}>
          <Text style={styles.cardTitle}>Sound Debug</Text>

          <View style={styles.debugButtonsContainer}>
            <TouchableOpacity
              style={styles.debugButton}
              onPress={() => {
                console.log("Testing click sound")
                playSound("click", 1.0)
              }}
            >
              <Text style={styles.debugButtonText}>Test Click</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.debugButton}
              onPress={() => {
                console.log("Testing purchase sound")
                playSound("purchase", 1.0)
              }}
            >
              <Text style={styles.debugButtonText}>Test Purchase</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.debugButton}
              onPress={() => {
                console.log("Testing achievement sound")
                playSound("achievement", 1.0)
              }}
            >
              <Text style={styles.debugButtonText}>Test Achievement</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.debugButton}
              onPress={() => {
                console.log("Testing chest open sound")
                playSound("chestOpen", 1.0)
              }}
            >
              <Text style={styles.debugButtonText}>Test Chest</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  scrollContent: {
    padding: 16,
  },
  settingsCard: {
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "#94a3b8",
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  dangerButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  warningText: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
  },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  aboutLabel: {
    fontSize: 16,
    color: "#94a3b8",
  },
  aboutValue: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  debugButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  debugButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: "48%",
  },
  debugButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
})
