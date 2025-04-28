// Define all the hats that can be collected from chests
export const hats = {
    // Advertisement chest hats
    AHat1: { id: "AHat1", name: "Ad Hat 1", rarity: "common", offset: { x: 0, y: -110 } },
    AHat2: { id: "AHat2", name: "Ad Hat 2", rarity: "common", offset: { x: 0, y: -110 } },
    AHat3: { id: "AHat3", name: "Ad Hat 3", rarity: "uncommon", offset: { x: 0, y: -110 } },
    AHat4: { id: "AHat4", name: "Ad Hat 4", rarity: "uncommon", offset: { x: 0, y: -110 } },
    AHat5: { id: "AHat5", name: "Ad Hat 5", rarity: "rare", offset: { x: 0, y: -110 } },
    AHat6: { id: "AHat6", name: "Ad Hat 6", rarity: "rare", offset: { x: 0, y: -110 } },
    AHat7: { id: "AHat7", name: "Ad Hat 7", rarity: "epic", offset: { x: 0, y: -110 } },
    AHat8: { id: "AHat8", name: "Ad Hat 8", rarity: "epic", offset: { x: 0, y: -110 } },
    AHat9: { id: "AHat9", name: "Ad Hat 9", rarity: "legendary", offset: { x: 0, y: -110 } },
    AHat10: { id: "AHat10", name: "Ad Hat 10", rarity: "legendary", offset: { x: 0, y: -110 } },
  
    // Currency chest hats
    CHat1: {
      id: "CHat1",
      name: "Gray Fedora",
      rarity: "common",
      offset: { x: 0, y: -120 }, // Adjusted y position to be higher above the planet
    },

    CHat2: {
        id: "CHat2",
        name: "Devil Horns",
        rarity: "common",
        offset: { x: 0, y: -120 },
    },
    
    CHat3: { id: "CHat3", name: "Currency Hat 3", rarity: "uncommon", offset: { x: 0, y: -110 } },
    CHat4: { id: "CHat4", name: "Currency Hat 4", rarity: "uncommon", offset: { x: 0, y: -110 } },
    CHat5: { id: "CHat5", name: "Currency Hat 5", rarity: "rare", offset: { x: 0, y: -110 } },
    CHat6: { id: "CHat6", name: "Currency Hat 6", rarity: "rare", offset: { x: 0, y: -110 } },
    CHat7: { id: "CHat7", name: "Currency Hat 7", rarity: "epic", offset: { x: 0, y: -110 } },
    CHat8: { id: "CHat8", name: "Currency Hat 8", rarity: "epic", offset: { x: 0, y: -110 } },
    CHat9: { id: "CHat9", name: "Currency Hat 9", rarity: "legendary", offset: { x: 0, y: -110 } },
    CHat10: { id: "CHat10", name: "Currency Hat 10", rarity: "legendary", offset: { x: 0, y: -110 } },
  
    // Planet chest hats
    mercuryHat: { id: "mercuryHat", name: "Mercury Hat", rarity: "rare", offset: { x: 0, y: -110 } },
    venusHat: { id: "venusHat", name: "Venus Hat", rarity: "rare", offset: { x: 0, y: -110 } },
    earthHat: { id: "earthHat", name: "Earth Hat", rarity: "rare", offset: { x: 0, y: -110 } },
    marsHat: { id: "marsHat", name: "Mars Hat", rarity: "epic", offset: { x: 0, y: -110 } },
    jupiterHat: { id: "jupiterHat", name: "Jupiter Hat", rarity: "epic", offset: { x: 0, y: -110 } },
    saturnHat: { id: "saturnHat", name: "Saturn Hat", rarity: "epic", offset: { x: 0, y: -110 } },
    uranusHat: { id: "uranusHat", name: "Uranus Hat", rarity: "legendary", offset: { x: 0, y: -110 } },
    neptuneHat: { id: "neptuneHat", name: "Neptune Hat", rarity: "legendary", offset: { x: 0, y: -110 } },
    plutoHat: { id: "plutoHat", name: "Pluto Hat", rarity: "legendary", offset: { x: 0, y: -110 } },
    sunHat: { id: "sunHat", name: "Sun Hat", rarity: "mythic", offset: { x: 0, y: -110 } },
  }
  
  // Define chest types and their possible rewards
  export const chestTypes = {
    advertisement: {
      id: "advertisement",
      name: "Advertisement Chest",
      description: "Watch an ad to open this chest and get a random hat!",
      color: "#4ade80", // Green
      possibleHats: ["AHat1", "AHat2", "AHat3", "AHat4", "AHat5", "AHat6", "AHat7", "AHat8", "AHat9", "AHat10"],
      rarityChances: {
        common: 0.4,
        uncommon: 0.3,
        rare: 0.15,
        epic: 0.1,
        legendary: 0.05,
      },
    },
    currency: {
      id: "currency",
      name: "Currency Chest",
      description: "Spend stardust to open this chest and get a random hat!",
      color: "#fbbf24", // Yellow
      possibleHats: ["CHat1", "CHat2", "CHat3", "CHat4", "CHat5", "CHat6", "CHat7", "CHat8", "CHat9", "CHat10"],
      rarityChances: {
        common: 0.35,
        uncommon: 0.3,
        rare: 0.2,
        epic: 0.1,
        legendary: 0.05,
      },
      baseCost: 500,
      costMultiplier: 1.5,
    },
    planet: {
      id: "planet",
      name: "Planet Chest",
      description: "Unlock a new planet to receive this chest with a special hat!",
      color: "#60a5fa", // Blue
      possibleHats: [
        "mercuryHat",
        "venusHat",
        "earthHat",
        "marsHat",
        "jupiterHat",
        "saturnHat",
        "uranusHat",
        "neptuneHat",
        "plutoHat",
        "sunHat",
      ],
    },
  }
  
  // Helper functions for the chest system
  export const getRandomHat = (chestType) => {
    const chest = chestTypes[chestType]
    if (!chest) return null
  
    // For planet chests, the hat is determined by the planet
    if (chestType === "planet") {
      return null // This will be handled separately based on the planet unlocked
    }
  
    // For other chests, select based on rarity first, then pick a hat of that rarity
    const rarityRoll = Math.random()
    let cumulativeChance = 0
    let selectedRarity = "common"
  
    for (const [rarity, chance] of Object.entries(chest.rarityChances)) {
      cumulativeChance += chance
      if (rarityRoll <= cumulativeChance) {
        selectedRarity = rarity
        break
      }
    }
  
    // Filter hats by the selected rarity
    const hatsOfRarity = chest.possibleHats.filter((hatId) => hats[hatId].rarity === selectedRarity)
  
    if (hatsOfRarity.length === 0) {
      // Fallback to any hat from the chest if no hats of the selected rarity
      const randomIndex = Math.floor(Math.random() * chest.possibleHats.length)
      return chest.possibleHats[randomIndex]
    }
  
    // Pick a random hat of the selected rarity
    const randomIndex = Math.floor(Math.random() * hatsOfRarity.length)
    return hatsOfRarity[randomIndex]
  }
  
  // Calculate the cost of the next currency chest
  export const calculateCurrencyChestCost = (purchaseCount) => {
    const { baseCost, costMultiplier } = chestTypes.currency
    return Math.floor(baseCost * Math.pow(costMultiplier, purchaseCount))
  }
  
  // Get the planet hat for a specific planet
  export const getPlanetHat = (planetId) => {
    switch (planetId) {
      case "mercury":
        return "mercuryHat"
      case "venus":
        return "venusHat"
      case "earth":
        return "earthHat"
      case "mars":
        return "marsHat"
      case "jupiter":
        return "jupiterHat"
      case "saturn":
        return "saturnHat"
      case "uranus":
        return "uranusHat"
      case "neptune":
        return "neptuneHat"
      case "pluto":
        return "plutoHat"
      default:
        return null
    }
  }
  
  // Get rarity color
  export const getRarityColor = (rarity) => {
    switch (rarity) {
      case "common":
        return "#94a3b8" // Gray
      case "uncommon":
        return "#4ade80" // Green
      case "rare":
        return "#60a5fa" // Blue
      case "epic":
        return "#a855f7" // Purple
      case "legendary":
        return "#f59e0b" // Orange
      case "mythic":
        return "#ef4444" // Red
      default:
        return "#94a3b8"
    }
  }
  