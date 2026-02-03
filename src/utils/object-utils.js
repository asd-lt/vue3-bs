/**
 * Safely gets a value from a nested object using a dot-notation string path.
 * Handles paths like 'user.name' or 'items[0].id'.
 *
 * @param {Object} obj - The object to query
 * @param {String|Array} path - The path to the property
 * @param {*} defaultValue - Value to return if resolution fails
 * @returns {*}
 */
export function get(obj, path, defaultValue) {
  if (obj === null || obj === undefined) {
    return defaultValue
  }

  // Convert string path 'a[0].b' -> ['a', '0', 'b']
  const keys = Array.isArray(path)
    ? path
    : path
        .replace(/\[(\d+)\]/g, '.$1')
        .split('.')
        .filter(Boolean)

  let result = obj

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue
    }
    result = result[key]
  }

  return result === undefined ? defaultValue : result
}

/**
 * Safely sets a value on a nested object using a dot-notation string path.
 * Creates missing objects/arrays as needed.
 *
 * @param {Object} obj - The object to modify
 * @param {String|Array} path - The path to the property
 * @param {*} value - The value to set
 * @returns {Object} The modified object
 */
export function set(obj, path, value) {
  if (obj === null || obj === undefined) {
    return obj
  }

  const keys = Array.isArray(path)
    ? path
    : path
        .replace(/\[(\d+)\]/g, '.$1')
        .split('.')
        .filter(Boolean)

  let current = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]

    // If the key doesn't exist or isn't an object, create it
    if (current[key] === undefined || current[key] === null) {
      // Look ahead to see if the next key is a number (implying array)
      const nextKey = keys[i + 1]
      current[key] = String(nextKey).match(/^\d+$/) ? [] : {}
    }

    current = current[key]
  }

  const lastKey = keys[keys.length - 1]
  current[lastKey] = value

  return obj
}
