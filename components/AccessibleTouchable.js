import { TouchableOpacity, TouchableNativeFeedback, Platform, View, StyleSheet } from "react-native"
import { Haptics } from "expo-haptics"

/**
 * Accessible touchable component that provides consistent behavior across platforms
 * with haptic feedback and proper accessibility attributes
 *
 * @param {Object} props - Component props
 * @param {Function} props.onPress - Function to call when pressed
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {Object} props.style - Style for the touchable
 * @param {string} props.accessibilityLabel - Accessibility label
 * @param {string} props.accessibilityHint - Accessibility hint
 * @param {boolean} props.useHaptic - Whether to use haptic feedback
 * @param {string} props.hapticType - Type of haptic feedback: 'light', 'medium', 'heavy'
 * @param {Object} props.children - Child components
 */
const AccessibleTouchable = ({
  onPress,
  disabled = false,
  style,
  accessibilityLabel,
  accessibilityHint,
  useHaptic = true,
  hapticType = "light",
  children,
  ...rest
}) => {
  const handlePress = () => {
    if (disabled) return

    if (useHaptic) {
      try {
        switch (hapticType) {
          case "medium":
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
            break
          case "heavy":
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
            break
          case "light":
          default:
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            break
        }
      } catch (error) {
        console.error("Haptics error:", error)
      }
    }

    if (onPress) onPress()
  }

  // Use different touchable components based on platform
  if (Platform.OS === "android" && Platform.Version >= 21) {
    return (
      <TouchableNativeFeedback
        onPress={handlePress}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        background={TouchableNativeFeedback.Ripple("#ffffff20", false)}
        {...rest}
      >
        <View style={[styles.touchableContainer, style]}>{children}</View>
      </TouchableNativeFeedback>
    )
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      style={[styles.touchableContainer, style]}
      activeOpacity={0.7}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      {...rest}
    >
      {children}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  touchableContainer: {
    minHeight: 44, // Minimum touch target size for accessibility
    minWidth: 44,
    justifyContent: "center",
    alignItems: "center",
  },
})

export default AccessibleTouchable
