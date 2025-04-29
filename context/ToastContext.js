"use client"

import { createContext, useContext, useState, useCallback } from "react"
import ToastNotification from "../components/ToastNotification"

// Create context
const ToastContext = createContext()

/**
 * Custom hook to use the toast context
 * @returns {Object} Toast context methods
 */
export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

/**
 * Toast provider component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
    duration: 3000,
  })

  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {string} type - Type of toast: 'success', 'error', 'info'
   * @param {number} duration - Duration in ms before auto-hiding
   */
  const showToast = useCallback((message, type = "info", duration = 3000) => {
    setToast({
      visible: true,
      message,
      type,
      duration,
    })
  }, [])

  /**
   * Hide the toast notification
   */
  const hideToast = useCallback(() => {
    setToast((prev) => ({
      ...prev,
      visible: false,
    }))
  }, [])

  // Convenience methods for different toast types
  const showSuccessToast = useCallback(
    (message, duration) => {
      showToast(message, "success", duration)
    },
    [showToast],
  )

  const showErrorToast = useCallback(
    (message, duration) => {
      showToast(message, "error", duration)
    },
    [showToast],
  )

  const showInfoToast = useCallback(
    (message, duration) => {
      showToast(message, "info", duration)
    },
    [showToast],
  )

  return (
    <ToastContext.Provider
      value={{
        showToast,
        hideToast,
        showSuccessToast,
        showErrorToast,
        showInfoToast,
      }}
    >
      {children}
      <ToastNotification
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        onHide={hideToast}
      />
    </ToastContext.Provider>
  )
}
