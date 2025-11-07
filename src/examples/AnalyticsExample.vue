<!--
  Firebase Analytics Usage Example

  This example shows how to use Firebase Analytics in your Vue components.
  Copy these patterns into your actual components as needed.
-->

<template>
  <div class="analytics-example">
    <h1>Analytics Integration Examples</h1>

    <!-- Example 1: Track button clicks -->
    <button @click="handleQuestionView">
      View Question
    </button>

    <!-- Example 2: Track search -->
    <input
      v-model="searchQuery"
      @input="handleSearch"
      placeholder="Search questions..."
    >

    <!-- Example 3: Track folder creation -->
    <button @click="handleCreateFolder">
      Create Folder
    </button>

    <!-- Example 4: Track share action -->
    <button @click="handleShare">
      Share Question
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAnalytics } from '@/services/analytics'

// Initialize analytics composable
const {
  logEvent,
  logQuestionView,
  logSearch,
  logFolderAction,
  logShare
} = useAnalytics()

const searchQuery = ref('')

// Example 1: Track when user views a question
const handleQuestionView = () => {
  const questionId = 123 // Replace with actual question ID
  const category = 'Fiqh' // Replace with actual category

  // Use the specialized method
  logQuestionView(questionId, category)

  // Or use generic logEvent
  logEvent('question_viewed', {
    question_id: questionId,
    category: category,
    source: 'search' // Additional context
  })
}

// Example 2: Track search queries
const handleSearch = () => {
  if (searchQuery.value.length >= 3) {
    const resultCount = 42 // Replace with actual result count

    // Use the specialized method
    logSearch(searchQuery.value, resultCount)
  }
}

// Example 3: Track folder creation
const handleCreateFolder = () => {
  const folderName = 'My Favorites' // Replace with actual folder name

  // Use the specialized method
  logFolderAction('create', folderName)
}

// Example 4: Track sharing
const handleShare = () => {
  const questionId = 123 // Replace with actual question ID

  // Use the specialized method
  logShare('question', questionId)
}

// Example 5: Track custom events
const handleCustomEvent = () => {
  logEvent('custom_action', {
    action_type: 'button_click',
    button_name: 'special_feature',
    user_level: 'advanced',
    timestamp: Date.now()
  })
}
</script>

<style scoped>
.analytics-example {
  padding: 20px;
}

button {
  margin: 10px;
  padding: 10px 20px;
}

input {
  margin: 10px;
  padding: 10px;
  width: 300px;
}
</style>

<!--
  INTEGRATION PATTERNS:

  1. Screen Views (Automatic):
     - Already tracked in router/index.js
     - Logs every page navigation automatically

  2. Question Views:
     import { useAnalytics } from '@/services/analytics'
     const { logQuestionView } = useAnalytics()
     logQuestionView(questionId, categoryName)

  3. Search:
     const { logSearch } = useAnalytics()
     logSearch(searchTerm, resultCount)

  4. Category Views:
     const { logCategoryView } = useAnalytics()
     logCategoryView(categoryName, categoryId)

  5. Folder Actions:
     const { logFolderAction } = useAnalytics()
     logFolderAction('create', folderName)
     logFolderAction('add_question', folderName)
     logFolderAction('remove_question', folderName)
     logFolderAction('delete', folderName)

  6. Share:
     const { logShare } = useAnalytics()
     logShare('question', questionId)
     logShare('answer', answerId)

  7. Quiz Events:
     const { logQuizEvent } = useAnalytics()
     logQuizEvent('start', { category: 'Fiqh' })
     logQuizEvent('complete', { score: 85, questions: 10 })
     logQuizEvent('answer', { correct: true, question_id: 123 })

  8. User Properties:
     const { setUserProperties } = useAnalytics()
     setUserProperties({
       theme_preference: 'dark',
       language: 'en',
       data_imported: 'true'
     })

  9. Generic Events:
     const { logEvent } = useAnalytics()
     logEvent('custom_event_name', {
       param1: 'value1',
       param2: 'value2'
     })
-->
