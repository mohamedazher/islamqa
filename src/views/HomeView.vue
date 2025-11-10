<template>
  <div class="home-view min-h-screen">
    <!-- Hero Section - Desktop only -->
    <div class="hidden lg:block bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 dark:from-emerald-500 dark:via-teal-500 dark:to-cyan-600 text-white">
      <div class="max-w-7xl mx-auto px-6 xl:px-8 py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl xl:text-4xl font-bold mb-2">As-salamu alaykum</h1>
            <p class="text-lg text-white/90">Continue your Islamic learning journey</p>
          </div>
          <div class="bg-white/20 backdrop-blur-md rounded-2xl p-5 min-w-[180px]">
            <div class="text-center">
              <div class="text-xs text-white/80 mb-1">Your Level</div>
              <div class="text-3xl font-bold mb-1">{{ gamification.currentLevel }}</div>
              <div class="text-xs text-white/80">{{ gamification.points }} XP</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Container -->
    <div class="max-w-7xl mx-auto px-4 lg:px-6 xl:px-8 py-6 lg:py-8">
      <!-- Mobile Header -->
      <div class="lg:hidden mb-6">
        <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">As-salamu alaykum</h2>
        <p class="text-neutral-600 dark:text-neutral-400">Continue your Islamic learning journey</p>
      </div>

      <!-- Import Banner -->
      <div v-if="!dataStore.isReady" class="mb-6 animate-slide-up">
        <Card padding="md" class="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800/30">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-amber-100 dark:bg-amber-800/30 rounded-lg flex items-center justify-center">
              <Icon name="download" size="lg" class="text-amber-700 dark:text-amber-400" />
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-amber-900 dark:text-amber-100 mb-1">Welcome! Let's Get Started</h3>
              <p class="text-sm text-amber-800 dark:text-amber-300 mb-3">
                Import the Islamic Q&A database to access thousands of answers from authentic sources.
              </p>
              <Button variant="primary" size="md" @click="startImport">
                <template #icon>
                  <Icon name="download" size="md" />
                </template>
                Start Import
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <!-- Question of the Day -->
      <div v-if="dataStore.isReady && questionOfTheDay" class="mb-8 animate-slide-up">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 px-1">Question of the Day</h3>
        <!-- UPDATED: Changed .id to .reference, .question to .title -->
        <Card
          clickable
          padding="lg"
          @click="viewQuestion(questionOfTheDay.reference)"
          class="relative overflow-hidden bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 dark:from-emerald-500 dark:via-teal-500 dark:to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
        >
          <!-- Decorative background pattern -->
          <div class="absolute inset-0 opacity-10">
            <div class="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
            <div class="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
          </div>

          <div class="relative">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-2">
                <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Icon name="star" size="md" class="text-white" />
                </div>
                <div class="text-xs font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  {{ new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }}
                </div>
              </div>
              <div class="text-xs font-bold bg-accent-400/80 dark:bg-accent-600/80 px-3 py-1 rounded-full">
                Daily
              </div>
            </div>

            <h4 class="text-xl font-bold mb-3 line-clamp-3 leading-relaxed">
              {{ questionOfTheDay.title }}
            </h4>

            <div class="flex items-center gap-4 text-sm">
              <div class="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Icon name="book" size="xs" class="text-white" />
                <span>Read Answer</span>
              </div>
              <div class="flex items-center gap-1 bg-accent-400/90 dark:bg-accent-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full font-semibold">
                <Icon name="lightning" size="xs" class="text-white" />
                <span>Earn 10 XP</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Quick Actions Grid -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 px-1">Quick Access</h3>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <Card
            v-for="action in quickActions"
            :key="action.name"
            clickable
            padding="md"
            @click="navigate(action.to)"
            class="group relative overflow-hidden hover:shadow-lg transition-all duration-300"
            :class="action.color"
          >
            <div class="relative">
              <div class="flex flex-col items-center text-center space-y-3">
                <div class="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md"
                  :class="action.iconBg"
                >
                  <Icon :name="action.icon" size="xl" :class="action.iconColor" />
                </div>
                <div>
                  <h4 class="font-bold text-neutral-900 dark:text-neutral-100 mb-1 flex items-center justify-center gap-1">
                    {{ action.name }}
                    <span
                      v-if="action.badge"
                      class="px-1.5 py-0.5 text-2xs font-bold rounded-full bg-accent-500 dark:bg-accent-600 text-white animate-pulse"
                    >
                      {{ action.badge }}
                    </span>
                  </h4>
                  <p class="text-2xs lg:text-xs text-neutral-600 dark:text-neutral-400">{{ action.description }}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- Random Questions Carousel -->
      <div v-if="dataStore.isReady && randomQuestions.length > 0" class="mb-8">
        <div class="flex items-center justify-between mb-4 px-1">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Explore Questions</h3>
          <button
            @click="refreshRandomQuestions"
            class="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
          >
            <Icon name="lightning" size="xs" />
            Refresh
          </button>
        </div>

        <!-- Horizontal Scrolling Container -->
        <div class="relative -mx-4 px-4 lg:-mx-0 lg:px-0">
          <div ref="carouselContainer" class="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide lg:grid lg:grid-cols-3 lg:overflow-visible scroll-smooth">
            <!-- UPDATED: Changed .id to .reference, .question to .title, .question_no to .reference -->
            <Card
              v-for="question in randomQuestions"
              :key="question.reference"
              clickable
              padding="md"
              @click="viewQuestion(question.reference)"
              class="flex-shrink-0 w-[85%] sm:w-[70%] lg:w-auto snap-start group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800 border border-neutral-200 dark:border-neutral-700"
            >
              <div class="space-y-3">
                <!-- Category Badge -->
                <div class="flex items-center justify-between">
                  <div v-if="question.categoryName" class="text-2xs font-bold uppercase tracking-wide text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/30 px-2 py-1 rounded truncate max-w-[150px]">
                    {{ question.categoryName }}
                  </div>
                  <Icon name="arrowRight" size="xs" class="text-neutral-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                </div>

                <!-- Question Preview -->
                <h4 class="font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-3 leading-relaxed min-h-[3.75rem]">
                  {{ question.title }}
                </h4>

                <!-- Meta Info -->
                <div class="flex items-center gap-3 text-2xs text-neutral-600 dark:text-neutral-400">
                  <div class="flex items-center gap-1">
                    <Icon name="document" size="xs" />
                    <span>Q{{ question.reference }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <Icon name="book" size="xs" />
                    <span>Full Answer</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <!-- Stats & Progress Section -->
      <div v-if="dataStore.isReady" class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
        <!-- Gamification Progress Card -->
        <Card padding="lg" class="lg:col-span-2 bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-purple-900/20 dark:via-neutral-900 dark:to-purple-900/20">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1 flex items-center gap-2">
                <Icon name="xp" size="md" class="text-purple-600 dark:text-purple-400" />
                Your Progress (XP)
              </h3>
              <p class="text-sm text-neutral-600 dark:text-neutral-400">Experience from all activities</p>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">{{ gamification.currentLevel }}</div>
              <div class="text-xs text-neutral-600 dark:text-neutral-400">Level</div>
            </div>
          </div>

          <!-- XP Progress Bar -->
          <div class="mb-4">
            <div class="flex items-center justify-between text-sm mb-2">
              <span class="font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                <Icon name="xp" size="xs" class="text-purple-600 dark:text-purple-400" />
                {{ gamification.points }} XP
              </span>
              <span class="text-neutral-600 dark:text-neutral-400">{{ gamification.pointsToNextLevel }} to next level</span>
            </div>
            <div class="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3 overflow-hidden">
              <div
                class="bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 h-3 rounded-full transition-all duration-700 ease-out"
                :style="{ width: gamification.levelProgress + '%' }"
              ></div>
            </div>
          </div>

          <!-- QP Section -->
          <div class="mb-4 p-3 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800/30">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Icon name="qp" size="md" class="text-amber-600 dark:text-amber-400" />
                <div>
                  <div class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Quiz Points (QP)</div>
                  <div class="text-xs text-neutral-600 dark:text-neutral-400">Your competitive ranking</div>
                </div>
              </div>
              <button
                @click="navigate('/leaderboard')"
                class="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 text-white text-xs font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm"
              >
                View Rank
              </button>
            </div>
          </div>

          <!-- Streak -->
          <div v-if="gamification.streak > 0" class="flex items-center gap-2 text-sm">
            <Icon name="fire" size="lg" class="text-orange-500 dark:text-orange-400" />
            <span class="font-semibold text-neutral-900 dark:text-neutral-100">{{ gamification.streak }} day streak!</span>
            <span class="text-neutral-600 dark:text-neutral-400">Keep it up!</span>
          </div>
        </Card>

        <!-- Tier Card -->
        <Card padding="lg" v-if="gamification.currentTier">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Your Tier</h3>
            <span class="text-3xl">{{ gamification.currentTier.icon }}</span>
          </div>
          <div class="flex items-center gap-3 mb-4">
            <div class="text-2xl font-bold" :style="{ color: gamification.currentTier.color }">
              {{ gamification.currentTier.name }}
            </div>
            <div class="text-sm text-neutral-600 dark:text-neutral-400">
              {{ gamification.currentTier.benefits }}
            </div>
          </div>
          <div v-if="gamification.nextTier">
            <div class="flex items-center justify-between text-xs mb-2">
              <span class="text-neutral-600 dark:text-neutral-400">Next: {{ gamification.nextTier.name }}</span>
              <span class="font-medium text-neutral-700 dark:text-neutral-300">{{ gamification.tierProgress }}%</span>
            </div>
            <div class="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-700"
                :style="{ width: gamification.tierProgress + '%', backgroundColor: gamification.nextTier.color }"
              ></div>
            </div>
          </div>
          <div v-else class="text-sm text-primary-600 dark:text-primary-400 font-medium">
            🎉 Maximum tier achieved!
          </div>
        </Card>

        <!-- Stats Card -->
        <Card padding="lg">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Your Stats</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Icon name="document" size="md" class="text-blue-700 dark:text-blue-400" />
                </div>
                <div>
                  <div class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{{ gamification.stats.questionsRead }}</div>
                  <div class="text-xs text-neutral-600 dark:text-neutral-400">Questions Read</div>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Icon name="bookmark" size="md" class="text-green-700 dark:text-green-400" />
                </div>
                <div>
                  <div class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{{ gamification.stats.bookmarksCreated }}</div>
                  <div class="text-xs text-neutral-600 dark:text-neutral-400">Bookmarks Created</div>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Icon name="lightning" size="md" class="text-purple-700 dark:text-purple-400" />
                </div>
                <div>
                  <div class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{{ gamification.stats.quizzesCompleted }}</div>
                  <div class="text-xs text-neutral-600 dark:text-neutral-400">Quizzes Completed</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Recent Achievements -->
      <div v-if="dataStore.isReady && recentAchievements.length > 0" class="mb-8">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 px-1">Recent Achievements</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            v-for="achievement in recentAchievements"
            :key="achievement.id"
            padding="md"
            class="bg-gradient-to-br from-white to-accent-50 dark:from-neutral-900 dark:to-accent-900/20 border-accent-200 dark:border-accent-800/30"
          >
            <div class="flex items-center gap-3">
              <div class="text-4xl">{{ achievement.icon }}</div>
              <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-neutral-900 dark:text-neutral-100 truncate">{{ achievement.title }}</h4>
                <p class="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">{{ achievement.description }}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- CTA Section - Desktop only -->
      <div class="hidden lg:block">
        <Card padding="lg" class="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 text-white border-0">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-2xl font-bold mb-2">Ready to test your knowledge?</h3>
              <p class="text-primary-100 dark:text-primary-200">Take a quiz and earn points while learning</p>
            </div>
            <Button variant="secondary" size="lg" @click="navigate('/quiz')">
              Start Quiz
              <template #icon>
                <Icon name="lightning" size="md" />
              </template>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import { useGamificationStore } from '@/stores/gamification'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import Icon from '@/components/common/Icon.vue'

const router = useRouter()
const dataStore = useDataStore()
const gamification = useGamificationStore()

const stats = ref({
  categories: 0,
  bookmarks: 0
})

const questionOfTheDay = ref(null)
const randomQuestions = ref([])
const carouselContainer = ref(null)
let autoScrollInterval = null

const quickActions = [
  {
    name: 'Browse',
    icon: 'book',
    description: 'Explore categories',
    to: '/browse',
    color: 'bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-800/20',
    iconBg: 'bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-500 dark:from-blue-500 dark:via-cyan-500 dark:to-teal-600',
    iconColor: 'text-white'
  },
  {
    name: 'Search',
    icon: 'search',
    description: 'Find answers',
    to: '/search',
    color: 'bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-800/20',
    iconBg: 'bg-gradient-to-br from-purple-400 via-pink-400 to-rose-500 dark:from-purple-500 dark:via-pink-500 dark:to-rose-600',
    iconColor: 'text-white'
  },
  {
    name: 'Quiz',
    icon: 'lightning',
    description: 'Test knowledge',
    to: '/quiz',
    badge: 'NEW',
    color: 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-800/20',
    iconBg: 'bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 dark:from-yellow-500 dark:via-orange-500 dark:to-red-500',
    iconColor: 'text-white'
  },
  {
    name: 'Bookmarks',
    icon: 'bookmark',
    description: 'Saved items',
    to: '/bookmarks',
    color: 'bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-800/20',
    iconBg: 'bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 dark:from-emerald-500 dark:via-teal-500 dark:to-cyan-600',
    iconColor: 'text-white'
  }
]

const recentAchievements = computed(() => {
  return gamification.achievements
    .filter(a => a.unlocked)
    .slice(-3)
    .reverse()
})

onMounted(async () => {
  try {
    // Initialize gamification
    gamification.initializeFromStorage()

    // Initialize data store if not ready
    if (!dataStore.isReady) {
      await dataStore.initialize()
    }

    // Load database stats if data is ready
    if (dataStore.isReady) {
      const dbStats = await dataStore.getStats()
      stats.value.categories = dbStats.categories

      const bookmarked = JSON.parse(localStorage.getItem('bookmarkedQuestions') || '[]')
      stats.value.bookmarks = bookmarked.length

      // Load Question of the Day
      await loadQuestionOfTheDay()

      // Load random questions
      await loadRandomQuestions()

      // Start auto-scroll for carousel on mobile
      startAutoScroll()
    }
  } catch (error) {
    console.error('Failed to initialize:', error)
  }
})

onBeforeUnmount(() => {
  // Clean up auto-scroll interval
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval)
  }
})

async function loadQuestionOfTheDay() {
  try {
    // Use today's date as a seed for consistent daily question
    const today = new Date()
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000)

    const allQuestions = await dataStore.getAllQuestions()
    if (allQuestions.length > 0) {
      // Select a consistent question for today
      const questionIndex = dayOfYear % allQuestions.length
      questionOfTheDay.value = allQuestions[questionIndex]

      // Track that user viewed QOTD for gamification
      const lastViewedDate = localStorage.getItem('qotd-last-viewed')
      const todayStr = today.toDateString()
      if (lastViewedDate !== todayStr) {
        localStorage.setItem('qotd-last-viewed', todayStr)
      }
    }
  } catch (error) {
    console.error('Failed to load Question of the Day:', error)
  }
}

async function loadRandomQuestions() {
  try {
    const allQuestions = await dataStore.getAllQuestions()
    if (allQuestions.length > 0) {
      // Select 6 random questions
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5)
      const selectedQuestions = shuffled.slice(0, 6)

      // UPDATED: Changed to use primary_category instead of category_id, title instead of category_links
      // Load category names for each question
      const questionsWithCategories = await Promise.all(
        selectedQuestions.map(async (question) => {
          try {
            if (question.primary_category) {
              const category = await dataStore.getCategory(question.primary_category)
              return {
                ...question,
                categoryName: category?.title || 'Islamic Q&A'
              }
            }
          } catch (error) {
            console.error('Error loading category for question:', question.reference, error)
          }
          return {
            ...question,
            categoryName: 'Islamic Q&A'
          }
        })
      )

      randomQuestions.value = questionsWithCategories
    }
  } catch (error) {
    console.error('Failed to load random questions:', error)
  }
}

async function refreshRandomQuestions() {
  await loadRandomQuestions()
}

function startAutoScroll() {
  // Only auto-scroll on mobile (screen width < 1024px)
  if (window.innerWidth >= 1024) return

  // Auto-scroll every 5 seconds
  autoScrollInterval = setInterval(() => {
    if (!carouselContainer.value) return

    const container = carouselContainer.value
    const cardWidth = container.firstElementChild?.offsetWidth || 0
    const gap = 16 // 1rem gap
    const scrollAmount = cardWidth + gap

    // Check if we're at the end
    if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
      // Reset to beginning
      container.scrollTo({ left: 0, behavior: 'smooth' })
    } else {
      // Scroll to next card
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }, 5000) // 5 seconds
}

function navigate(path) {
  router.push(path)
}

function startImport() {
  router.push('/import')
}

function viewQuestion(questionId) {
  // Award points for viewing QOTD
  if (questionOfTheDay.value && questionId === questionOfTheDay.value.id) {
    const today = new Date().toDateString()
    const lastClaimed = localStorage.getItem('qotd-points-claimed')
    if (lastClaimed !== today) {
      gamification.readQuestion()
      gamification.readQuestion() // Extra points for QOTD (2x5 = 10 points)
      localStorage.setItem('qotd-points-claimed', today)
    }
  } else {
    gamification.readQuestion()
  }

  router.push({
    name: 'question',
    params: { id: questionId }
  })
}
</script>

<style scoped>
/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>
