<template>
  <div v-if="showNotice" class="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50">
    <div class="bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 rounded-xl shadow-lg p-4 text-white">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <Icon name="info" size="md" class="text-white" />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-base mb-1">✨ Duas Updated!</h3>
          <p class="text-sm text-white/90 mb-3">
            We've migrated to Hisn al-Muslim (Fortress of the Muslim) with 268 authentic duas.
            <span v-if="oldFavoritesCount > 0"> Your {{ oldFavoritesCount }} favorite{{ oldFavoritesCount > 1 ? 's' : '' }} couldn't be migrated automatically - please re-favorite your preferred duas.</span>
          </p>
          <button
            @click="dismiss"
            class="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            Got it
          </button>
        </div>
        <button
          @click="dismiss"
          class="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition"
        >
          <Icon name="close" size="sm" class="text-white" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Icon from '@/components/common/Icon.vue'
import dexieDb from '@/services/dexieDatabase'

const showNotice = ref(false)
const oldFavoritesCount = ref(0)

onMounted(async () => {
  try {
    // Check if there's a migrated favorites notice to show
    const migratedFavorites = await dexieDb.settings.get('migrated_favorite_ids')

    if (migratedFavorites && !localStorage.getItem('migration_notice_dismissed')) {
      oldFavoritesCount.value = migratedFavorites.value?.length || 0
      showNotice.value = true
    }
  } catch (error) {
    console.error('Error checking migration notice:', error)
  }
})

function dismiss() {
  showNotice.value = false
  localStorage.setItem('migration_notice_dismissed', 'true')

  // Clean up the migrated favorites reference after user acknowledges
  dexieDb.settings.delete('migrated_favorite_ids').catch(console.error)
}
</script>
