import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useGame } from "../context/GameContext"
import { formatNumber } from "../utils/formatters"
import { memo } from "react"

// Create a memoized upgrade item component
const UpgradeItem = memo(({ item, currency, currentLevel, onPurchase }) => {
  const cost = item.baseCost * Math.pow(item.costMultiplier, currentLevel)
  const canAfford = currency >= cost

  return (
    <TouchableOpacity
      style={[styles.upgradeItem, !canAfford && styles.upgradeItemDisabled]}
      onPress={() => canAfford && onPurchase(item.id)}
      disabled={!canAfford}
      activeOpacity={0.7}
    >
      <View style={styles.upgradeIcon}>
        <Ionicons name={item.icon} size={24} color="#fff" />
      </View>
      <View style={styles.upgradeInfo}>
        <Text style={styles.upgradeName}>{item.name}</Text>
        <Text style={styles.upgradeDescription}>{item.description}</Text>
        {currentLevel > 0 && <Text style={styles.upgradeLevel}>Level: {currentLevel}</Text>}
      </View>
      <View style={styles.upgradeCost}>
        <Text style={[styles.costText, !canAfford && styles.costTextDisabled]}>{formatNumber(cost)}</Text>
      </View>
    </TouchableOpacity>
  )
})

export default function UpgradesScreen() {
  const { currency, upgrades, upgradesList, purchaseUpgrade, isLoaded } = useGame()

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8c5eff" />
        <Text style={styles.loadingText}>Loading upgrades...</Text>
      </View>
    )
  }

  // Filter available upgrades
  const availableUpgrades = upgradesList.filter((upgrade) => {
    const currentLevel = upgrades[upgrade.id] || 0

    // Check if max level reached
    if (upgrade.maxLevel && currentLevel >= upgrade.maxLevel) {
      return false
    }

    // Check if required upgrade is purchased
    if (upgrade.requiredUpgrade) {
      const requiredLevel = upgrade.requiredLevel || 1
      const actualLevel = upgrades[upgrade.requiredUpgrade] || 0
      if (actualLevel < requiredLevel) {
        return false
      }
    }

    return true
  })

  const handlePurchase = (upgradeId) => {
    console.log("Attempting to purchase:", upgradeId)
    const success = purchaseUpgrade(upgradeId)
    console.log("Purchase success:", success)
  }

  // Replace the renderUpgradeItem function with:
  const renderUpgradeItem = ({ item }) => {
    const currentLevel = upgrades[item.id] || 0
    return <UpgradeItem item={item} currency={currency} currentLevel={currentLevel} onPurchase={handlePurchase} />
  }

  return (
    <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.currencyText}>{formatNumber(currency)} Stardust</Text>
      </View>

      {availableUpgrades.length > 0 ? (
        <FlatList
          data={availableUpgrades}
          renderItem={renderUpgradeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.upgradesList}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={3}
          removeClippedSubviews={true}
          getItemLayout={(data, index) => ({
            length: 84, // Approximate height of each item
            offset: 84 * index,
            index,
          })}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle" size={64} color="#4ade80" />
          <Text style={styles.emptyText}>All upgrades purchased!</Text>
        </View>
      )}
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
  header: {
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 10,
  },
  currencyText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  upgradesList: {
    paddingBottom: 20,
  },
  upgradeItem: {
    flexDirection: "row",
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  upgradeItemDisabled: {
    opacity: 0.6,
  },
  upgradeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  upgradeInfo: {
    flex: 1,
  },
  upgradeName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  upgradeDescription: {
    fontSize: 14,
    color: "#94a3b8",
  },
  upgradeLevel: {
    fontSize: 12,
    color: "#60a5fa",
    marginTop: 4,
  },
  upgradeCost: {
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: "center",
  },
  costText: {
    color: "#fbbf24",
    fontWeight: "bold",
  },
  costTextDisabled: {
    color: "#94a3b8",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#fff",
    marginTop: 16,
  },
})
