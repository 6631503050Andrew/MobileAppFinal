/**
 * Pre-Build Checklist for Space Clicker
 *
 * This file serves as documentation for the final checks before building.
 * It's not meant to be executed directly.
 */

const buildChecklist = {
    performance: [
      "Verify all animations are properly cleaned up on unmount",
      "Check for memory leaks using profiling tools",
      "Optimize image assets for size and loading speed",
      "Ensure sound resources are properly managed",
    ],
  
    ui: [
      "Verify UI renders correctly on small screens",
      "Verify UI renders correctly on large screens",
      "Check dark mode compatibility",
      "Ensure consistent spacing and alignment across all screens",
      "Verify all text is readable and properly contrasted",
    ],
  
    functionality: [
      "Test all game mechanics (clicking, upgrades, achievements)",
      "Verify save/load functionality works correctly",
      "Test hat equipping and rendering",
      "Verify chest opening mechanics",
      "Test settings changes persist between app launches",
    ],
  
    crossPlatform: [
      "Test on iOS devices",
      "Test on Android devices",
      "Verify platform-specific code works correctly",
      "Check for any platform-specific visual issues",
    ],
  
    appConfig: [
      "Update version number in app.json",
      "Verify app icon and splash screen",
      "Check all required permissions",
      "Ensure proper app bundle ID",
    ],
  
    finalChecks: [
      "Run a full playthrough of the game",
      "Verify analytics tracking (if applicable)",
      "Check error reporting system",
      "Test offline functionality",
      "Verify deep linking (if applicable)",
    ],
  }
  
  // Export for documentation purposes
  export default buildChecklist
  