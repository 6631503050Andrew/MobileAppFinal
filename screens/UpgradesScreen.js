"use client"

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Modal,
  Image,
  ScrollView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useGame } from "../context/GameContext"
import { formatNumber } from "../utils/formatters"
import { memo, useCallback, useState, useEffect } from "react"
import { getRarityColor } from "../data/hats"
import { getHatImageSource } from "../utils/hatrenderer"

// Create a memoized upgrade item component
const UpgradeItem = memo(({ item, currency, currentLevel, onPurchase }) => {
  const cost = item.baseCost * Math.pow(item.costMultiplier, currentLevel)
  const canAfford = currency >= cost

  // Critical fix: Add purchase cooldown to prevent rapid clicking
  const [isPurchasing, setIsPurchasing] = useState(false)

  const handlePurchase = useCallback(() => {
    if (isPurchasing || !canAfford) return

    // Set purchasing state to prevent multiple rapid clicks
    setIsPurchasing(true)

    // Attempt purchase
    onPurchase(item.id)

    // Reset purchasing state after a short delay
    setTimeout(() => {
      setIsPurchasing(false)
    }, 300)
  }, [isPurchasing, canAfford, item.id, onPurchase])

  return (
    <TouchableOpacity
      style={[
        styles.upgradeItem,
        !canAfford && styles.upgradeItemDisabled,
        isPurchasing && styles.upgradeItemPurchasing,
      ]}
      onPress={handlePurchase}
      disabled={!canAfford || isPurchasing}
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

// Chest component
const ChestItem = memo(({ type, onOpen, disabled, cooldownText, cost }) => {
  const getChestColor = () => {
    switch (type) {
      case "advertisement":
        return "#4ade80" // Green
      case "currency":
        return "#fbbf24" // Yellow
      case "planet":
        return "#60a5fa" // Blue
      default:
        return "#94a3b8" // Gray
    }
  }

  const getChestName = () => {
    switch (type) {
      case "advertisement":
        return "Ad Chest"
      case "currency":
        return "Currency Chest"
      case "planet":
        return "Planet Chest"
      default:
        return "Chest"
    }
  }

  const getChestDescription = () => {
    switch (type) {
      case "advertisement":
        return disabled ? `On cooldown: ${cooldownText}` : "Watch an ad to open"
      case "currency":
        return `Cost: ${formatNumber(cost)} stardust`
      case "planet":
        return disabled ? "Unlock a new planet first" : "Open to get a planet hat"
      default:
        return "Mystery chest"
    }
  }

  return (
    <TouchableOpacity
      style={[styles.chestItem, { borderColor: getChestColor() }, disabled && styles.chestItemDisabled]}
      onPress={onOpen}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[styles.chestIcon, { backgroundColor: getChestColor() }]}>
        <Ionicons name="cube" size={32} color="#fff" />
      </View>
      <View style={styles.chestInfo}>
        <Text style={styles.chestName}>{getChestName()}</Text>
        <Text style={styles.chestDescription}>{getChestDescription()}</Text>
      </View>
    </TouchableOpacity>
  )
})

// Hat item component for the collection
const HatItem = memo(({ hat, isUnlocked, isEquipped, onToggleEquip }) => {
  const hatData = hat
  const rarityColor = getRarityColor(hatData.rarity)
  const [imageError, setImageError] = useState(false)

  return (
    <TouchableOpacity
      style={[
        styles.hatItem,
        { borderColor: rarityColor },
        isEquipped && styles.hatItemEquipped,
        !isUnlocked && styles.hatItemLocked,
      ]}
      onPress={onToggleEquip}
      disabled={!isUnlocked}
      activeOpacity={0.7}
    >
      <View style={styles.hatImageContainer}>
        {isUnlocked ? (
          <Image
            source={getHatImageSource(hat.id)}
            style={styles.hatItemImage}
            resizeMode="contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <Ionicons name="lock-closed" size={24} color="#64748b" />
        )}
        {imageError && isUnlocked && (
          <View style={styles.imageErrorIndicator}>
            <Text style={styles.imageErrorText}>!</Text>
          </View>
        )}
      </View>
      <Text style={[styles.hatName, !isUnlocked && styles.hatNameLocked]}>{hatData.name}</Text>
      <Text style={[styles.hatRarity, { color: rarityColor }]}>
        {hatData.rarity.charAt(0).toUpperCase() + hatData.rarity.slice(1)}
      </Text>
      {isEquipped && (
        <View style={styles.equippedBadge}>
          <Text style={styles.equippedText}>Equipped</Text>
        </View>
      )}
    </TouchableOpacity>
  )
})

export default function UpgradesScreen() {
  const {
    currency,
    upgrades,
    upgradesList,
    purchaseUpgrade,
    isLoaded,
    chests,
    openAdChest,
    openCurrencyChest,
    openPlanetChest,
    unlockedHats,
    equippedHat,
    toggleEquipHat,
    hats,
  } = useGame()

  // State for UI
  const [activeTab, setActiveTab] = useState("upgrades") // "upgrades", "chests", "hats"
  const [chestModalVisible, setChestModalVisible] = useState(false)
  const [chestResult, setChestResult] = useState(null)
  const [adCooldownText, setAdCooldownText] = useState("")

  // Calculate ad chest cooldown text
  useEffect(() => {
    if (!chests.advertisement.available && chests.advertisement.lastOpened) {
      const updateCooldownText = () => {
        const now = new Date()
        const lastOpened = new Date(chests.advertisement.lastOpened)
        const cooldownMs = chests.advertisement.cooldownMinutes * 60 * 1000
        const cooldownEnds = new Date(lastOpened.getTime() + cooldownMs)

        if (now >= cooldownEnds) {
          setAdCooldownText("Available")
          return
        }

        const remainingMs = cooldownEnds - now
        const remainingMinutes = Math.floor(remainingMs / 60000)
        const remainingSeconds = Math.floor((remainingMs % 60000) / 1000)

        setAdCooldownText(`${remainingMinutes}m ${remainingSeconds}s`)
      }

      updateCooldownText()
      const interval = setInterval(updateCooldownText, 1000)

      return () => clearInterval(interval)
    } else {
      setAdCooldownText("Available")
    }
  }, [chests.advertisement])

  // Handle chest opening
  const handleOpenChest = useCallback(
    (chestType) => {
      console.log(`Attempting to open ${chestType} chest`)
      let result

      switch (chestType) {
        case "advertisement":
          result = openAdChest()
          break
        case "currency":
          result = openCurrencyChest()
          break
        case "planet":
          result = openPlanetChest()
          break
        default:
          return
      }

      console.log("Chest opening result:", result)
      if (result.success) {
        setChestResult(result)
        setChestModalVisible(true)
      } else {
        // Could show an error message here
        console.log(result.message)
      }
    },
    [openAdChest, openCurrencyChest, openPlanetChest],
  )

  // Handle hat equipping
  const handleToggleEquipHat = useCallback(
    (hatId) => {
      console.log("Toggling hat from UpgradesScreen:", hatId)
      toggleEquipHat(hatId)
    },
    [toggleEquipHat],
  )

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

  // Render hat items for collection
  const renderHatItem = ({ item }) => {
    const hatId = item.id
    const isUnlocked = unlockedHats[hatId]?.unlocked || false
    const isEquipped = equippedHat === hatId

    return (
      <HatItem
        hat={item}
        isUnlocked={isUnlocked}
        isEquipped={isEquipped}
        onToggleEquip={() => handleToggleEquipHat(hatId)}
      />
    )
  }

  // Convert hats object to array for FlatList
  const hatsArray = Object.values(hats)

  return (
    <ImageBackground source={require("../assets/space-background.png")} style={styles.container} resizeMode="cover">
      <View style={styles.header}>
        <Text style={styles.currencyText}>{formatNumber(currency)} Stardust</Text>
      </View>

      {/* Tab navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "upgrades" && styles.activeTabButton]}
          onPress={() => setActiveTab("upgrades")}
        >
          <Text style={[styles.tabText, activeTab === "upgrades" && styles.activeTabText]}>Upgrades</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "chests" && styles.activeTabButton]}
          onPress={() => setActiveTab("chests")}
        >
          <Text style={[styles.tabText, activeTab === "chests" && styles.activeTabText]}>Chests</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "hats" && styles.activeTabButton]}
          onPress={() => setActiveTab("hats")}
        >
          <Text style={[styles.tabText, activeTab === "hats" && styles.activeTabText]}>Hats</Text>
        </TouchableOpacity>
      </View>

      {/* Upgrades Tab */}
      {activeTab === "upgrades" &&
        (availableUpgrades.length > 0 ? (
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
        ))}

      {/* Chests Tab */}
      {activeTab === "chests" && (
        <ScrollView contentContainerStyle={styles.chestsContainer}>
          <Text style={styles.sectionTitle}>Available Chests</Text>

          {/* Advertisement Chest */}
          <ChestItem
            type="advertisement"
            onOpen={() => handleOpenChest("advertisement")}
            disabled={!chests.advertisement.available}
            cooldownText={adCooldownText}
          />

          {/* Currency Chest */}
          <ChestItem
            type="currency"
            onOpen={() => handleOpenChest("currency")}
            disabled={currency < chests.currency.nextCost}
            cost={chests.currency.nextCost}
          />

          {/* Planet Chest */}
          <ChestItem type="planet" onOpen={() => handleOpenChest("planet")} disabled={chests.planet.unopened <= 0} />

          <Text style={styles.chestInfoText}>Unlock chests to collect hats for your planets!</Text>
        </ScrollView>
      )}

      {/* Hats Tab */}
      {activeTab === "hats" &&
        (hatsArray.length > 0 ? (
          <FlatList
            data={hatsArray}
            renderItem={renderHatItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.hatsGrid}
            numColumns={2}
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            windowSize={3}
            removeClippedSubviews={true}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="sad" size={64} color="#94a3b8" />
            <Text style={styles.emptyText}>No hats available yet!</Text>
          </View>
        ))}

      {/* Chest Result Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={chestModalVisible}
        onRequestClose={() => setChestModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chest Opened!</Text>

            {chestResult && chestResult.hat && hats[chestResult.hat] && (
              <View style={styles.hatResultContainer}>
                <View
                  style={[
                    styles.hatResultImageContainer,
                    { borderColor: getRarityColor(hats[chestResult.hat].rarity) },
                  ]}
                >
                  <Image
                    source={getHatImageSource(chestResult.hat)}
                    style={styles.hatResultImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.hatResultName}>{hats[chestResult.hat].name}</Text>
                <Text style={[styles.hatResultRarity, { color: getRarityColor(hats[chestResult.hat].rarity) }]}>
                  {hats[chestResult.hat].rarity.charAt(0).toUpperCase() + hats[chestResult.hat].rarity.slice(1)}
                </Text>
              </View>
            )}

            <Text style={styles.modalMessage}>{chestResult?.message || "You got a new hat!"}</Text>

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setChestModalVisible(false)}>
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>

              {chestResult && chestResult.hat && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.equipButton]}
                  onPress={() => {
                    console.log("Equipping hat from modal:", chestResult.hat)
                    const result = toggleEquipHat(chestResult.hat)
                    console.log("Equip result:", result)
                    setChestModalVisible(false)
                  }}
                >
                  <Text style={styles.modalButtonText}>Equip Now</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
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
  header: {
    alignItems: "center",
    marginBottom: 10,
    paddingTop: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
    padding: 10,
  },
  currencyText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    borderRadius: 12,
    overflow: "hidden",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTabButton: {
    backgroundColor: "rgba(30, 41, 59, 0.8)",
  },
  tabText: {
    color: "#94a3b8",
    fontWeight: "bold",
  },
  activeTabText: {
    color: "#fff",
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
  upgradeItemPurchasing: {
    opacity: 0.8,
    backgroundColor: "rgba(40, 51, 69, 0.8)",
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
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  // Chest styles
  chestsContainer: {
    padding: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  chestItem: {
    flexDirection: "row",
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 2,
  },
  chestItemDisabled: {
    opacity: 0.6,
  },
  chestIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  chestInfo: {
    flex: 1,
  },
  chestName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  chestDescription: {
    fontSize: 14,
    color: "#94a3b8",
  },
  chestInfoText: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 16,
    fontStyle: "italic",
  },
  // Hat collection styles
  hatsGrid: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  hatItem: {
    flex: 1,
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    borderRadius: 12,
    padding: 12,
    margin: 8,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#334155",
    position: "relative",
  },
  hatItemEquipped: {
    backgroundColor: "rgba(40, 51, 69, 0.9)",
    borderColor: "#60a5fa",
  },
  hatItemLocked: {
    opacity: 0.5,
  },
  hatImageContainer: {
    width: 80,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    position: "relative",
  },
  hatItemImage: {
    width: 80,
    height: 40,
    resizeMode: "contain",
  },
  imageErrorIndicator: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#ef4444",
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
  },
  imageErrorText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  hatName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 4,
  },
  hatNameLocked: {
    color: "#94a3b8",
  },
  hatRarity: {
    fontSize: 12,
    textAlign: "center",
  },
  equippedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#60a5fa",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  equippedText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#334155",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  hatResultContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  hatResultImageContainer: {
    width: 120,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderRadius: 12,
    padding: 8,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
  },
  hatResultImage: {
    width: 100,
    height: 50,
    resizeMode: "contain",
  },
  hatResultName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  hatResultRarity: {
    fontSize: 14,
    fontWeight: "bold",
  },
  modalMessage: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  modalButton: {
    backgroundColor: "#334155",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  equipButton: {
    backgroundColor: "#3b82f6",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
})
