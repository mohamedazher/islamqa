<template>
  <div class="chat-view h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
    <!-- Header -->
    <header class="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white p-4 shadow flex-shrink-0">
      <div class="flex items-center gap-3">
        <button @click="goBack" class="hover:opacity-80 transition-opacity flex-shrink-0">
          <Icon name="arrowLeft" size="md" />
        </button>
        <div class="flex items-center gap-2 flex-1">
          <Icon name="sparkles" size="md" />
          <h1 class="text-lg font-bold">Ask Islam QA</h1>
        </div>
        <div class="flex items-center gap-2">
          <div v-if="searchMode" class="text-xs bg-white/20 px-2 py-1 rounded">
            {{ searchMode }}
          </div>
          <button
            v-if="messages.length > 0"
            @click="showClearConfirm = true"
            class="p-2 hover:bg-white/20 rounded-lg transition"
            title="Clear conversation"
          >
            <Icon name="trash" size="sm" />
          </button>
        </div>
      </div>
    </header>

    <!-- Clear Confirmation Modal -->
    <div v-if="showClearConfirm" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-sm w-full p-6">
        <h3 class="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2">Clear Conversation?</h3>
        <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-4">This will delete all messages. This action cannot be undone.</p>
        <div class="flex gap-2">
          <button
            @click="clearConversation"
            class="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition"
          >
            Clear
          </button>
          <button
            @click="showClearConfirm = false"
            class="flex-1 bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 px-4 py-2 rounded-lg font-medium hover:bg-neutral-300 dark:hover:bg-neutral-700 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Chat Messages -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-4"
    >
      <!-- AI Data Missing - Import Prompt -->
      <div v-if="aiDataMissing" class="text-center py-8">
        <div class="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="exclamation" size="xl" class="text-amber-600 dark:text-amber-400" />
        </div>
        <h2 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          AI Search Data Required
        </h2>
        <p class="text-neutral-600 dark:text-neutral-400 mb-6 max-w-sm mx-auto">
          To enable intelligent search, we need to import AI data. This includes summaries and embeddings for semantic search.
        </p>

        <!-- Import Progress -->
        <div v-if="isImportingAi" class="max-w-sm mx-auto mb-6">
          <div class="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              <span class="text-sm text-neutral-700 dark:text-neutral-300">{{ importStep }}</span>
            </div>
            <div class="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
              <div
                class="bg-primary-600 dark:bg-primary-500 h-2 rounded-full transition-all duration-300"
                :style="{ width: importProgress + '%' }"
              ></div>
            </div>
            <p class="text-xs text-neutral-500 mt-2 text-right">{{ Math.round(importProgress) }}%</p>
          </div>
        </div>

        <!-- Import Button -->
        <button
          v-if="!isImportingAi"
          @click="startAiImport"
          class="bg-primary-600 dark:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition"
        >
          Import AI Data
        </button>
      </div>

      <!-- Welcome Message -->
      <div v-else-if="messages.length === 0" class="text-center py-8">
        <div class="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="sparkles" size="xl" class="text-primary-600 dark:text-primary-400" />
        </div>
        <h2 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          Assalamu Alaikum!
        </h2>
        <p class="text-neutral-600 dark:text-neutral-400 mb-6 max-w-sm mx-auto">
          Ask me any question about Islam. I'll find relevant answers from our database of scholarly Q&As.
        </p>

        <!-- Suggested Questions -->
        <div class="space-y-2 max-w-sm mx-auto">
          <p class="text-sm text-neutral-500 dark:text-neutral-500 mb-3">Try asking:</p>
          <button
            v-for="suggestion in suggestedQuestions"
            :key="suggestion"
            @click="askQuestion(suggestion)"
            class="w-full text-left bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-3 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition border border-neutral-200 dark:border-neutral-700"
          >
            <span class="text-neutral-700 dark:text-neutral-300 text-sm">{{ suggestion }}</span>
          </button>
        </div>
      </div>

      <!-- Messages -->
      <template v-for="(message, index) in messages" :key="index">
        <!-- User Message -->
        <div v-if="message.type === 'user'" class="flex justify-end">
          <div class="max-w-[85%] bg-primary-600 dark:bg-primary-700 text-white rounded-2xl rounded-br-md px-4 py-3">
            <p class="text-sm">{{ message.content }}</p>
          </div>
        </div>

        <!-- Assistant Message -->
        <div v-else-if="message.type === 'assistant'" class="flex justify-start">
          <div class="max-w-[85%] bg-white dark:bg-neutral-800 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-neutral-200 dark:border-neutral-700">
            <!-- Source Cards -->
            <div v-if="message.results && message.results.length > 0" class="space-y-2">
              <!-- Results Header -->
              <div class="flex items-center gap-2 mb-3">
                <p class="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Results:</p>
                <div class="flex gap-1 text-xs">
                  <span v-if="message.questionCount > 0" class="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded">
                    {{ message.questionCount }} Q&As
                  </span>
                  <span v-if="message.duaCount > 0" class="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded">
                    {{ message.duaCount }} Duas
                  </span>
                </div>
              </div>

              <!-- Result Cards -->
              <div
                v-for="result in message.results.slice(0, message.visibleResultsCount)"
                :key="`${result.resultType}-${result.reference || result.id}`"
                @click="openResult(result)"
                :class="{
                  'bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800': true,
                  'rounded-lg p-3 cursor-pointer transition border border-neutral-200 dark:border-neutral-700': true,
                  'border-l-4 border-l-primary-500': result.resultType === 'question',
                  'border-l-4 border-l-emerald-500': result.resultType === 'dua'
                }"
              >
                <!-- Result Type Badge -->
                <div class="flex items-start justify-between gap-2 mb-1">
                  <div class="flex items-center gap-2 flex-1">
                    <span v-if="result.resultType === 'dua'" class="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full font-medium">
                      Dua
                    </span>
                    <span v-else class="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                      Q&A
                    </span>
                    <h4 class="text-sm font-medium text-neutral-900 dark:text-neutral-100 line-clamp-2 flex-1">
                      {{ result.title }}
                    </h4>
                  </div>
                  <span v-if="result.similarity" class="text-xs text-primary-600 dark:text-primary-400 whitespace-nowrap font-medium">
                    {{ Math.round(result.similarity * 100) }}%
                  </span>
                </div>

                <!-- Result Category/Summary -->
                <p v-if="result.summary" class="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-2">
                  {{ result.summary }}
                </p>
                <p v-else-if="result.category" class="text-xs text-neutral-500 dark:text-neutral-500 line-clamp-1 mb-2">
                  {{ result.category }}
                </p>

                <!-- Dua Content (for duas) -->
                <div v-if="result.resultType === 'dua'" class="mt-2 space-y-2 border-t border-neutral-200 dark:border-neutral-700 pt-2">
                  <!-- Arabic -->
                  <div v-if="result.arabic" class="text-sm text-neutral-800 dark:text-neutral-200 text-right font-semibold">
                    {{ result.arabic }}
                  </div>

                  <!-- Transliteration -->
                  <div v-if="result.transliteration" class="text-xs text-neutral-600 dark:text-neutral-400 italic">
                    {{ result.transliteration }}
                  </div>

                  <!-- Translation -->
                  <div v-if="result.translation" class="text-xs text-neutral-700 dark:text-neutral-300">
                    {{ result.translation }}
                  </div>
                </div>

                <!-- Tags -->
                <div v-if="result.tags && result.tags.length > 0" class="flex flex-wrap gap-1 mt-2">
                  <span
                    v-for="tag in result.tags.slice(0, 3)"
                    :key="tag"
                    class="text-xs px-2 py-0.5 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded"
                  >
                    {{ tag }}
                  </span>
                </div>

              </div>

              <!-- Show More Button -->
              <button
                v-if="message.results.length > message.visibleResultsCount"
                @click.stop="showMoreResults(message)"
                class="w-full mt-2 px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition"
              >
                Show {{ Math.min(message.resultsPerPage, message.results.length - message.visibleResultsCount) }} More Results
              </button>

              <!-- Show Less Button -->
              <button
                v-if="message.visibleResultsCount > 6"
                @click.stop="showLessResults(message)"
                class="w-full mt-2 px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition"
              >
                Show Less
              </button>
            </div>
          </div>
        </div>

        <!-- Loading Message -->
        <div v-else-if="message.type === 'loading'" class="flex justify-start">
          <div class="bg-white dark:bg-neutral-800 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-neutral-200 dark:border-neutral-700">
            <div class="flex items-center gap-2">
              <div class="flex space-x-1">
                <div class="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                <div class="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                <div class="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
              </div>
              <span class="text-sm text-neutral-500 dark:text-neutral-400">Searching...</span>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Input Area -->
    <div class="flex-shrink-0 p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 safe-area-bottom">
      <form @submit.prevent="handleSubmit" class="flex items-center gap-2">
        <input
          v-model="inputText"
          type="text"
          placeholder="Ask your question..."
          class="flex-1 px-4 py-3 rounded-full border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
          :disabled="isLoading"
        />
        <button
          type="submit"
          :disabled="!inputText.trim() || isLoading"
          class="w-12 h-12 rounded-full bg-primary-600 dark:bg-primary-700 text-white flex items-center justify-center hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Icon name="send" size="md" />
        </button>
      </form>
      <!-- AI Disclaimer -->
      <p class="text-xs text-neutral-500 dark:text-neutral-500 text-center mt-2">
        AI can make mistakes. Always verify answers from the original sources.
      </p>
    </div>

    <!-- Question/Dua Detail Modal -->
    <div v-if="showQuestionModal && modalQuestion" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
        <div class="sticky top-0 bg-white dark:bg-neutral-900 border-b dark:border-neutral-800 p-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span v-if="modalQuestion.type === 'dua'" class="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full font-medium">
              Dua
            </span>
            <span v-else class="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">
              Q&A
            </span>
            <h2 class="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {{ modalQuestion.type === 'dua' ? 'Dua' : 'Source Question' }}
            </h2>
          </div>
          <button
            @click="closeQuestionModal"
            class="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition"
          >
            <Icon name="close" size="md" />
          </button>
        </div>

        <div class="p-6 space-y-6">
          <!-- Question Title -->
          <div>
            <h3 class="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              {{ modalQuestion.title }}
            </h3>
          </div>

          <!-- Question Content -->
          <div class="prose prose-sm dark:prose-invert max-w-none">
            <div class="bg-primary-50 dark:bg-primary-950/30 border-l-4 border-primary-500 dark:border-primary-600 p-4 rounded">
              <h4 class="text-sm font-semibold text-primary-900 dark:text-primary-100 mb-2">Question</h4>
              <div class="text-neutral-800 dark:text-neutral-200" v-html="modalQuestion.question"></div>
            </div>
          </div>

          <!-- Answer Content -->
          <div ref="modalAnswerContainer" class="prose prose-sm dark:prose-invert max-w-none">
            <div class="bg-accent-50 dark:bg-accent-950/30 border-l-4 border-accent-500 dark:border-accent-600 p-4 rounded">
              <h4 class="text-sm font-semibold text-accent-900 dark:text-accent-100 mb-2">Answer</h4>
              <div class="text-neutral-800 dark:text-neutral-200" v-html="processedModalAnswer"></div>
            </div>
          </div>
        </div>

        <div class="sticky bottom-0 bg-white dark:bg-neutral-900 border-t dark:border-neutral-800 p-4 flex gap-2">
          <button
            v-if="modalQuestion.type === 'question'"
            @click="viewFullQuestion(modalQuestion.reference)"
            class="flex-1 bg-primary-600 dark:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition"
          >
            View Full Page
          </button>
          <button
            v-else
            disabled
            class="flex-1 bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-6 py-3 rounded-lg font-semibold opacity-50 cursor-not-allowed"
          >
            Full Page N/A
          </button>
          <button
            @click="closeQuestionModal"
            class="flex-1 bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 px-6 py-3 rounded-lg font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import dexieDb from '@/services/dexieDatabase'
import dataLoader from '@/services/dataLoader'
import unifiedChatSearchService from '@/services/unifiedChatSearchService'
import { generateToken } from '@/utils/tokenHash'
import { processAnswerLinks } from '@/utils/linkHandler'
import Icon from '@/components/common/Icon.vue'

// n8n proxy endpoint for embeddings
const EMBED_API_URL = 'https://integrationsv2.halerp.com/webhook/encode_search'

const router = useRouter()
const dataStore = useDataStore()

const messages = ref([])
const inputText = ref('')
const isLoading = ref(false)
const messagesContainer = ref(null)
const suggestedQuestions = ref([])
const searchMode = ref('') // 'semantic' or 'keyword'

// Modal state
const showQuestionModal = ref(false)
const modalQuestion = ref(null)
const processedModalAnswer = ref('')
const modalAnswerContainer = ref(null)
const showClearConfirm = ref(false)

// AI data import state
const aiDataMissing = ref(false)
const isImportingAi = ref(false)
const importProgress = ref(0)
const importStep = ref('')

// LocalStorage key for persistence
const STORAGE_KEY = 'islamqa_chat_messages'

// Save messages to localStorage
const saveMessages = () => {
  try {
    // Only save user and assistant messages (not loading)
    const toSave = messages.value.filter(m => m.type !== 'loading')
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch (error) {
    console.warn('Failed to save messages:', error)
  }
}

// Load messages from localStorage
const loadSavedMessages = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        messages.value = parsed
        return true
      }
    }
  } catch (error) {
    console.warn('Failed to load saved messages:', error)
  }
  return false
}

// Clear conversation
const clearConversation = () => {
  messages.value = []
  localStorage.removeItem(STORAGE_KEY)
  showClearConfirm.value = false
}

// Watch for message changes and persist
watch(messages, () => {
  saveMessages()
}, { deep: true })

// Scroll to bottom of messages
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Show more results with pagination
const showMoreResults = async (message) => {
  message.visibleResultsCount += message.resultsPerPage
  await nextTick()
  await scrollToBottom()
}

// Show less results (collapse to initial view)
const showLessResults = (message) => {
  message.visibleResultsCount = 6
}

// Get query embedding via n8n proxy
const getQueryEmbedding = async (text) => {
  try {
    // Generate token from query + timestamp
    const timestamp = Date.now()
    const token = generateToken(text, timestamp)

    const response = await fetch(EMBED_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: text,
        timestamp,
        token
      })
    })

    if (!response.ok) {
      throw new Error(`Embedding API error: ${response.status}`)
    }

    const data = await response.json()
    return data.embedding || null
  } catch (error) {
    console.warn('Failed to get query embedding:', error)
    return null
  }
}

// Get ruling badge class
const getRulingClass = (ruling) => {
  const classes = {
    halal: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    haram: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    makruh: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
    mubah: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    mustahabb: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300',
    wajib: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
  }
  return classes[ruling] || 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300'
}

// Format ruling for display
const formatRuling = (ruling) => {
  const labels = {
    halal: 'Halal (Permissible)',
    haram: 'Haram (Forbidden)',
    makruh: 'Makruh (Disliked)',
    mubah: 'Mubah (Neutral)',
    mustahabb: 'Mustahabb (Recommended)',
    wajib: 'Wajib (Obligatory)'
  }
  return labels[ruling] || ruling
}

// Handle form submission
const handleSubmit = () => {
  if (!inputText.value.trim() || isLoading.value) return
  askQuestion(inputText.value.trim())
  inputText.value = ''
}

// Ask a question
const askQuestion = async (question) => {
  // Add user message
  messages.value.push({
    type: 'user',
    content: question
  })

  // Add loading indicator
  messages.value.push({
    type: 'loading'
  })

  isLoading.value = true
  await scrollToBottom()

  try {
    // Try to get query embedding for semantic search
    const queryEmbedding = await getQueryEmbedding(question)

    // Search for relevant answers AND duas using unified service
    // Request more results for pagination (6 initial + more for "Show More" button)
    const results = unifiedChatSearchService.search(question, 20, queryEmbedding)

    // Update search mode indicator
    if (results.length > 0 && results[0].matchType === 'vector') {
      searchMode.value = 'semantic'
    } else {
      searchMode.value = 'keyword'
    }

    const response = unifiedChatSearchService.formatAsResponse(results, question)

    // Count questions and duas in results
    const questionCount = results.filter(r => r.resultType === 'question').length
    const duaCount = results.filter(r => r.resultType === 'dua').length

    // Remove loading indicator
    messages.value = messages.value.filter(m => m.type !== 'loading')

    // Add assistant response
    messages.value.push({
      type: 'assistant',
      content: response.message,
      ruling: response.ruling,
      similarity: response.similarity,
      results: response.results,
      questionCount,
      duaCount,
      visibleResultsCount: 6,
      resultsPerPage: 6
    })

  } catch (error) {
    console.error('Search error:', error)
    messages.value = messages.value.filter(m => m.type !== 'loading')
    messages.value.push({
      type: 'assistant',
      content: 'Sorry, I encountered an error while searching. Please try again.',
      results: [],
      visibleResultsCount: 6,
      resultsPerPage: 6
    })
  }

  isLoading.value = false
  await scrollToBottom()
}

/**
 * Setup click handlers for TOC (Table of Contents) links in modal
 * Handles smooth scrolling to anchor elements within the modal
 */
function setupModalTocLinkHandlers(container) {
  if (!container) return

  // Find all TOC links marked by processAnswerLinks
  const tocLinks = container.querySelectorAll('a[data-toc-link], a.toc-link, a[href^="#"]')
  console.log(`📍 Found ${tocLinks.length} TOC links in modal`)

  tocLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      const anchorId = link.getAttribute('data-toc-anchor')
      if (!anchorId) return

      console.log(`🖱️  Modal TOC link clicked for anchor: ${anchorId}`)
      event.preventDefault()
      event.stopImmediatePropagation()

      const targetElement = document.getElementById(anchorId)
      if (targetElement) {
        console.log('✅ Scrolling to TOC section in modal:', anchorId)
        // Scroll within the modal container
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        console.warn('❌ TOC target not found in modal:', anchorId)
      }
    }, true)
  })
}

// Open result (question or dua) in modal
const openResult = async (result) => {
  if (result.resultType === 'question') {
    openQuestion(result.reference)
  } else if (result.resultType === 'dua') {
    openDua(result)
  }
}

// Open question detail in modal
const openQuestion = async (reference) => {
  try {
    const question = await dataStore.getQuestion(reference)
    if (question) {
      modalQuestion.value = question
      // Process answer links to convert cross-answer links and handle TOC anchors
      if (question.answer) {
        processedModalAnswer.value = processAnswerLinks(question.answer)
      }
      showQuestionModal.value = true

      // Setup link handlers after content is rendered
      await nextTick()
      if (modalAnswerContainer.value) {
        setupModalTocLinkHandlers(modalAnswerContainer.value)
        console.log('Modal TOC link handlers setup complete')
      }
    }
  } catch (error) {
    console.error('Error loading question:', error)
  }
}

// Open dua detail in modal (same modal as questions for simplicity)
const openDua = async (dua) => {
  try {
    // DEBUG: Log dua object structure
    console.log('Opening dua:', {
      id: dua.id,
      title: dua.title,
      hasArabic: !!dua.arabic,
      hasTranslit: !!dua.transliteration,
      hasTranslation: !!dua.translation,
      hasVirtue: !!dua.virtue,
      allKeys: Object.keys(dua).join(', ')
    })

    // Use the dua object directly (already loaded)
    const question = {
      reference: dua.id,
      title: dua.title,
      question: `<div class="space-y-4">
        <div>
          <h4 class="font-semibold text-sm mb-2">Arabic:</h4>
          <p class="text-neutral-700 dark:text-neutral-300 mb-4">${dua.arabic || ''}</p>
        </div>
        <div>
          <h4 class="font-semibold text-sm mb-2">Transliteration:</h4>
          <p class="text-neutral-700 dark:text-neutral-300 mb-4">${dua.transliteration || ''}</p>
        </div>
        <div>
          <h4 class="font-semibold text-sm mb-2">Translation:</h4>
          <p class="text-neutral-700 dark:text-neutral-300">${dua.translation || ''}</p>
        </div>
      </div>`,
      answer: dua.virtue || 'No virtues documented',
      category: dua.category_name,
      type: 'dua'
    }

    modalQuestion.value = question
    processedModalAnswer.value = question.answer

    showQuestionModal.value = true

    await nextTick()
    if (modalAnswerContainer.value) {
      setupModalTocLinkHandlers(modalAnswerContainer.value)
    }
  } catch (error) {
    console.error('Error loading dua:', error)
  }
}

// Close question modal
const closeQuestionModal = () => {
  showQuestionModal.value = false
  modalQuestion.value = null
}

// Navigate to full question page
const viewFullQuestion = (reference) => {
  closeQuestionModal()
  router.push(`/question/${reference}`)
}

// Go back
const goBack = () => {
  router.back()
}

// Start AI data import
const startAiImport = async () => {
  isImportingAi.value = true
  importProgress.value = 0
  importStep.value = 'Starting import...'

  try {
    await dataLoader.importAiDataOnly((progress) => {
      importProgress.value = progress.progress
      importStep.value = progress.step
    })

    // Reload AI data after import
    const [summaries, embeddings] = await Promise.all([
      loadSummaries(),
      loadEmbeddings()
    ])

    const questions = await dataStore.getAllQuestions()
    await unifiedChatSearchService.initialize(questions, summaries, embeddings, null, null)

    aiDataMissing.value = false
    isImportingAi.value = false
    importStep.value = 'Import complete!'
  } catch (error) {
    console.error('AI import failed:', error)
    importStep.value = 'Import failed. Please try again.'
    isImportingAi.value = false
  }
}

// Load summaries from Dexie (with JSON fallback)
const loadSummaries = async () => {
  try {
    // First try to load from Dexie
    const summaries = await dexieDb.getAllSummaries()
    if (Object.keys(summaries).length > 0) {
      console.log(`Loaded ${Object.keys(summaries).length} summaries from Dexie`)
      return summaries
    }

    // Fallback to JSON files (for first-time users before import completes)
    console.log('No summaries in Dexie, trying JSON fallback...')
    const fallbackSummaries = {}
    for (let i = 1; i <= 20; i++) {
      const batchNum = String(i).padStart(3, '0')
      try {
        const response = await fetch(`./data/summaries/batch_${batchNum}.json`)
        if (response.ok) {
          const batch = await response.json()
          Object.assign(fallbackSummaries, batch.summaries)
        }
      } catch (e) {
        // Batch file doesn't exist yet, skip
      }
    }
    return fallbackSummaries
  } catch (error) {
    console.warn('Error loading summaries:', error)
    return {}
  }
}

// Load embeddings from Dexie (with JSON fallback)
const loadEmbeddings = async () => {
  try {
    // First try to load from Dexie
    const embeddings = await dexieDb.getAllEmbeddings()
    if (Object.keys(embeddings).length > 0) {
      console.log(`Loaded ${Object.keys(embeddings).length} embeddings from Dexie`)
      return embeddings
    }

    // Fallback to JSON file (for first-time users before import completes)
    console.log('No embeddings in Dexie, trying JSON fallback...')
    const response = await fetch('./data/embeddings.json')
    if (response.ok) {
      const data = await response.json()
      console.log(`Loaded embeddings from JSON: ${data.metadata?.total || 0} vectors`)
      return data.embeddings || {}
    }
  } catch (error) {
    console.warn('Error loading embeddings:', error)
  }
  return {}
}

// Load dua embeddings from JSON
const loadDuaEmbeddings = async () => {
  try {
    const response = await fetch('./data/dua-embeddings.json')
    if (response.ok) {
      const duaEmbeddings = await response.json()
      console.log(`Loaded ${Object.keys(duaEmbeddings).length} dua embeddings`)
      return duaEmbeddings
    }
  } catch (error) {
    console.warn('Error loading dua embeddings:', error)
  }
  return {}
}

// Helper function to load all duas from category JSON files
const loadAllDuas = async () => {
  const allDuas = []
  const duaFiles = [
    'morning', 'evening', 'before-sleep', 'after-salah', 'salah', 'travel',
    'food-drink', 'money-shopping', 'marriage-children', 'death', 'nature',
    'istighfar', 'difficulties-happiness', 'dhikr-all-times', 'waking-up',
    'evening', 'protection-iman', 'praises-allah', 'ruqyah-illness',
    'quranic-duas', 'sunnah-duas', 'adhan-masjid', 'salawat', 'hajj-umrah',
    'gatherings', 'home', 'clothes'
  ]

  for (const file of duaFiles) {
    try {
      const response = await fetch(`./data/dua/${file}.json`)
      if (response.ok) {
        const content = await response.json()
        if (content.duas && Array.isArray(content.duas)) {
          allDuas.push(...content.duas.map(dua => ({
            ...dua,
            source_file: `${file}.json`,  // Add source file (with .json) for composite key matching with embeddings
            category_id: content.category_id,
            category_name: content.category_name
          })))
        }
      }
    } catch (error) {
      // File may not exist, skip
    }
  }

  return allDuas
}

// Initialize
onMounted(async () => {
  try {
    // Load saved conversation from localStorage
    const hasSavedMessages = loadSavedMessages()
    if (hasSavedMessages) {
      await scrollToBottom()
    }

    // Check if AI data is available
    const hasAiData = await dexieDb.hasAiData()
    if (!hasAiData) {
      // Check if embeddings.json exists as fallback
      try {
        const response = await fetch('./data/embeddings.json', { method: 'HEAD' })
        if (!response.ok) {
          aiDataMissing.value = true
          return
        }
      } catch {
        aiDataMissing.value = true
        return
      }
    }

    // Load questions and duas in parallel
    const questions = await dataStore.getAllQuestions()
    const duas = await loadAllDuas()

    // DEBUG: Verify source_file is added to duas
    const duaWithSourceFile = duas.find(d => d.source_file)
    if (duaWithSourceFile) {
      console.log(`✓ Duas have source_file: ${duaWithSourceFile.source_file}:${duaWithSourceFile.id}`)
    } else {
      console.warn(`✗ PROBLEM: Duas missing source_file field!`)
      console.warn(`Sample dua keys:`, Object.keys(duas[0]).join(', '))
    }

    // Load AI summaries, question embeddings, and dua embeddings in parallel
    const [summaries, embeddings, duaEmbeddings] = await Promise.all([
      loadSummaries(),
      loadEmbeddings(),
      loadDuaEmbeddings()
    ])

    // Check if we actually have question embeddings
    if (Object.keys(embeddings).length === 0) {
      aiDataMissing.value = true
      return
    }

    // Initialize unified search service with questions AND duas
    await unifiedChatSearchService.initialize(
      questions,
      duas,
      summaries,
      embeddings,
      duaEmbeddings
    )

    // Get suggested questions
    suggestedQuestions.value = unifiedChatSearchService.getSuggestedQuestions()

    console.log(`Chat service initialized: ${questions.length} questions, ${duas.length} duas`)
    console.log(`Embeddings: Questions=${Object.keys(embeddings).length}, Duas=${Object.keys(duaEmbeddings).length}`)

    // Scroll to last message after initialization
    await scrollToBottom()
  } catch (error) {
    console.error('Error initializing chat:', error)
  }
})
</script>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Prose styling for modal content */
.prose {
  font-size: 1rem;
  line-height: 1.6;
}

.prose :deep(p) {
  margin-bottom: 1rem;
}

.prose :deep(strong) {
  font-weight: 600;
  color: #111827;
}

.dark .prose :deep(strong) {
  color: #f3f4f6;
}

.prose :deep(em) {
  font-style: italic;
}

/* Link styles */
.prose :deep(a) {
  color: #059669;
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.2s;
}

.prose :deep(a:hover) {
  color: #047857;
}

.dark .prose :deep(a) {
  color: #34d399;
}

.dark .prose :deep(a:hover) {
  color: #10b981;
}

/* Table of Contents styling */
.prose :deep(#toc_container) {
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.dark .prose :deep(#toc_container) {
  background-color: #064e3b;
  border-color: #065f46;
}

.prose :deep(.toc_title) {
  font-weight: 600;
  font-size: 1.125rem;
  color: #065f46;
  margin-bottom: 0.75rem;
}

.dark .prose :deep(.toc_title) {
  color: #6ee7b7;
}

.prose :deep(.toc_list) {
  list-style: none;
  padding-left: 0;
}

.prose :deep(.toc_list li) {
  margin-bottom: 0.5rem;
}

/* Section headers with anchors */
.prose :deep(h3 span[id]) {
  scroll-margin-top: 80px;
}

.prose :deep(ul),
.prose :deep(ol) {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.prose :deep(li) {
  margin-bottom: 0.5rem;
}
</style>
