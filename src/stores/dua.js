/**
 * Dua Store
 * Manages dua state and actions
 */

import { defineStore } from 'pinia'
import duaService from '@/services/duaService'
import duaDataLoader from '@/services/duaDataLoader'

export const useDuaStore = defineStore('dua', {
  state: () => ({
    categories: [],
    currentCategory: null,
    currentDuas: [],
    currentDuaIndex: 0,
    favorites: [],
    settings: {
      arabic_font_size: 28,
      transliteration_font_size: 16,
      translation_font_size: 14,
      show_transliteration: true,
      show_translation: true
    },
    isLoading: false,
    isImported: false,
    importProgress: 0,
    importStatus: ''
  }),

  getters: {
    mainCategories: (state) => state.categories.filter(c => c.tab === 'main'),
    otherCategories: (state) => state.categories.filter(c => c.tab === 'other'),
    currentDua: (state) => state.currentDuas[state.currentDuaIndex] || null,
    progress: (state) => {
      if (state.currentDuas.length === 0) return '0/0'
      return `${state.currentDuaIndex + 1}/${state.currentDuas.length}`
    },
    progressPercent: (state) => {
      if (state.currentDuas.length === 0) return 0
      return ((state.currentDuaIndex + 1) / state.currentDuas.length) * 100
    },
    hasNext: (state) => state.currentDuaIndex < state.currentDuas.length - 1,
    hasPrevious: (state) => state.currentDuaIndex > 0
  },

  actions: {
    async initialize() {
      this.isLoading = true
      try {
        // Always run loadAndImport - it handles version checking and migration internally
        // This ensures existing users get migrated to new data structure
        console.log(`📚 [DuaStore] Starting dua data import/check...`)
        await duaDataLoader.loadAndImport((status, progress) => {
          this.importStatus = status
          this.importProgress = progress
          console.log(`  → ${status} (${progress}%)`)
        })
        this.isImported = true
        console.log(`📚 [DuaStore] Dua data ready`)

        // Load categories
        console.log(`📚 [DuaStore] Loading categories...`)
        await this.loadCategories()
        console.log(`📚 [DuaStore] Loaded ${this.categories.length} categories`)

        // Load settings
        this.settings = await duaService.getSettings()

        // Load favorites
        await this.loadFavorites()
        console.log(`📚 [DuaStore] Initialize complete`)
      } catch (error) {
        console.error('❌ Error initializing dua store:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async loadCategories() {
      this.categories = await duaService.getCategories()
    },

    async loadCategory(categoryId) {
      this.isLoading = true
      try {
        console.log(`📂 [DuaStore] loadCategory called with: ${categoryId}`)
        this.currentCategory = await duaService.getCategory(categoryId)
        console.log(`📂 [DuaStore] currentCategory loaded:`, this.currentCategory)
        this.currentDuas = await duaService.getDuasByCategory(categoryId)
        console.log(`📂 [DuaStore] currentDuas loaded: ${this.currentDuas.length} duas`)
        this.currentDuaIndex = 0
      } catch (error) {
        console.error('❌ Error loading category:', error)
      } finally {
        this.isLoading = false
      }
    },

    async loadDuaByIndex(index) {
      if (index >= 0 && index < this.currentDuas.length) {
        this.currentDuaIndex = index
      }
    },

    nextDua() {
      if (this.hasNext) {
        this.currentDuaIndex++
      }
    },

    previousDua() {
      if (this.hasPrevious) {
        this.currentDuaIndex--
      }
    },

    async loadFavorites() {
      this.favorites = await duaService.getFavorites()
    },

    async toggleFavorite(duaId) {
      const isFav = await duaService.toggleFavorite(duaId)
      await this.loadFavorites()
      return isFav
    },

    async isFavorite(duaId) {
      return await duaService.isFavorite(duaId)
    },

    async updateSettings(newSettings) {
      this.settings = { ...this.settings, ...newSettings }
      await duaService.updateSettings(this.settings)
    },

    async searchDuas(query) {
      return await duaService.searchDuas(query)
    }
  }
})
