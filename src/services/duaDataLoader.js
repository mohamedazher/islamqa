/**
 * Dua Data Loader
 * Imports dua categories and duas from JSON files
 * Handles data version migration for app updates
 */

import dexieDb from './dexieDatabase'

// Current data version - increment when data structure changes
const CURRENT_DUA_DATA_VERSION = 7 // Version 7: Remove face emojis

class DuaDataLoader {
  /**
   * Load and import all dua data
   * @param {Function} onProgress - Progress callback (status, progress)
   */
  async loadAndImport(onProgress = null) {
    try {
      // Check data version for migration
      const needsMigration = await this.checkDataVersion()
      console.log(`📚 DuaDataLoader: needsMigration = ${needsMigration}`)

      if (needsMigration) {
        console.log('🔄 Data migration needed - clearing old data...')
        if (onProgress) onProgress('Migrating to new data...', 5)
        await this.migrateData()
      } else {
        // Check if already imported (new install)
        const hasData = await dexieDb.hasDuaData()
        console.log(`📚 DuaDataLoader: hasDuaData = ${hasData}`)
        if (hasData) {
          console.log('✅ Dua data already imported and up to date')
          return { success: true, message: 'Already imported' }
        }
      }

      // Step 1: Load categories from Hisn al-Muslim
      console.log(`📚 DuaDataLoader: Loading Hisn al-Muslim categories...`)
      if (onProgress) onProgress('Loading categories...', 10)

      const categoriesResponse = await fetch('./data/dua/categories.json')
      if (!categoriesResponse.ok) {
        throw new Error(`Failed to load categories: ${categoriesResponse.status}`)
      }

      const categories = await categoriesResponse.json()
      console.log(`📚 DuaDataLoader: Loaded ${categories.length} categories`)

      // Step 2: Import categories
      if (onProgress) onProgress('Importing categories...', 20)
      await dexieDb.importDuaCategories(categories)
      console.log(`✅ Imported ${categories.length} categories`)

      // Step 3: Load all duas from single file
      if (onProgress) onProgress('Loading duas...', 30)

      const duasResponse = await fetch('./data/dua/duas.json')
      if (!duasResponse.ok) {
        throw new Error(`Failed to load duas: ${duasResponse.status}`)
      }

      const duasByCategory = await duasResponse.json()
      console.log(`📚 DuaDataLoader: Loaded duas for ${Object.keys(duasByCategory).length} categories`)

      // Step 4: Import duas by category
      const categoryIds = Object.keys(duasByCategory)
      const totalCategories = categoryIds.length
      let totalDuasImported = 0

      console.log(`📖 Found ${totalCategories} categories in duas.json: ${categoryIds.join(', ')}`)

      for (let i = 0; i < totalCategories; i++) {
        const categoryId = categoryIds[i]
        const duas = duasByCategory[categoryId]
        const progress = 30 + ((i / totalCategories) * 60)

        const category = categories.find(c => c.id === categoryId)
        const categoryName = category ? category.title : categoryId

        if (onProgress) {
          onProgress(`Importing ${categoryName}...`, progress)
        }

        if (duas && duas.length > 0) {
          console.log(`📖 [${i + 1}/${totalCategories}] Importing ${duas.length} duas for "${categoryName}" (id: ${categoryId})`)
          await dexieDb.importDuas(duas)
          totalDuasImported += duas.length
        } else {
          console.warn(`⚠️ No duas found for category ${categoryId}`)
        }
      }

      console.log(`✅ Total duas imported: ${totalDuasImported} across ${totalCategories} categories`)

      // Step 5: Save data version
      if (onProgress) onProgress('Finalizing...', 95)
      await this.saveDataVersion()
      console.log(`✅ Import complete - Data version ${CURRENT_DUA_DATA_VERSION} saved`)

      if (onProgress) onProgress('Complete!', 100)

      return { success: true, message: 'Import complete' }
    } catch (error) {
      console.error('❌ Error importing dua data:', error)
      throw error
    }
  }

  /**
   * Check if data migration is needed
   * @returns {boolean} - True if migration needed
   */
  async checkDataVersion() {
    try {
      const storedVersion = await dexieDb.settings.get('dua_data_version')

      if (!storedVersion) {
        // No version stored - could be old data or fresh install
        const hasData = await dexieDb.hasDuaData()
        if (hasData) {
          console.log('📊 Old data detected (no version) - migration needed')
          return true // Old data without version needs migration
        } else {
          console.log('📊 Fresh install - no migration needed')
          return false // Fresh install
        }
      }

      const currentVersion = storedVersion.value
      console.log(`📊 Data version check: stored=${currentVersion}, current=${CURRENT_DUA_DATA_VERSION}`)

      return currentVersion !== CURRENT_DUA_DATA_VERSION
    } catch (error) {
      console.error('Error checking data version:', error)
      return false
    }
  }

  /**
   * Save current data version to settings
   */
  async saveDataVersion() {
    try {
      await dexieDb.settings.put({
        key: 'dua_data_version',
        value: CURRENT_DUA_DATA_VERSION
      })
      console.log(`💾 Saved data version: ${CURRENT_DUA_DATA_VERSION}`)
    } catch (error) {
      console.error('Error saving data version:', error)
    }
  }

  /**
   * Migrate from old data structure to new
   * Preserves user favorites when possible
   */
  async migrateData() {
    try {
      console.log('🔄 Starting data migration...')

      // Step 1: Backup user favorites (preserve these)
      console.log('💾 Backing up user favorites...')
      const favorites = await dexieDb.dua_favorites.toArray()
      const favoriteIds = favorites.map(f => f.dua_id)
      console.log(`  → Found ${favoriteIds.length} favorites to preserve`)

      // Step 2: Clear old dua data
      console.log('🗑️  Clearing old dua data...')
      await dexieDb.transaction('rw', [
        dexieDb.dua_categories,
        dexieDb.duas,
        dexieDb.dua_favorites
      ], async () => {
        await dexieDb.dua_categories.clear()
        await dexieDb.duas.clear()
        await dexieDb.dua_favorites.clear()
      })
      console.log('✅ Old dua data cleared')

      // Step 3: Store old favorites for later restoration
      // We'll restore these after import (user can manually re-favorite)
      if (favoriteIds.length > 0) {
        await dexieDb.settings.put({
          key: 'migrated_favorite_ids',
          value: favoriteIds
        })
        console.log(`💾 Saved ${favoriteIds.length} old favorite IDs for reference`)
      }

      console.log('✅ Migration preparation complete')
    } catch (error) {
      console.error('❌ Error during migration:', error)
      throw error
    }
  }

  /**
   * Clear all dua data (for re-import)
   */
  async clearData() {
    await dexieDb.transaction('rw', [
      dexieDb.dua_categories,
      dexieDb.duas,
      dexieDb.dua_favorites
    ], async () => {
      await dexieDb.dua_categories.clear()
      await dexieDb.duas.clear()
      await dexieDb.dua_favorites.clear()
    })
  }
}

export default new DuaDataLoader()
