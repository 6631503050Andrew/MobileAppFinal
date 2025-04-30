export default {
  expo: {
    name: "Space Clicker",
    slug: "space-clicker",
    version: "2.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#000000",
    },
    updates: {
      fallbackToCacheTimeout: 0,
      url: "https://u.expo.dev/9478ba27-d400-4939-b354-b9d90c0070fc",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.spaceclicker.app",
      buildNumber: "2",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#000000",
      },
      package: "com.spaceclicker.app",
      permissions: ["VIBRATE", "INTERNET"],
      versionCode: 2,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      [
        "expo-av",
        {
          microphonePermission: false,
        },
      ],
    ],
    extra: {
      eas: {
        projectId: "9478ba27-d400-4939-b354-b9d90c0070fc",
      },
    },
    runtimeVersion: {
      policy: "sdkVersion",
    },
    owner: "andrewdicesare2004",
  },
}
