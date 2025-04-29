/**
 * Centralized error handling utilities
 */

/**
 * Log an error with consistent formatting
 * @param {string} context - Where the error occurred
 * @param {Error|string} error - The error object or message
 * @param {Object} additionalInfo - Any additional information
 */
export const logError = (context, error, additionalInfo = {}) => {
    console.error(
      `[${context}] Error:`,
      error instanceof Error ? error.message : error,
      error instanceof Error ? error.stack : "",
      additionalInfo,
    )
  }
  
  /**
   * Safely execute a function and handle any errors
   * @param {Function} fn - Function to execute
   * @param {string} context - Context for error logging
   * @param {Function} onError - Optional error handler
   * @returns {any} - Result of the function or null if error
   */
  export const tryCatch = async (fn, context, onError) => {
    try {
      return await fn()
    } catch (error) {
      logError(context, error)
      if (onError && typeof onError === "function") {
        onError(error)
      }
      return null
    }
  }
  
  /**
   * Create a safe version of a function that won't crash
   * @param {Function} fn - Function to make safe
   * @param {string} context - Context for error logging
   * @param {any} defaultReturn - Default return value if function fails
   * @returns {Function} - Safe version of the function
   */
  export const createSafeFunction = (fn, context, defaultReturn = null) => {
    return async (...args) => {
      try {
        return await fn(...args)
      } catch (error) {
        logError(context, error, { args })
        return defaultReturn
      }
    }
  }
  