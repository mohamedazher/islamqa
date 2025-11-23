<template>
  <div class="chat-view h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
    <!-- Header -->
    <header class="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white p-4 shadow flex-shrink-0">
      <div class="flex items-center gap-3">
        <button @click="goBack" class="hover:opacity-80 transition-opacity flex-shrink-0">
          <Icon name="arrowLeft" size="md" />
        </button>
        <div class="flex items-center gap-2">
          <Icon name="sparkles" size="md" />
          <h1 class="text-lg font-bold">Ask Islam</h1>
        </div>
        <div v-if="searchMode" class="ml-auto text-xs bg-white/20 px-2 py-1 rounded">
          {{ searchMode }}
        </div>
      </div>
    </header>

    <!-- Chat Messages -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-4"
    >
      <!-- Welcome Message -->
      <div v-if="messages.length === 0" class="text-center py-8">
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import dexieDb from '@/services/dexieDatabase'
import chatSearchService from '@/services/chatSearchService'
import Icon from '@/components/common/Icon.vue'

// Gemini API key for query embeddings
const GEMINI_API_KEY = 'AIzaSyAEma46H6zePFRvQnp8ccfkOPI9eb7mbR8'

const router = useRouter()
const dataStore = useDataStore()

const messages = ref([])
const inputText = ref('')
const isLoading = ref(false)
const messagesContainer = ref(null)
const suggestedQuestions = ref([])
const searchMode = ref('') // 'semantic' or 'keyword'

// Scroll to bottom of messages
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Get query embedding from Gemini API
const getQueryEmbedding = async (text) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: {
            parts: [{ text }]
          }
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    return data.embedding?.values || null
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

// Open question detail
const openQuestion = (reference) => {
  router.push(`/question/${reference}`)
}

// Go back
const goBack = () => {
  router.back()
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
    // Load questions
    const questions = await dataStore.getAllQuestions()

    // Load AI summaries and embeddings in parallel
    const [summaries, embeddings] = await Promise.all([
      loadSummaries(),
      loadEmbeddings()
    ])

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
