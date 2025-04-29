// Define all the hats that can be collected from chests
export const hats = {
    // Advertisement chest hats
    AHat1: { id: "AHat1", name: "Heart", rarity: "common", offset: { x: 0, y: 50 } },
    AHat2: { id: "AHat2", name: "Arrow", rarity: "common", offset: { x: 0, y: 50 } },
    AHat3: { id: "AHat3", name: "Poop", rarity: "uncommon", offset: { x: 0, y: 50 } },
    AHat4: { id: "AHat4", name: "Thinking", rarity: "uncommon", offset: { x: 0, y: 50 } },
    AHat5: { id: "AHat5", name: "Smiley", rarity: "rare", offset: { x: 0, y: 50 } },
    AHat6: { id: "AHat6", name: "Egg Plant", rarity: "rare", offset: { x: 0, y: 50 } },
    AHat7: { id: "AHat7", name: "Lightning", rarity: "epic", offset: { x: 0, y: 50 } },
    AHat8: { id: "AHat8", name: "Censored", rarity: "epic", offset: { x: 0, y: 50 } },
    AHat9: { id: "AHat9", name: "Dancing People", rarity: "legendary", offset: { x: 0, y: 50 } },
    AHat10: { id: "AHat10", name: "BOOM", rarity: "legendary", offset: { x: 0, y: 50 } },
  
    // Currency chest hats
    CHat1: {
      id: "CHat1",
      name: "Gray Fedora",
      rarity: "common",
      offset: { x: 0, y: 50 }, // Adjusted y position to be higher above the planet
    },

    CHat2: {
        id: "CHat2",
        name: "Devil Horns",
        rarity: "common",
        offset: { x: 0, y: 50 },
    },
    
    CHat3: { id: "CHat3", name: "Duck", rarity: "uncommon", offset: { x: 0, y: 50 } },
    CHat4: { id: "CHat4", name: "Rain", rarity: "uncommon", offset: { x: 0, y: 50 } },
    CHat5: { id: "CHat5", name: "Patrick", rarity: "rare", offset: { x: 0, y: 50 } },
    CHat6: { id: "CHat6", name: "Viking", rarity: "rare", offset: { x: 0, y: 50 } },
    CHat7: { id: "CHat7", name: "Chef", rarity: "epic", offset: { x: 0, y: 50 } },
    CHat8: { id: "CHat8", name: "Orange", rarity: "epic", offset: { x: 0, y: 50 } },
    CHat9: { id: "CHat9", name: "Flower", rarity: "legendary", offset: { x: 0, y: 50 } },
    CHat10: { id: "CHat10", name: "Halo", rarity: "legendary", offset: { x: 0, y: 50 } },
  
    // Planet chest hats
    mercuryHat: { id: "mercuryHat", name: "Mercury Hat", rarity: "rare", offset: { x: 0, y: 50 } },
    venusHat: { id: "venusHat", name: "Venus Hat", rarity: "rare", offset: { x: 0, y: 50 } },
    earthHat: { id: "earthHat", name: "Earth Hat", rarity: "rare", offset: { x: 0, y: 50 } },
    marsHat: { id: "marsHat", name: "Mars Hat", rarity: "epic", offset: { x: 0, y: 50 } },
    jupiterHat: { id: "jupiterHat", name: "Jupiter Hat", rarity: "epic", offset: { x: 0, y: 50 } },
    saturnHat: { id: "saturnHat", name: "Saturn Hat", rarity: "epic", offset: { x: 0, y: 50 } },
    uranusHat: { id: "uranusHat", name: "Uranus Hat", rarity: "legendary", offset: { x: 0, y: 50 } },
    neptuneHat: { id: "neptuneHat", name: "Neptune Hat", rarity: "legendary", offset: { x: 0, y: 50 } },
    plutoHat: { id: "plutoHat", name: "Pluto Hat", rarity: "legendary", offset: { x: 0, y: 50 } },
    sunHat: { id: "sunHat", name: "Sun Hat", rarity: "mythic", offset: { x: 0, y: 50 } },
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
  