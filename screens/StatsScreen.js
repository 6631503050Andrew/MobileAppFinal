import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useGame } from "../context/GameContext"
import { formatNumber } from "../utils/formatters"
import { playSound } from "../utils/soundManager"

export default function StatsScreen() {
  const { stats, currency, clickValue, passiveIncome, isLoaded, achievements, unlockedAchievements, claimAchievement } =
    useGame()

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

  const handleClaimAchievement = (achievementId) => {
    const result = claimAchievement(achievementId)
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={["#5c258d", "#4a148c"]} style={styles.header}>
        <Text style={styles.headerText}>Stats</Text>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="cash-outline" size={24} color="#feca57" />
          <Text style={styles.statLabel}>Currency:</Text>
          <Text style={styles.statValue}>{formatNumber(currency)}</Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="hand-right-outline" size={24} color="#feca57" />
          <Text style={styles.statLabel}>Click Value:</Text>
          <Text style={styles.statValue}>{formatNumber(clickValue)}</Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="trending-up-outline" size={24} color="#feca57" />
          <Text style={styles.statLabel}>Passive Income:</Text>
          <Text style={styles.statValue}>{formatNumber(passiveIncome)}/s</Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="timer-outline" size={24} color="#feca57" />
          <Text style={styles.statLabel}>Time Played:</Text>
          <Text style={styles.statValue}>{calculateTimePlayed()}</Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="rocket-outline" size={24} color="#feca57" />
          <Text style={styles.statLabel}>Total Clicks:</Text>
          <Text style={styles.statValue}>{formatNumber(stats.totalClicks)}</Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="star-outline" size={24} color="#feca57" />
          <Text style={styles.statLabel}>Total Achievements:</Text>
          <Text style={styles.statValue}>
            {unlockedAchievements.length} / {achievements.length}
          </Text>
        </View>
      </View>

      <LinearGradient colors={["#5c258d", "#4a148c"]} style={styles.achievementsHeader}>
        <Text style={styles.achievementsHeaderText}>Achievements</Text>
      </LinearGradient>

      <View style={styles.achievementsContainer}>
        {achievements.map((achievement) => (
          <TouchableOpacity
            key={achievement.id}
            style={[
              styles.achievementItem,
              unlockedAchievements.includes(achievement.id) ? styles.unlockedAchievement : null,
            ]}
            onPress={() => {
              if (!unlockedAchievements.includes(achievement.id)) {
                handleClaimAchievement(achievement.id)
                playSound("achievement")
              }
            }}
            disabled={unlockedAchievements.includes(achievement.id)}
          >
            <View style={styles.achievementContent}>
              <Ionicons
                name={achievement.icon}
                size={30}
                color={unlockedAchievements.includes(achievement.id) ? "#feca57" : "#ccc"}
              />
              <View style={styles.achievementText}>
                <Text
                  style={[
                    styles.achievementTitle,
                    unlockedAchievements.includes(achievement.id) ? styles.unlockedText : null,
                  ]}
                >
                  {achievement.title}
                </Text>
                <Text
                  style={[
                    styles.achievementDescription,
                    unlockedAchievements.includes(achievement.id) ? styles.unlockedText : null,
                  ]}
                >
                  {achievement.description}
                </Text>
              </View>
            </View>
            {!unlockedAchievements.includes(achievement.id) && <Text style={styles.claimButton}>Claim</Text>}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0b0814",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#0b0814",
  },
  header: {
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  statsContainer: {
    paddingHorizontal: 20,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  statLabel: {
    fontSize: 18,
    color: "#fff",
    marginLeft: 10,
    marginRight: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#feca57",
  },
  achievementsHeader: {
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
  },
  achievementsHeaderText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  achievementsContainer: {
    paddingHorizontal: 10,
  },
  achievementItem: {
    backgroundColor: "#1e1a2b",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  achievementContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  achievementText: {
    marginLeft: 15,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  achievementDescription: {
    fontSize: 14,
    color: "#ccc",
  },
  unlockedAchievement: {
    backgroundColor: "#2c263d",
  },
  unlockedText: {
    color: "#feca57",
  },
  claimButton: {
    backgroundColor: "#6c4294",
    color: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    fontWeight: "bold",
  },
})
