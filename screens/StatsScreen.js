"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Animated } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useGame } from "../context/GameContext"
import { formatNumber } from "../utils/formatters"
import { playSound } from "../utils/soundManager"

// Achievement card component
const AchievementCard = ({ achievement, isUnlocked, isClaimed, onClaim, progress }) => {
  const [scaleAnim] = useState(new Animated.Value(1))

  // Animation when achievement is ready to claim
  useEffect(() => {
    if (isUnlocked && !isClaimed) {
      const pulseAnimation = Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.03,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])

      Animated.loop(pulseAnimation).start()

      return () => {
        scaleAnim.stopAnimation()
      }
    }
  }, [isUnlocked, isClaimed])

  // Determine the status color
  const getStatusColor = () => {
    if (isClaimed) return "#4ade80" // Green for claimed
    if (isUnlocked) return "#fbbf24" // Yellow for unlocked but not claimed
    return "#64748b" // Gray for locked
  }

  // Handle claim button press
  const handleClaim = () => {
    if (isUnlocked && !isClaimed) {
      playSound("achievement")
      onClaim(achievement.id)
    } else if (!isUnlocked) {
      // Play a different sound for locked achievements
      playSound("click")
    }
  }

  return (
    <Animated.View
      style={[
        styles.achievementCard,
        {
          borderColor: getStatusColor(),
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.achievementHeader}>
        <View style={[styles.achievementIcon, { backgroundColor: getStatusColor() }]}>
          <Ionicons name={achievement.icon} size={24} color="#fff" />
        </View>
        <View style={styles.achievementTitleContainer}>
          <Text style={styles.achievementTitle}>{achievement.name}</Text>
          <Text style={styles.achievementReward}>Reward: {formatNumber(achievement.reward)} stardust</Text>
        </View>
        {isClaimed && (
          <View style={styles.claimedBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
          </View>
        )}
      </View>

      <Text style={styles.achievementDescription}>{achievement.description}</Text>

      {progress !== undefined && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(100, progress * 100)}%`,
                  backgroundColor: getStatusColor(),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{Math.floor(progress * 100)}%</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.claimButton, isUnlocked && !isClaimed ? styles.claimButtonActive : styles.claimButtonInactive]}
        onPress={handleClaim}
        disabled={!isUnlocked || isClaimed}
      >
        <Text style={styles.claimButtonText}>{isClaimed ? "Claimed" : isUnlocked ? "Claim Reward" : "Locked"}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

// Filter tabs for achievements
const FilterTabs = ({ activeFilter, setActiveFilter }) => {
  return (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterTab, activeFilter === "all" && styles.activeFilterTab]}
        onPress={() => setActiveFilter("all")}
      >
        <Text style={[styles.filterText, activeFilter === "all" && styles.activeFilterText]}>All</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterTab, activeFilter === "unlocked" && styles.activeFilterTab]}
        onPress={() => setActiveFilter("unlocked")}
      >
        <Text style={[styles.filterText, activeFilter === "unlocked" && styles.activeFilterText]}>Ready to Claim</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterTab, activeFilter === "claimed" && styles.activeFilterTab]}
        onPress={() => setActiveFilter("claimed")}
      >
        <Text style={[styles.filterText, activeFilter === "claimed" && styles.activeFilterText]}>Claimed</Text>
      </TouchableOpacity>
    </View>
  )
}

export default function StatsScreen() {
  const {
    stats,
    currency,
    clickValue,
    passiveIncome,
    isLoaded,
    achievements,
    unlockedAchievements,
    claimAchievement,
    currentPlanet,
  } = useGame()

  const [activeFilter, setActiveFilter] = useState("all")
  const [achievementProgress, setAchievementProgress] = useState({})

  // Calculate achievement progress
  useEffect(() => {
    if (isLoaded && achievements) {
      const progress = {}

      achievements.forEach((achievement) => {
        // Calculate progress based on achievement type
        if (achievement.id === "first_click") {
          progress[achievement.id] = Math.min(1, stats.totalClicks / 1)
        } else if (achievement.id === "click_master") {
          progress[achievement.id] = Math.min(1, stats.totalClicks / 100)
        } else if (achievement.id === "click_champion") {
          progress[achievement.id] = Math.min(1, stats.totalClicks / 1000)
        } else if (achievement.id === "first_upgrade") {
          progress[achievement.id] = stats.totalSpent > 0 ? 1 : 0
        } else if (achievement.id === "big_spender") {
          progress[achievement.id] = Math.min(1, stats.totalSpent / 1000)
        } else if (achievement.id === "explorer") {
          progress[achievement.id] = currentPlanet > 0 ? 1 : 0
        } else if (achievement.id === "millionaire") {
          progress[achievement.id] = Math.min(1, stats.totalCurrency / 1000000)
        } else if (achievement.id === "passive_income") {
          progress[achievement.id] = Math.min(1, passiveIncome / 100)
        }
      })

      setAchievementProgress(progress)
    }
  }, [isLoaded, stats, currentPlanet, passiveIncome, achievements])

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
    claimAchievement(achievementId)
  }

  // Filter achievements based on active filter
  const filteredAchievements = achievements.filter((achievement) => {
    const achievementData = unlockedAchievements[achievement.id]

    if (activeFilter === "all") return true
    if (activeFilter === "unlocked") return achievementData && !achievementData.claimed
    if (activeFilter === "claimed") return achievementData && achievementData.claimed

    return true
  })

  // Count achievements by status
  const countUnlocked = achievements.filter(
    (a) => unlockedAchievements[a.id] && !unlockedAchievements[a.id].claimed,
  ).length

  const countClaimed = achievements.filter(
    (a) => unlockedAchievements[a.id] && unlockedAchievements[a.id].claimed,
  ).length

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#5c258d", "#4a148c"]} style={styles.header}>
        <Text style={styles.headerText}>Stats & Achievements</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Game Stats</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="cash-outline" size={24} color="#feca57" />
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>Stardust</Text>
                <Text style={styles.statValue}>{formatNumber(currency)}</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="hand-right-outline" size={24} color="#feca57" />
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>Click Value</Text>
                <Text style={styles.statValue}>{formatNumber(clickValue)}</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="trending-up-outline" size={24} color="#feca57" />
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>Passive Income</Text>
                <Text style={styles.statValue}>{formatNumber(passiveIncome)}/s</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="timer-outline" size={24} color="#feca57" />
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>Time Played</Text>
                <Text style={styles.statValue}>{calculateTimePlayed()}</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="rocket-outline" size={24} color="#feca57" />
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>Total Clicks</Text>
                <Text style={styles.statValue}>{formatNumber(stats.totalClicks)}</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="star-outline" size={24} color="#feca57" />
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>Achievements</Text>
                <Text style={styles.statValue}>
                  {countClaimed} / {achievements.length}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievements</Text>

          <View style={styles.achievementsSummary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{achievements.length}</Text>
              <Text style={styles.summaryLabel}>Total</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{countUnlocked}</Text>
              <Text style={styles.summaryLabel}>Ready to Claim</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{countClaimed}</Text>
              <Text style={styles.summaryLabel}>Claimed</Text>
            </View>
          </View>

          <FilterTabs activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

          {filteredAchievements.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="trophy-outline" size={64} color="#64748b" />
              <Text style={styles.emptyStateText}>No achievements in this category</Text>
            </View>
          ) : (
            filteredAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                isUnlocked={unlockedAchievements[achievement.id] !== undefined}
                isClaimed={unlockedAchievements[achievement.id]?.claimed || false}
                onClaim={handleClaimAchievement}
                progress={achievementProgress[achievement.id]}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0814",
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
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
  header: {
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  statsCard: {
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#334155",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 16,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    padding: 12,
    borderRadius: 12,
  },
  statTextContainer: {
    marginLeft: 12,
  },
  statLabel: {
    fontSize: 14,
    color: "#94a3b8",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#feca57",
  },
  achievementsSection: {
    marginBottom: 24,
  },
  achievementsSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 12,
    overflow: "hidden",
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeFilterTab: {
    backgroundColor: "rgba(92, 37, 141, 0.8)",
  },
  filterText: {
    color: "#94a3b8",
    fontWeight: "bold",
    fontSize: 13,
  },
  activeFilterText: {
    color: "#fff",
  },
  achievementCard: {
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
  },
  achievementHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  achievementTitleContainer: {
    flex: 1,
    justifyContent: "center",
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  achievementReward: {
    fontSize: 12,
    color: "#fbbf24",
  },
  claimedBadge: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  achievementDescription: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 4,
    overflow: "hidden",
    marginRight: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#94a3b8",
    width: 40,
    textAlign: "right",
  },
  claimButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  claimButtonActive: {
    backgroundColor: "#8c5eff",
  },
  claimButtonInactive: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
  },
  claimButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyStateText: {
    color: "#64748b",
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
})
