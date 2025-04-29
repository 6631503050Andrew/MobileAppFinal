"use client"

import { useEffect, useRef } from "react"
import { Text, StyleSheet, Animated, Easing } from "react-native"
import { Ionicons } from "@expo/vector-icons"

/**
 * Toast notification component for providing user feedback
 *
 * @param {Object} props - Component props
 * @param {string} props.message - Message to display
 * @param {string} props.type - Type of toast: 'success', 'error', 'info'
 * @param {boolean} props.visible - Whether the toast is visible
 * @param {Function} props.onHide - Callback when toast hides
 * @param {number} props.duration - Duration in ms before auto-hiding
 */
const ToastNotification = ({ message, type = "info", visible = false, onHide, duration = 3000 }) => {
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(20)).current

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]).start()

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [visible])

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 20,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide()
    })
  }

  // Get icon and color based on type
  const getToastStyles = () => {
    switch (type) {
      case "success":
        return {
          icon: "checkmark-circle",
          color: "#4ade80",
          backgroundColor: "rgba(22, 101, 52, 0.8)",
        }
      case "error":
        return {
          icon: "alert-circle",
          color: "#f87171",
          backgroundColor: "rgba(153, 27, 27, 0.8)",
        }
      case "info":
      default:
        return {
          icon: "information-circle",
          color: "#60a5fa",
          backgroundColor: "rgba(30, 58, 138, 0.8)",
        }
    }
  }

  const toastStyles = getToastStyles()

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
          backgroundColor: toastStyles.backgroundColor,
        },
      ]}
    >
      <Ionicons name={toastStyles.icon} size={24} color={toastStyles.color} />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 60,
    left: 20,
    right: 20,
    backgroundColor: "rgba(30, 41, 59, 0.9)",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  message: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
})

export default ToastNotification
