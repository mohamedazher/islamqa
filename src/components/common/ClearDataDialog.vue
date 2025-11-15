<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
        @click.self="close"
      >
        <div class="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-3 sm:p-4 pb-2 sm:pb-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 sm:gap-3 min-w-0">
                <div class="w-8 sm:w-10 h-8 sm:h-10 bg-red-100 dark:bg-red-950/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon name="exclamation" size="sm" class="text-red-600 dark:text-red-400" />
                </div>
                <h3 class="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 truncate">Clear Data</h3>
              </div>
              <button
                @click="close"
                class="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors flex-shrink-0 ml-2"
              >
                <Icon name="close" size="sm" />
              </button>
            </div>
            <p class="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 sm:mt-2">
              Choose what data you want to clear from your device
            </p>
          </div>

          <!-- Options -->
          <div class="p-3 sm:p-4 space-y-3 sm:space-y-4">
            <!-- Database Option -->
            <label
              class="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all"
              :class="selections.database
                ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'"
            >
              <input
                type="checkbox"
                v-model="selections.database"
                class="mt-1 w-5 h-5 text-red-600 bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 rounded focus:ring-2 focus:ring-red-500"
              />
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <Icon name="database" size="sm" class="text-red-600 dark:text-red-400" />
                  <span class="font-semibold text-neutral-900 dark:text-neutral-100">Q&A Database</span>
                  <span class="text-xs bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded">~50MB</span>
                </div>
                <p class="text-sm text-neutral-600 dark:text-neutral-400">
                  Questions, answers, and categories. You'll need to re-import data to use the app.
                </p>
              </div>
            </label>

            <!-- Bookmarks Option -->
            <label
              class="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all"
              :class="selections.bookmarks
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30'
                : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'"
            >
              <input
                type="checkbox"
                v-model="selections.bookmarks"
                class="mt-1 w-5 h-5 text-orange-600 bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 rounded focus:ring-2 focus:ring-orange-500"
              />
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <Icon name="bookmark" size="sm" class="text-orange-600 dark:text-orange-400" />
                  <span class="font-semibold text-neutral-900 dark:text-neutral-100">Bookmarks & Folders</span>
                </div>
                <p class="text-sm text-neutral-600 dark:text-neutral-400">
                  Your saved questions and custom folders. This cannot be undone.
                </p>
              </div>
            </label>

            <!-- Quiz Progress Option -->
            <label
              class="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all"
              :class="selections.quizProgress
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'"
            >
              <input
                type="checkbox"
                v-model="selections.quizProgress"
                class="mt-1 w-5 h-5 text-amber-600 bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 rounded focus:ring-2 focus:ring-amber-500"
              />
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <Icon name="lightning" size="sm" class="text-amber-600 dark:text-amber-400" />
                  <span class="font-semibold text-neutral-900 dark:text-neutral-100">Quiz Progress</span>
                </div>
                <p class="text-sm text-neutral-600 dark:text-neutral-400">
                  Your scores, level, and leaderboard stats. Start fresh with quizzes.
                </p>
              </div>
            </label>

            <!-- App Settings Option -->
            <label
              class="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all"
              :class="selections.settings
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'"
            >
              <input
                type="checkbox"
                v-model="selections.settings"
                class="mt-1 w-5 h-5 text-primary-600 bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 rounded focus:ring-2 focus:ring-primary-500"
              />
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <Icon name="cog" size="sm" class="text-primary-600 dark:text-primary-400" />
                  <span class="font-semibold text-neutral-900 dark:text-neutral-100">App Settings</span>
                </div>
                <p class="text-sm text-neutral-600 dark:text-neutral-400">
                  Theme, analytics preferences, and other app settings.
                </p>
              </div>
            </label>

            <!-- Divider -->
            <div class="border-t border-neutral-200 dark:border-neutral-800 pt-4">
              <label
                class="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all"
                :class="selections.resetEverything
                  ? 'border-red-600 bg-red-100 dark:bg-red-950/50'
                  : 'border-neutral-300 dark:border-neutral-700 hover:border-red-400 dark:hover:border-red-600'"
              >
                <input
                  type="checkbox"
                  v-model="selections.resetEverything"
                  class="mt-1 w-5 h-5 text-red-700 bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 rounded focus:ring-2 focus:ring-red-600"
                />
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <Icon name="fire" size="sm" class="text-red-700 dark:text-red-500" />
                    <span class="font-bold text-neutral-900 dark:text-neutral-100">Reset Everything</span>
                  </div>
                  <p class="text-sm text-red-700 dark:text-red-400 font-medium">
                    Complete reset to first-launch state. You'll see the full onboarding again including privacy consent and data import.
                  </p>
                </div>
              </label>
            </div>

            <!-- Summary -->
            <div
              v-if="hasSelections"
              class="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3 sm:p-4 border border-neutral-200 dark:border-neutral-700"
            >
              <div class="flex items-start gap-2 mb-2">
                <Icon name="info" size="sm" class="text-neutral-600 dark:text-neutral-400 mt-0.5" />
                <div class="flex-1">
                  <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                    You are about to clear:
                  </p>
                  <ul class="text-sm text-neutral-700 dark:text-neutral-300 space-y-1">
                    <li v-if="selections.database || selections.resetEverything">• Q&A Database</li>
                    <li v-if="selections.bookmarks || selections.resetEverything">• Bookmarks & Folders</li>
                    <li v-if="selections.quizProgress || selections.resetEverything">• Quiz Progress</li>
                    <li v-if="selections.settings || selections.resetEverything">• App Settings (theme, privacy consent)</li>
                    <li v-if="selections.resetEverything" class="font-semibold text-red-700 dark:text-red-400">
                      • Onboarding Status (full tutorial + privacy consent will show again)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 p-3 sm:p-4 pt-2 sm:pt-3">
            <div class="flex gap-2 sm:gap-3">
              <button
                @click="close"
                :disabled="isClearing"
                class="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                @click="confirmClear"
                :disabled="!hasSelections || isClearing"
                class="flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                :class="hasSelections
                  ? 'bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 text-white hover:from-red-700 hover:to-red-800 dark:hover:from-red-600 dark:hover:to-red-700'
                  : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-500 cursor-not-allowed'"
              >
                <Icon v-if="!isClearing" name="exclamation" size="sm" />
                <span>{{ isClearing ? 'Clearing...' : 'Clear Selected Data' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'clear'])

const selections = ref({
  database: false,
  bookmarks: false,
  quizProgress: false,
  settings: false,
  resetEverything: false
})

const isClearing = ref(false)

const hasSelections = computed(() => {
  return Object.values(selections.value).some(v => v)
})

// Watch resetEverything - if checked, check all others
watch(() => selections.value.resetEverything, (newVal) => {
  if (newVal) {
    selections.value.database = true
    selections.value.bookmarks = true
    selections.value.quizProgress = true
    selections.value.settings = true
  }
})

// If any individual item is unchecked, uncheck resetEverything
watch(() => [
  selections.value.database,
  selections.value.bookmarks,
  selections.value.quizProgress,
  selections.value.settings
], () => {
  if (
    !selections.value.database ||
    !selections.value.bookmarks ||
    !selections.value.quizProgress ||
    !selections.value.settings
  ) {
    selections.value.resetEverything = false
  }
}, { deep: true })

function close() {
  if (isClearing.value) return
  emit('update:modelValue', false)
  // Reset selections after closing
  setTimeout(() => {
    selections.value = {
      database: false,
      bookmarks: false,
      quizProgress: false,
      settings: false,
      resetEverything: false
    }
  }, 300)
}

async function confirmClear() {
  if (!hasSelections.value || isClearing.value) return

  // Final confirmation
  const itemsList = []
  if (selections.value.database || selections.value.resetEverything) itemsList.push('Q&A Database')
  if (selections.value.bookmarks || selections.value.resetEverything) itemsList.push('Bookmarks')
  if (selections.value.quizProgress || selections.value.resetEverything) itemsList.push('Quiz Progress')
  if (selections.value.settings || selections.value.resetEverything) itemsList.push('App Settings (theme, privacy)')
  if (selections.value.resetEverything) itemsList.push('Onboarding (will restart with privacy consent)')

  const confirmed = confirm(
    `Are you sure you want to clear the following?\n\n${itemsList.map(item => `• ${item}`).join('\n')}\n\n${selections.value.resetEverything ? 'The app will reload and show the complete onboarding flow.\n\n' : ''}This action cannot be undone.`
  )

  if (!confirmed) return

  isClearing.value = true

  try {
    // Emit the clear event with selections
    emit('clear', { ...selections.value })

    // Dialog will be closed by parent after clearing
  } catch (error) {
    console.error('Error in clear dialog:', error)
    isClearing.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom checkbox styling */
input[type="checkbox"] {
  cursor: pointer;
}

input[type="checkbox"]:checked {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
