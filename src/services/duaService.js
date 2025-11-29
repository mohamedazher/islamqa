/**
 * Dua Service
 * Handles all dua-related operations
 */

import dexieDb from './dexieDatabase'

class DuaService {
  /**
   * Get all categories
   * @param {string|null} type - 'main' or 'other', null for all
   */
  async getCategories(type = null) {
    return await dexieDb.getDuaCategories(type)
  }

  /**
   * Get a single category by id
   */
  async getCategory(id) {
    return await dexieDb.getDuaCategory(id)
  }

  /**
   * Get all duas for a category
   */
  async getDuasByCategory(categoryId) {
    return await dexieDb.getDuasByCategory(categoryId)
  }

  /**
   * Get a single dua
   */
  async getDua(id) {
    return await dexieDb.getDua(id)
  }

  /**
   * Search duas by text
   */
  async searchDuas(query) {
    if (!query || query.length < 2) return []

    const allDuas = await dexieDb.duas.toArray()
    const lowerQuery = query.toLowerCase()

    return allDuas.filter(dua =>
      dua.title?.toLowerCase().includes(lowerQuery) ||
      dua.translation?.toLowerCase().includes(lowerQuery) ||
      dua.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  /**
   * Get all favorite duas
   */
  async getFavorites() {
    const favoriteIds = await dexieDb.getDuaFavorites()
    if (favoriteIds.length === 0) return []

    const duas = await Promise.all(
      favoriteIds.map(id => dexieDb.getDua(id))
    )
    return duas.filter(Boolean)
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(duaId) {
    const isFav = await dexieDb.isDuaFavorite(duaId)
    if (isFav) {
      await dexieDb.removeDuaFavorite(duaId)
      return false
    } else {
      await dexieDb.addDuaFavorite(duaId)
      return true
    }
  }

  /**
   * Check if dua is favorited
   */
  async isFavorite(duaId) {
    return await dexieDb.isDuaFavorite(duaId)
  }

  /**
   * Get user settings
   */
  async getSettings() {
    return await dexieDb.getDuaSettings()
  }

  /**
   * Update user settings
   */
  async updateSettings(settings) {
    await dexieDb.updateDuaSettings(settings)
  }

  /**
   * Check if dua data is imported
   */
  async isImported() {
    return await dexieDb.hasDuaData()
  }

  /**
   * Get stats
   */
  async getStats() {
    return await dexieDb.getDuaStats()
  }
}

export default new DuaService()
