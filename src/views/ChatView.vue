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
            <!-- Summary Response -->
            <p class="text-sm text-neutral-800 dark:text-neutral-200 mb-3">{{ message.content }}</p>

            <!-- Ruling Badge -->
            <div v-if="message.ruling" class="mb-3">
              <span :class="getRulingClass(message.ruling)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ formatRuling(message.ruling) }}
              </span>
            </div>

            <!-- Similarity Score -->
            <div v-if="message.similarity" class="mb-2">
              <span class="text-xs text-neutral-500">
                Relevance: {{ Math.round(message.similarity * 100) }}%
              </span>
            </div>

            <!-- Source Cards -->
            <div v-if="message.results && message.results.length > 0" class="space-y-2 mt-3">
              <p class="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Sources:</p>
              <div
                v-for="result in message.results.slice(0, 3)"
                :key="result.reference"
                @click="openQuestion(result.reference)"
                class="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-3 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition border border-neutral-200 dark:border-neutral-700"
              >
                <div class="flex items-start justify-between gap-2">
                  <h4 class="text-sm font-medium text-neutral-900 dark:text-neutral-100 line-clamp-2 mb-1 flex-1">
                    {{ result.title }}
                  </h4>
                  <span v-if="result.similarity" class="text-xs text-primary-600 dark:text-primary-400 whitespace-nowrap">
                    {{ Math.round(result.similarity * 100) }}%
                  </span>
                </div>
                <p v-if="result.summary" class="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                  {{ result.summary }}
                </p>
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

    <!-- Question Detail Modal -->
    <div v-if="showQuestionModal && modalQuestion" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
        <div class="sticky top-0 bg-white dark:bg-neutral-900 border-b dark:border-neutral-800 p-4 flex items-center justify-between">
          <h2 class="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">Source Question</h2>
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
          <div class="prose dark:prose-invert max-w-none">
            <div class="bg-primary-50 dark:bg-primary-950/30 border-l-4 border-primary-500 dark:border-primary-600 p-4 rounded">
              <h4 class="text-sm font-semibold text-primary-900 dark:text-primary-100 mb-2">Question</h4>
              <div class="text-neutral-800 dark:text-neutral-200 text-sm" v-html="modalQuestion.question"></div>
            </div>
          </div>

          <!-- Answer Content -->
          <div class="prose dark:prose-invert max-w-none">
            <div class="bg-accent-50 dark:bg-accent-950/30 border-l-4 border-accent-500 dark:border-accent-600 p-4 rounded">
              <h4 class="text-sm font-semibold text-accent-900 dark:text-accent-100 mb-2">Answer</h4>
              <div class="text-neutral-800 dark:text-neutral-200 text-sm" v-html="modalQuestion.answer"></div>
            </div>
          </div>
        </div>

        <div class="sticky bottom-0 bg-white dark:bg-neutral-900 border-t dark:border-neutral-800 p-4 flex gap-2">
          <button
            @click="viewFullQuestion(modalQuestion.reference)"
            class="flex-1 bg-primary-600 dark:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition"
          >
            View Full Page
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
import chatSearchService from '@/services/chatSearchService'
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

// Get query embedding via n8n proxy
const getQueryEmbedding = async (text) => {
  try {
    // Create request with timestamp (validates request is fresh)
    const timestamp = Date.now()
    // API key from environment variable
    const apiKey = import.meta.env.VITE_EMBED_API_KEY || 'islamqa_embed_2024'

    const response = await fetch(EMBED_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        query: text,
        timestamp
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

    // Search for relevant answers
    const results = chatSearchService.search(question, 5, queryEmbedding)

    // Update search mode indicator
    if (results.length > 0 && results[0].matchType === 'vector') {
      searchMode.value = 'semantic'
    } else {
      searchMode.value = 'keyword'
    }

    const response = chatSearchService.formatAsResponse(results, question)

    // Remove loading indicator
    messages.value = messages.value.filter(m => m.type !== 'loading')

    // Add assistant response
    messages.value.push({
      type: 'assistant',
      content: response.message,
      ruling: response.ruling,
      similarity: response.similarity,
      results: response.results
    })

  } catch (error) {
    console.error('Search error:', error)
    messages.value = messages.value.filter(m => m.type !== 'loading')
    messages.value.push({
      type: 'assistant',
      content: 'Sorry, I encountered an error while searching. Please try again.',
      results: []
    })
  }

  isLoading.value = false
  await scrollToBottom()
}

// Open question detail in modal
const openQuestion = async (reference) => {
  try {
    const question = await dataStore.getQuestion(reference)
    if (question) {
      modalQuestion.value = question
      showQuestionModal.value = true
    }
  } catch (error) {
    console.error('Error loading question:', error)
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
    await chatSearchService.initialize(questions, summaries, embeddings)

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

    // Load questions
    const questions = await dataStore.getAllQuestions()

    // Load AI summaries and embeddings in parallel
    const [summaries, embeddings] = await Promise.all([
      loadSummaries(),
      loadEmbeddings()
    ])

    // Check if we actually have embeddings
    if (Object.keys(embeddings).length === 0) {
      aiDataMissing.value = true
      return
    }

    // Initialize chat search service with embeddings
    await chatSearchService.initialize(questions, summaries, embeddings)

    // Get suggested questions
    suggestedQuestions.value = chatSearchService.getSuggestedQuestions()

    console.log('Chat service initialized with semantic search')
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
</style>
