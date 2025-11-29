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

      // Step 1: Load categories
      console.log(`📚 DuaDataLoader: Step 1 - Loading categories...`)
      if (onProgress) onProgress('Loading categories...', 10)
      const categoriesResponse = await fetch('./data/dua/categories.json')
      console.log(`📚 DuaDataLoader: Categories response status: ${categoriesResponse.status}`)
      const categoriesData = await categoriesResponse.json()
      console.log(`📚 DuaDataLoader: Loaded ${categoriesData.categories.length} categories`)

      // Step 2: Import categories
      if (onProgress) onProgress('Importing categories...', 20)

      // Build a map of category IDs from the JSON files
      const categoryIdMap = {}
      for (let i = 0; i < categoriesData.categories.length; i++) {
        const category = categoriesData.categories[i]
        try {
          const filePath = `./data/dua/${category.id}.json`
          const response = await fetch(filePath)
          if (response.ok) {
            const data = await response.json()
            categoryIdMap[category.id] = data.category_id
          }
        } catch (error) {
          console.warn(`Could not fetch category ID for ${category.id}`)
        }
      }

      // Add numeric_id to each category based on actual data
      categoriesData.categories.forEach(cat => {
        cat.numeric_id = categoryIdMap[cat.id] || null
      })

      await dexieDb.importDuaCategories(categoriesData.categories)

      // Step 3: Load and import duas for each category
      const categories = categoriesData.categories
      const totalCategories = categories.length

      for (let i = 0; i < totalCategories; i++) {
        const category = categories[i]
        const progress = 20 + ((i / totalCategories) * 70)

        if (onProgress) {
          onProgress(`Loading ${category.title}...`, progress)
        }

        try {
          const filePath = `./data/dua/${category.id}.json`
          console.log(`📖 DuaDataLoader: Loading ${filePath} for ${category.title}`)
          const duasResponse = await fetch(filePath)
          console.log(`📖 DuaDataLoader: Response status ${duasResponse.status} for ${category.id}`)

          if (duasResponse.ok) {
            const duasData = await duasResponse.json()
            console.log(`📖 DuaDataLoader: File has ${duasData.duas ? duasData.duas.length : 0} duas, category_id=${duasData.category_id}`)

            if (duasData.duas && duasData.duas.length > 0) {
              // Create unique global IDs for duas to avoid collisions
              const numericCategoryId = duasData.category_id
              duasData.duas.forEach((dua, index) => {
                dua.id = numericCategoryId * 1000 + (dua.id || index + 1)
              })

              console.log(`📖 Importing ${duasData.duas.length} duas for ${category.title} (category_id=${duasData.category_id})`)
              await dexieDb.importDuas(duasData.duas)
            } else {
              console.warn(`⚠️ No duas found in file for ${category.id}`)
            }
          } else {
            console.warn(`⚠️ HTTP ${duasResponse.status} for ${filePath}`)
          }
        } catch (error) {
          console.warn(`❌ Could not load duas for category ${category.id}:`, error)
        }
      }

      // Step 4: Mark as complete
      if (onProgress) onProgress('Finalizing...', 95)

      if (onProgress) onProgress('Complete!', 100)

      return { success: true, message: 'Import complete' }
    } catch (error) {
      console.error('Error importing dua data:', error)
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
