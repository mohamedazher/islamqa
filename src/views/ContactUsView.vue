<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4 sm:p-6">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-3">
          <Icon name="chat" size="lg" class="text-primary-600 dark:text-primary-400" />
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Share Your Feedback</h1>
        </div>
        <p class="text-neutral-600 dark:text-neutral-400">
          Help us improve! Share feature requests, suggestions, report bugs, or ask questions.
        </p>
      </div>

      <!-- Encouragement Banner -->
      <div class="mb-6 p-4 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-950/30 dark:to-accent-950/30 border border-primary-200 dark:border-primary-800/30 rounded-lg">
        <div class="flex gap-3">
          <Icon name="lightbulb" size="md" class="text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 class="font-semibold text-primary-900 dark:text-primary-100 mb-1">We Love Ideas!</h3>
            <p class="text-sm text-primary-800 dark:text-primary-200">
              Have a feature idea? Want to suggest an improvement? Please share it! Your feedback directly helps us build a better app.
            </p>
          </div>
        </div>
      </div>

      <!-- Contact Form -->
      <Card padding="lg" class="mb-6">
        <!-- Success Message -->
        <div
          v-if="successMessage"
          class="mb-6 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/30 rounded-lg"
        >
          <div class="flex items-start gap-3">
            <Icon name="check-circle" size="md" class="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 class="font-semibold text-green-900 dark:text-green-100">Thank You!</h3>
              <p class="text-sm text-green-800 dark:text-green-200 mt-1">
                {{ successMessage }}
              </p>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div
          v-if="errorMessage"
          class="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 rounded-lg"
        >
          <div class="flex items-start gap-3">
            <Icon name="exclamation" size="md" class="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 class="font-semibold text-red-900 dark:text-red-100">Error</h3>
              <p class="text-sm text-red-800 dark:text-red-200 mt-1">
                {{ errorMessage }}
              </p>
            </div>
          </div>
        </div>

        <!-- Form Fields -->
        <form @submit.prevent="submitForm" class="space-y-4">
          <!-- Request Type Dropdown -->
          <div>
            <label class="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              What type of feedback? <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.requestType"
              class="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              :disabled="isLoading"
              required
            >
              <option value="">-- Select a type --</option>
              <option value="feature_request">✨ Feature Request (Suggest a new feature)</option>
              <option value="improvement">🎯 Improvement (Make something better)</option>
              <option value="bug_report">🐛 Bug Report (Something isn't working)</option>
              <option value="suggestion">💡 Suggestion (Any ideas)</option>
              <option value="question">❓ Question (Ask something)</option>
              <option value="general">💬 General Feedback</option>
            </select>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Help us understand what you'd like to share
            </p>
          </div>

          <!-- Type Description -->
          <div v-if="form.requestType" class="p-3 rounded-lg" :class="typeDescriptionClass">
            <p class="text-sm">{{ typeDescriptions[form.requestType] }}</p>
          </div>

          <!-- Email Input -->
          <div>
            <label class="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              Email Address <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.email"
              type="email"
              placeholder="your.email@example.com"
              class="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              :disabled="isLoading"
              required
            />
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              We'll use this to follow up if needed
            </p>
          </div>

          <!-- Message Textarea -->
          <div>
            <label class="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              Your Message <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="form.message"
              placeholder="Please tell us about your feedback, suggestions, or any issues you've encountered..."
              rows="6"
              class="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
              :disabled="isLoading"
              required
            ></textarea>
            <div class="flex justify-between items-center mt-2">
              <p class="text-xs text-neutral-500 dark:text-neutral-400">
                Minimum {{ MIN_MESSAGE_LENGTH }} characters
              </p>
              <p class="text-xs" :class="form.message.length >= MIN_MESSAGE_LENGTH ? 'text-green-600 dark:text-green-400' : 'text-neutral-500 dark:text-neutral-400'">
                {{ form.message.length }} / {{ MIN_MESSAGE_LENGTH }}+
              </p>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading || !isFormValid"
            class="w-full py-3 bg-primary-600 dark:bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Icon
              :name="isLoading ? 'spinner' : 'send'"
              size="md"
              :class="{ 'animate-spin': isLoading }"
            />
            {{ isLoading ? 'Sending...' : 'Send Feedback' }}
          </button>
        </form>
      </Card>

      <!-- Info Box -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- What to Share -->
        <Card padding="lg" class="bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800/30">
          <div class="flex gap-4">
            <Icon name="check-circle" size="md" class="text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 class="font-semibold text-primary-900 dark:text-primary-100 mb-2">What to Share</h3>
              <ul class="text-sm text-primary-800 dark:text-primary-200 space-y-1">
                <li>✓ Feature ideas & improvements</li>
                <li>✓ Bug reports & issues</li>
                <li>✓ UI/UX suggestions</li>
                <li>✓ Questions & feedback</li>
              </ul>
            </div>
          </div>
        </Card>

        <!-- Why It Matters -->
        <Card padding="lg" class="bg-accent-50 dark:bg-accent-950/30 border border-accent-200 dark:border-accent-800/30">
          <div class="flex gap-4">
            <Icon name="star" size="md" class="text-accent-600 dark:text-accent-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 class="font-semibold text-accent-900 dark:text-accent-100 mb-2">Why It Matters</h3>
              <p class="text-sm text-accent-800 dark:text-accent-200 leading-relaxed">
                Your feedback directly shapes the app's future. We read and consider every suggestion to make BetterIslam Q&A better for everyone.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Icon from '@/components/common/Icon.vue'
import Card from '@/components/common/Card.vue'
import contactUsService from '@/services/contactUsService'

const MIN_MESSAGE_LENGTH = 10

const form = ref({
  requestType: '',
  email: '',
  message: ''
})

const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const typeDescriptions = {
  feature_request: '✨ Great! Feature requests help us understand what would make the app better for you.',
  improvement: '🎯 We appreciate suggestions to improve existing features!',
  bug_report: '🐛 Thank you for reporting! Bug reports help us fix issues quickly.',
  suggestion: '💡 We love hearing your ideas and suggestions!',
  question: '❓ We\'ll do our best to help answer your question.',
  general: '💬 Thanks for your feedback!'
}

const typeDescriptionClass = computed(() => {
  const type = form.value.requestType
  if (type === 'feature_request' || type === 'improvement') {
    return 'bg-accent-50 dark:bg-accent-950/30 border border-accent-200 dark:border-accent-800/30 text-accent-900 dark:text-accent-100'
  } else if (type === 'bug_report') {
    return 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 text-red-900 dark:text-red-100'
  } else {
    return 'bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800/30 text-primary-900 dark:text-primary-100'
  }
})

const isFormValid = computed(() => {
  return (
    form.value.requestType &&
    form.value.email.trim() &&
    form.value.message.trim() &&
    form.value.message.length >= MIN_MESSAGE_LENGTH &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)
  )
})

async function submitForm() {
  if (!isFormValid.value) return

  isLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const result = await contactUsService.sendFeedback(
      form.value.email,
      form.value.message,
      form.value.requestType
    )

    successMessage.value = result.message
    form.value.email = ''
    form.value.message = ''
    form.value.requestType = ''

    // Clear success message after 5 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)
  } catch (error) {
    errorMessage.value = error.message || 'Failed to send feedback. Please try again.'
    console.error('Contact form error:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  // Track page view
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: 'Contact Us',
      page_path: '/contact-us'
    })
  }
})
</script>

<style scoped>
/* Additional animations if needed */
textarea {
  font-family: inherit;
}
</style>
