/**
 * Validation utilities for the app
 */

/**
 * Check if a value is a valid number
 * @param {any} value - Value to check
 * @returns {boolean} - Whether the value is a valid number
 */
export const isValidNumber = (value) => {
    if (value === null || value === undefined) return false
    if (typeof value === "boolean") return false
  
    const num = Number(value)
    return !isNaN(num) && isFinite(num)
  }
  
  /**
   * Ensure a number is within a range
   * @param {number} value - Value to clamp
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} - Clamped value
   */
  export const clamp = (value, min, max) => {
    if (!isValidNumber(value)) return min
    return Math.min(Math.max(value, min), max)
  }
  
  /**
   * Validate an object against a schema
   * @param {Object} obj - Object to validate
   * @param {Object} schema - Schema to validate against
   * @returns {Object} - Validation result
   */
  export const validateObject = (obj, schema) => {
    const result = {
      isValid: true,
      errors: {},
    }
  
    Object.keys(schema).forEach((key) => {
      const validator = schema[key]
      if (typeof validator === "function") {
        const isValid = validator(obj[key])
        if (!isValid) {
          result.isValid = false
          result.errors[key] = `Invalid value for ${key}`
        }
      }
    })
  
    return result
  }
  