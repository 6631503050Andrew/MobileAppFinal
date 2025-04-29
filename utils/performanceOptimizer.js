/**
 * Performance optimization utilities for Space Clicker
 */

import { InteractionManager } from "react-native"

/**
 * Runs heavy tasks after animations complete to prevent UI jank
 * @param {Function} task - The task to run
 * @param {number} delay - Optional delay in ms
 */
export const runAfterInteractions = (task, delay = 0) => {
  InteractionManager.runAfterInteractions(() => {
    setTimeout(() => {
      task()
    }, delay)
  })
}

/**
 * Debounces a function to prevent excessive calls
 * @param {Function} func - The function to debounce
 * @param {number} wait - Time to wait in ms
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttles a function to limit call frequency
 * @param {Function} func - The function to throttle
 * @param {number} limit - Minimum time between calls in ms
 * @returns {Function} - Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Optimizes list rendering by providing stable item layouts
 * @param {number} itemHeight - Height of each item
 * @returns {Function} - getItemLayout function for FlatList
 */
export const createGetItemLayout = (itemHeight) => {
  return (data, index) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  })
}
