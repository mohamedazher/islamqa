<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="showDialog"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="handleReject"
      >
        <div
          class="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          @click.stop
        >
          <!-- Header -->
          <div class="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white p-6 rounded-t-2xl">
            <div class="flex items-center gap-3 mb-2">
              <Icon name="shield" size="lg" />
              <h2 class="text-xl font-bold">Your Privacy Matters</h2>
            </div>
            <p class="text-primary-100 dark:text-primary-200 text-sm">
              We respect your privacy and want to be transparent about data collection
            </p>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-5">
            <!-- What we collect -->
            <div>
              <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 mb-2 flex items-center gap-2">
                <Icon name="document" size="sm" class="text-primary-600 dark:text-primary-400" />
                What We Collect (Optional)
              </h3>
              <ul class="space-y-1.5 text-sm text-neutral-700 dark:text-neutral-300">
                <li class="flex items-start gap-2">
                  <span class="text-primary-600 dark:text-primary-400 mt-0.5">•</span>
                  <span>Anonymous usage patterns (screens viewed, features used)</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-primary-600 dark:text-primary-400 mt-0.5">•</span>
                  <span>Search queries to improve content discovery</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-primary-600 dark:text-primary-400 mt-0.5">•</span>
                  <span>Device type and platform (for compatibility)</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-primary-600 dark:text-primary-400 mt-0.5">•</span>
                  <span>App performance metrics</span>
                </li>
              </ul>
            </div>

            <!-- What we DON'T collect -->
            <div class="bg-primary-50 dark:bg-primary-950/30 rounded-lg p-4">
              <h3 class="font-semibold text-primary-900 dark:text-primary-100 mb-2 flex items-center gap-2">
                <Icon name="shield" size="sm" class="text-primary-600 dark:text-primary-400" />
                What We Never Collect
              </h3>
              <ul class="space-y-1 text-sm text-primary-800 dark:text-primary-200">
                <li class="flex items-start gap-2">
                  <span class="text-primary-600 dark:text-primary-400">✗</span>
                  <span>Personal information (name, email, phone)</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-primary-600 dark:text-primary-400">✗</span>
                  <span>Location data</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-primary-600 dark:text-primary-400">✗</span>
                  <span>Contact lists or photos</span>
                </li>
              </ul>
            </div>

            <!-- Purpose -->
            <div>
              <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 mb-2 flex items-center gap-2">
                <Icon name="globe" size="sm" class="text-accent-600 dark:text-accent-400" />
                Why We Ask
              </h3>
              <p class="text-sm text-neutral-700 dark:text-neutral-300">
                Analytics help us understand which features are most valuable and identify areas for improvement.
                All data is anonymous and automatically deleted after 14 months.
              </p>
            </div>

            <!-- Your rights -->
            <div class="border-t border-neutral-200 dark:border-neutral-800 pt-4">
              <p class="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                <strong>Your rights:</strong> You can change these preferences anytime in Settings.
                Your choice won't affect core app functionality. We never sell your data to third parties.
              </p>
            </div>

            <!-- Powered by Firebase -->
            <div class="text-center">
              <p class="text-xs text-neutral-500 dark:text-neutral-500">
                Powered by
                <a
                  href="https://firebase.google.com/support/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Google Firebase Analytics
                </a>
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="p-6 bg-neutral-50 dark:bg-neutral-950/50 rounded-b-2xl space-y-3">
            <button
              @click="handleAccept"
              class="w-full bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 text-white px-6 py-3.5 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 dark:hover:from-primary-600 dark:hover:to-primary-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Icon name="check" size="md" />
              Accept & Continue
            </button>

            <button
              @click="handleReject"
              class="w-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-6 py-3 rounded-xl font-medium hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-all"
            >
              Decline Analytics
            </button>

            <button
              @click="showDetails = !showDetails"
              class="w-full text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 py-2 transition-colors flex items-center justify-center gap-1"
            >
              {{ showDetails ? 'Hide' : 'Show' }} detailed privacy information
              <Icon :name="showDetails ? 'chevronUp' : 'chevronDown'" size="sm" />
            </button>
          </div>

          <!-- Detailed Privacy Info (Expandable) -->
          <Transition name="slide">
            <div v-if="showDetails" class="p-6 bg-neutral-100 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 space-y-4 text-sm">
              <div>
                <h4 class="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Data Retention</h4>
                <p class="text-neutral-700 dark:text-neutral-300">
                  Analytics data is automatically deleted after 14 months. Essential app data (bookmarks, preferences)
                  remains until you clear it manually.
                </p>
              </div>

              <div>
                <h4 class="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Third-Party Services</h4>
                <p class="text-neutral-700 dark:text-neutral-300">
                  We use Google Firebase Analytics for anonymous usage tracking. Firebase complies with GDPR and
                  major privacy regulations. No data is sold or shared with advertisers.
                </p>
              </div>

              <div>
                <h4 class="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Your Control</h4>
                <p class="text-neutral-700 dark:text-neutral-300">
                  Toggle analytics on/off anytime in Settings → Privacy. Changes take effect immediately.
                  You can also clear all app data to remove locally stored information.
                </p>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Icon from './Icon.vue'
import { usePrivacyConsent } from '@/services/privacyConsent'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'accept', 'reject'])

const { acceptAll, rejectAll } = usePrivacyConsent()
const showDialog = ref(props.modelValue)
const showDetails = ref(false)

function handleAccept() {
  acceptAll()
  emit('accept')
  close()
}

function handleReject() {
  rejectAll()
  emit('reject')
  close()
}

function close() {
  showDialog.value = false
  emit('update:modelValue', false)
}

onMounted(() => {
  showDialog.value = props.modelValue
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
