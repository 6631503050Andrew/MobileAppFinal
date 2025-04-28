import "react-native-gesture-handler"
import { registerRootComponent } from "expo"
import { LogBox } from "react-native"

// Ignore specific warnings - updated for SDK 52
LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
  "VirtualizedLists should never be nested",
  // Add any new SDK 52 specific warnings here if they appear
])

import App from "./App"

// Enable debugging
if (__DEV__) {
  console.log("Running in development mode with Expo SDK 52.0.0")
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App)
