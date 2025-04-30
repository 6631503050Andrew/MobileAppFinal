// Use @expo/metro-config instead of expo/metro-config
const { getDefaultConfig } = require('@expo/metro-config');

// Get the default Expo Metro configuration
const config = getDefaultConfig(__dirname);

// Optionally add any custom configurations here
// For example, if you need SVG support:
// config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
// config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
// config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = config;