/**
 * Dua Data Loader
 * Imports dua categories and duas from JSON files
 */

import dexieDb from './dexieDatabase'

class DuaDataLoader {
  /**
   * Load and import all dua data
   * @param {Function} onProgress - Progress callback (status, progress)
   */
  async loadAndImport(onProgress = null) {
    try {
      // Check if already imported
      const hasData = await dexieDb.hasDuaData()
      console.log(`📚 DuaDataLoader: hasDuaData = ${hasData}`)
      if (hasData) {
        console.log('Dua data already imported')
        return { success: true, message: 'Already imported' }
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
          console.log(`📖 Importing ${duas.length} duas for ${categoryName}`)
          await dexieDb.importDuas(duas)
        } else {
          console.warn(`⚠️ No duas found for category ${categoryId}`)
        }
      }

      // Step 5: Mark as complete
      if (onProgress) onProgress('Finalizing...', 95)
      console.log(`✅ Import complete`)

      if (onProgress) onProgress('Complete!', 100)

      return { success: true, message: 'Import complete' }
    } catch (error) {
      console.error('❌ Error importing dua data:', error)
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
