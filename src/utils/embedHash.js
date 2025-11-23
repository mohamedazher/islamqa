/**
 * Hash utility for embedding API validation
 * Uses SHA-256 to create a validation hash
 */

// Shared secret - bundled at build time (not visible in network requests)
const APP_SECRET = import.meta.env.VITE_EMBED_SECRET || 'islamqa_embed_2024'

/**
 * Generate SHA-256 hash
 * @param {string} message - Message to hash
 * @returns {Promise<string>} - Hex encoded hash
 */
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Generate validation hash for embedding request
 * @param {string} query - Search query text
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {Promise<string>} - Validation hash
 */
export async function generateEmbedHash(query, timestamp) {
  const payload = `${query}:${timestamp}:${APP_SECRET}`
  return await sha256(payload)
}

/**
 * Create a validated embedding request payload
 * @param {string} query - Search query text
 * @returns {Promise<object>} - Request payload with query, timestamp, and hash
 */
export async function createEmbedRequest(query) {
  const timestamp = Date.now()
  const hash = await generateEmbedHash(query, timestamp)

  return {
    query,
    timestamp,
    hash
  }
}
