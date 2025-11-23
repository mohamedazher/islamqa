/**
 * Simple deterministic token generation from query text
 * Uses only basic JS operations (works in n8n without crypto module)
 */

/**
 * Generate a deterministic token from query and timestamp
 * Algorithm: Simple character code sum with bit manipulation
 * @param {string} query - The search query
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} - Hex-encoded token
 */
export function generateToken(query, timestamp) {
  // Combine query and timestamp
  const payload = `${query}|${timestamp}`

  // Simple hash using character codes (djb2-like algorithm)
  let hash = 5381
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i)
    hash = ((hash << 5) + hash) ^ char // 32-bit XOR
  }

  // Ensure positive number and convert to hex
  return Math.abs(hash >>> 0).toString(16).padStart(8, '0')
}

/**
 * Verify token matches query and timestamp
 * @param {string} query - The search query
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @param {string} token - Token to verify
 * @returns {boolean} - True if token is valid
 */
export function verifyToken(query, timestamp, token) {
  const expectedToken = generateToken(query, timestamp)
  return token === expectedToken
}
