import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useGame } from "../context/GameContext"
import { formatNumber } from "../utils/formatters"

export default function StatsScreen() {
  const { stats, currency, clickValue, passiveIncome, isLoaded } = useGame()

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8c5eff" />
        <Text style={styles.loadingText}>Loading stats...</Text>
      </View>
    )
  }

  // Calculate time played
  const calculateTimePlayed = () => {
    const startDate = new Date(stats.gameStarted)
    const now = new Date()
    const diffMs = now - startDate

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  return (
    <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Game Stats</Text>

          <View style={styles.statRow}>
            <View style={styles.statIcon}>
              <Ionicons name="time" size={24} color="#60a5fa" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Time Played</Text>
              <Text style={styles.statValue}>{calculateTimePlayed()}</Text>
            </View>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statIcon}>
              <Ionicons name="finger-print" size={24} color="#60a5fa" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Total Clicks</Text>
              <Text style={styles.statValue}>{formatNumber(stats.totalClicks)}</Text>
            </View>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statIcon}>
              <Ionicons name="star" size={24} color="#60a5fa" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Total Stardust Earned</Text>
              <Text style={styles.statValue}>{formatNumber(stats.totalCurrency)}</Text>
            </View>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statIcon}>
              <Ionicons name="cart" size={24} color="#60a5fa" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Total Stardust Spent</Text>
              <Text style={styles.statValue}>{formatNumber(stats.totalSpent)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Current Stats</Text>

          <View style={styles.statRow}>
            <View style={styles.statIcon}>
              <Ionicons name="wallet" size={24} color="#f59e0b" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Current Stardust</Text>
              <Text style={styles.statValue}>{formatNumber(currency)}</Text>
            </View>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statIcon}>
              <Ionicons name="hand-left" size={24} color="#f59e0b" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Click Power</Text>
              <Text style={styles.statValue}>{formatNumber(clickValue)} per click</Text>
            </View>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statIcon}>
              <Ionicons name="hourglass" size={24} color="#f59e0b" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Passive Income</Text>
              <Text style={styles.statValue}>{formatNumber(passiveIncome)} per second</Text>
            </View>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statIcon}>
              <Ionicons name="calculator" size={24} color="#f59e0b" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Hourly Income</Text>
              <Text style={styles.statValue}>{formatNumber(passiveIncome * 3600)} per hour</Text>
            </View>
          </View>
        </View>

        <View style={styles.achievementsCard}>
          <Text style={styles.cardTitle}>Achievements</Text>
          <Text style={styles.comingSoonText}>Coming soon!</Text>
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
  statsCard: {
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
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: "#94a3b8",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  achievementsCard: {
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
  },
  comingSoonText: {
    fontSize: 16,
    color: "#94a3b8",
    marginTop: 20,
    marginBottom: 20,
  },
})
