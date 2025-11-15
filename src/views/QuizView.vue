<template>
  <div class="quiz-view h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
    <!-- Header -->
    <header class="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white p-4 shadow">
      <button @click="goBack" class="hover:opacity-80 transition-opacity mb-3">
        <Icon name="arrowLeft" size="md" />
      </button>
      <div v-if="!currentQuiz" class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Icon name="lightning" size="md" />
          <h1 class="text-xl font-bold">Quiz Mode</h1>
        </div>
        <div class="text-right">
          <div class="text-2xl font-bold">{{ gamification.points }}</div>
          <div class="text-xs text-primary-100">Points</div>
        </div>
      </div>
      <div v-else class="flex items-center justify-between">
        <h1 class="text-xl font-bold">{{ currentQuiz.name }}</h1>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <div class="text-lg font-bold">{{ currentQuestionIndex + 1 }}/{{ currentQuiz.questions.length }}</div>
            <div class="text-xs text-primary-100">Questions</div>
          </div>
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4">
      <!-- First Time Guide Modal -->
      <div v-if="showFirstTimeGuide" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Welcome to Quiz Mode!</h2>
          <div class="space-y-4 text-neutral-700 dark:text-neutral-300">
            <div>
              <h3 class="font-semibold text-primary-600 dark:text-primary-400 mb-1">🎯 How It Works</h3>
              <p class="text-sm">Test your Islamic knowledge with various quiz modes. Choose categories and difficulty levels to customize your learning experience.</p>
            </div>
            <div>
              <h3 class="font-semibold text-primary-600 dark:text-primary-400 mb-1">📚 Quiz Modes</h3>
              <ul class="text-sm space-y-1 list-disc list-inside">
                <li><strong>Daily Quiz:</strong> 5 questions, same for everyone</li>
                <li><strong>Rapid Fire:</strong> 20 quick questions, timed</li>
                <li><strong>Category Quiz:</strong> Choose topics that interest you</li>
                <li><strong>Challenge:</strong> Harder questions for advanced learners</li>
              </ul>
            </div>
            <div>
              <h3 class="font-semibold text-primary-600 dark:text-primary-400 mb-1">⭐ Earn Points</h3>
              <p class="text-sm">Complete quizzes to earn points, maintain streaks, and unlock achievements. Track your progress and level up!</p>
            </div>
          </div>
          <button
            @click="closeFirstTimeGuide"
            class="w-full bg-primary-600 dark:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition mt-6"
          >
            Get Started
          </button>
        </div>
      </div>

      <!-- Quiz Customization Modal -->
      <div v-if="showCustomizationModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white dark:bg-neutral-900 border-b dark:border-neutral-800 p-4">
            <h2 class="text-xl font-bold text-neutral-900 dark:text-neutral-100">Customize Quiz</h2>
          </div>

          <div class="p-4 space-y-6">
            <!-- Difficulty Selection -->
            <div>
              <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Difficulty Level</h3>
              <div class="grid grid-cols-4 gap-2">
                <button
                  v-for="diff in ['all', 'easy', 'medium', 'hard']"
                  :key="diff"
                  @click="selectedDifficulty = diff"
                  :class="[
                    'px-3 py-2 rounded-lg text-sm font-medium transition',
                    selectedDifficulty === diff
                      ? 'bg-primary-600 dark:bg-primary-700 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  ]"
                >
                  {{ diff.charAt(0).toUpperCase() + diff.slice(1) }}
                </button>
              </div>
            </div>

            <!-- Category Selection -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold text-neutral-900 dark:text-neutral-100">Categories</h3>
                <button
                  v-if="availableCategories.length > 0"
                  @click="toggleAllCategories"
                  class="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  {{ selectedCategories.length === availableCategories.length ? 'Deselect All' : 'Select All' }}
                </button>
              </div>
              <div v-if="availableCategories.length === 0" class="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p class="text-sm text-red-900 dark:text-red-100">⚠️ No categories available. Check console for errors.</p>
              </div>
              <div v-else class="space-y-2">
                <button
                  v-for="category in availableCategories"
                  :key="category.reference"
                  @click="toggleCategory(category)"
                  :class="[
                    'w-full px-3 py-2 rounded-lg text-sm text-left transition flex items-center justify-between',
                    selectedCategories.some(c => c.reference === category.reference)
                      ? 'bg-primary-50 dark:bg-primary-950/30 border-2 border-primary-600 dark:border-primary-700 text-primary-900 dark:text-primary-100'
                      : 'bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                  ]"
                >
                  <span>{{ category.title }}</span>
                  <Icon v-if="selectedCategories.some(c => c.reference === category.reference)" name="check" size="xs" class="text-primary-600 dark:text-primary-400" />
                </button>
              </div>
            </div>

            <!-- Number of Questions -->
            <div>
              <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Number of Questions</h3>
              <div class="flex items-center gap-3">
                <button
                  @click="questionCount = Math.max(5, questionCount - 5)"
                  class="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center"
                >
                  <span class="text-xl font-bold">-</span>
                </button>
                <div class="flex-1 text-center">
                  <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ questionCount }}</div>
                  <div class="text-xs text-neutral-600 dark:text-neutral-400">questions</div>
                </div>
                <button
                  @click="questionCount = Math.min(50, questionCount + 5)"
                  class="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center"
                >
                  <span class="text-xl font-bold">+</span>
                </button>
              </div>
            </div>
          </div>

          <div class="sticky bottom-0 bg-white dark:bg-neutral-900 border-t dark:border-neutral-800 p-4 space-y-2">
            <button
              @click="startCustomQuiz"
              :disabled="selectedCategories.length === 0"
              class="w-full bg-primary-600 dark:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Quiz
            </button>
            <button
              @click="closeCustomizationModal"
              class="w-full bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 px-6 py-3 rounded-lg font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-700 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Quiz Mode Selection -->
      <div v-if="!currentQuiz" class="space-y-4">
        <!-- Loading State -->
        <div v-if="isLoadingCategories" class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 p-8 text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 mb-4"></div>
          <p class="text-neutral-600 dark:text-neutral-400">Loading quiz questions...</p>
        </div>

        <div v-else>
          <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Choose a quiz mode:</h2>

          <!-- Daily Quiz Card -->
          <button
            @click="startDailyQuiz"
            :disabled="isLoadingCategories"
            class="w-full bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 p-5 text-left hover:shadow-md dark:hover:shadow-neutral-700/50 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <Icon name="star" size="md" class="text-primary-600 dark:text-primary-400" />
              <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 text-lg">Daily Quiz</h3>
            </div>
            <span class="text-xs bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full">+50 pts</span>
          </div>
          <p class="text-sm text-neutral-600 dark:text-neutral-400">5 questions · Same quiz for all users today</p>
          <div class="flex items-center gap-1 text-xs text-accent-600 dark:text-accent-400 mt-2">
            <Icon name="fire" size="xs" />
            <span>Streak: {{ gamification.streak }} days</span>
          </div>
        </button>

          <!-- Rapid Fire Quiz Card -->
          <button
            @click="openCustomization('rapid-fire')"
            :disabled="isLoadingCategories"
            class="w-full bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 p-5 text-left hover:shadow-md dark:hover:shadow-neutral-700/50 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <Icon name="lightning" size="md" class="text-accent-600 dark:text-accent-400" />
              <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 text-lg">Rapid Fire</h3>
            </div>
            <span class="text-xs bg-accent-100 dark:bg-accent-900/50 text-accent-700 dark:text-accent-300 px-3 py-1 rounded-full">+100 pts</span>
          </div>
          <p class="text-sm text-neutral-600 dark:text-neutral-400">20 questions · 60 seconds · Customize topics</p>
        </button>

          <!-- Custom Category Quiz Card -->
          <button
            @click="openCustomization('custom')"
            :disabled="isLoadingCategories"
            class="w-full bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 p-5 text-left hover:shadow-md dark:hover:shadow-neutral-700/50 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <Icon name="book" size="md" class="text-primary-600 dark:text-primary-400" />
              <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 text-lg">Custom Quiz</h3>
            </div>
            <span class="text-xs bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full">Variable pts</span>
          </div>
          <p class="text-sm text-neutral-600 dark:text-neutral-400">Choose categories & difficulty</p>
        </button>

          <!-- Challenge Mode Card -->
          <button
            @click="startChallengeQuiz"
            :disabled="isLoadingCategories"
            class="w-full bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 p-5 text-left hover:shadow-md dark:hover:shadow-neutral-700/50 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition border-2 border-primary-400 dark:border-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <Icon name="star" size="md" class="text-primary-600 dark:text-primary-400" />
              <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 text-lg">Challenge Mode</h3>
            </div>
            <span class="text-xs bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full">+150 pts</span>
          </div>
          <p class="text-sm text-neutral-600 dark:text-neutral-400">15 questions · Tougher questions</p>
        </button>

          <!-- Stats Section -->
          <div class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 p-4 mt-6">
            <div class="flex items-center gap-2 mb-3">
              <Icon name="document" size="md" class="text-primary-600 dark:text-primary-400" />
              <h3 class="font-semibold text-neutral-900 dark:text-neutral-100">Your Stats</h3>
            </div>
            <div class="grid grid-cols-3 gap-4 text-center">
              <div>
                <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ gamification.stats.quizzesCompleted }}</div>
                <div class="text-xs text-neutral-600 dark:text-neutral-400">Quizzes</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-accent-600 dark:text-accent-400">{{ gamification.stats.avgAccuracy }}%</div>
                <div class="text-xs text-neutral-600 dark:text-neutral-400">Accuracy</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ gamification.currentLevel }}</div>
                <div class="text-xs text-neutral-600 dark:text-neutral-400">Level</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quiz in Progress -->
      <div v-else-if="currentQuiz && !quizCompleted" class="space-y-4">
        <!-- Progress Bar -->
        <div class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 p-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Progress</span>
            <span class="text-sm text-neutral-600 dark:text-neutral-400">{{ currentQuestionIndex + 1 }}/{{ currentQuiz.questions.length }}</span>
          </div>
          <div class="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
            <div
              class="bg-primary-600 dark:bg-primary-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100 + '%' }"
            ></div>
          </div>
        </div>

        <!-- Question Card -->
        <div class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 p-6">
          <!-- Category Breadcrumb -->
          <div v-if="currentQuestionCategory" class="mb-3">
            <div class="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 rounded text-xs">
              <Icon name="folder" size="xs" />
              <span>{{ currentQuestionCategory.breadcrumb }}</span>
            </div>
          </div>

          <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            {{ currentQuestion.questionText }}
          </h3>

          <!-- Multiple Choice Options -->
          <div class="space-y-2">
            <button
              v-for="(option, idx) in currentQuestion.options"
              :key="idx"
              @click="selectAnswer(idx)"
              :disabled="answered"
              :class="[
                'w-full p-4 rounded-lg border-2 text-left transition font-medium',
                {
                  'border-primary-600 bg-primary-50 dark:bg-primary-950/30 text-primary-900 dark:text-primary-100': selectedAnswer === idx && !answered,
                  'border-accent-500 bg-accent-50 dark:bg-accent-950/30 text-accent-900 dark:text-accent-100': answered && idx === currentQuestion.correctOptionId,
                  'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-100': answered && selectedAnswer === idx && idx !== currentQuestion.correctOptionId,
                  'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 hover:border-primary-400 dark:hover:border-primary-600': !answered && selectedAnswer !== idx,
                  'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-400 dark:text-neutral-600 cursor-not-allowed': answered && selectedAnswer !== idx
                }
              ]"
            >
              <div class="flex items-center">
                <span class="w-8 h-8 rounded-full border-2 flex items-center justify-center mr-3"
                  :class="{
                    'border-primary-600 bg-primary-600 text-white': selectedAnswer === idx && !answered,
                    'border-accent-500 bg-accent-500 text-white': answered && idx === currentQuestion.correctOptionId,
                    'border-red-500 bg-red-500 text-white': answered && selectedAnswer === idx && idx !== currentQuestion.correctOptionId,
                  }"
                >
                  {{ String.fromCharCode(65 + idx) }}
                </span>
                {{ option.text }}
              </div>
            </button>
          </div>

          <!-- Explanation (shown after answer) -->
          <div v-if="answered" class="mt-4 p-3 bg-primary-50 dark:bg-primary-950/30 rounded-lg border-l-4 border-primary-500 dark:border-primary-600">
            <p class="text-sm text-primary-900 dark:text-primary-100">
              <span class="font-semibold">Explanation: </span>
              {{ currentQuestion.explanation }}
            </p>

            <!-- Link to Full Question (using reference ID) -->
            <button
              v-if="currentQuestion.reference"
              @click="viewFullQuestion(currentQuestion.reference)"
              class="mt-3 text-sm font-semibold text-primary-700 dark:text-primary-300 hover:underline flex items-center gap-1"
            >
              <Icon name="book" size="xs" />
              Read full explanation
            </button>
          </div>
        </div>

        <!-- Next Button -->
        <button
          v-if="answered"
          @click="nextQuestion"
          class="w-full bg-primary-600 dark:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition"
        >
          {{ currentQuestionIndex < currentQuiz.questions.length - 1 ? 'Next Question' : 'See Results' }}
        </button>
      </div>

      <!-- Quiz Results -->
      <div v-else-if="quizCompleted && quizResults" class="space-y-4">
        <div class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 p-6 text-center">
          <h2 class="text-3xl font-bold mb-2 text-neutral-900 dark:text-neutral-100">{{ quizResults.feedback }}</h2>
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">Quiz completed!</p>

          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="bg-primary-50 dark:bg-primary-950/30 rounded-lg p-4">
              <div class="text-3xl font-bold text-primary-600 dark:text-primary-400">{{ quizResults.correct }}</div>
              <div class="text-sm text-neutral-600 dark:text-neutral-400">Correct</div>
            </div>
            <div class="bg-accent-50 dark:bg-accent-950/30 rounded-lg p-4">
              <div class="text-3xl font-bold text-accent-600 dark:text-accent-400">{{ quizResults.accuracy }}%</div>
              <div class="text-sm text-neutral-600 dark:text-neutral-400">Accuracy</div>
            </div>
            <div class="bg-primary-50 dark:bg-primary-950/30 rounded-lg p-4">
              <div class="text-3xl font-bold text-primary-600 dark:text-primary-400">+{{ quizResults.score }}</div>
              <div class="text-sm text-neutral-600 dark:text-neutral-400">Points</div>
            </div>
          </div>

          <!-- Detailed Answer Summary -->
          <div class="mt-6 space-y-3">
            <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 text-left mb-3">Review Your Answers</h3>
            <div
              v-for="(result, idx) in quizResults.results"
              :key="idx"
              class="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 text-left"
            >
              <div class="flex items-start gap-3">
                <!-- Correct/Incorrect Icon -->
                <div
                  :class="[
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                    result.isCorrect
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  ]"
                >
                  {{ result.isCorrect ? '✓' : '✗' }}
                </div>

                <div class="flex-1 min-w-0">
                  <!-- Question Text -->
                  <h4 class="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                    Question {{ idx + 1 }}: {{ currentQuiz.questions[idx].questionText }}
                  </h4>

                  <!-- Answer Details -->
                  <div class="space-y-1 text-sm">
                    <div
                      :class="[
                        'flex items-center gap-2',
                        result.isCorrect
                          ? 'text-green-700 dark:text-green-400'
                          : 'text-red-700 dark:text-red-400'
                      ]"
                    >
                      <span class="font-semibold">Your answer:</span>
                      <span>{{ currentQuiz.questions[idx].options[result.userAnswerIndex]?.text || 'No answer' }}</span>
                    </div>
                    <div v-if="!result.isCorrect" class="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <span class="font-semibold">Correct answer:</span>
                      <span>{{ currentQuiz.questions[idx].options[result.correctOptionIndex].text }}</span>
                    </div>
                  </div>

                  <!-- Link to Full Question (if sourceQuestionId exists) -->
                  <button
                    v-if="currentQuiz.questions[idx].sourceQuestionId"
                    @click="viewFullQuestion(currentQuiz.questions[idx].sourceQuestionId)"
                    class="mt-3 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                  >
                    <Icon name="book" size="xs" />
                    Read full explanation
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Achievement Notification -->
          <div v-if="newAchievements.length > 0" class="bg-accent-50 dark:bg-accent-950/30 border border-accent-200 dark:border-accent-800 rounded-lg p-4 mb-4">
            <p class="font-semibold text-accent-900 dark:text-accent-100 mb-2">🎉 Achievement Unlocked!</p>
            <div v-for="ach in newAchievements" :key="ach.id" class="text-sm text-accent-800 dark:text-accent-200">
              {{ ach.icon }} {{ ach.name }}: +{{ ach.points }} points
            </div>
          </div>

          <button
            @click="restartQuiz"
            class="w-full bg-primary-600 dark:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition mb-2"
          >
            Take Another Quiz
          </button>
          <button
            @click="goBack"
            class="w-full bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 px-6 py-3 rounded-lg font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-700 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>

    <!-- Question Detail Modal -->
    <div v-if="showQuestionModal && modalQuestion" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
        <div class="sticky top-0 bg-white dark:bg-neutral-900 border-b dark:border-neutral-800 p-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-neutral-900 dark:text-neutral-100">Full Question</h2>
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
            <h3 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              {{ modalQuestion.title }}
            </h3>
          </div>

          <!-- Question Content -->
          <div class="prose dark:prose-invert max-w-none">
            <div class="bg-primary-50 dark:bg-primary-950/30 border-l-4 border-primary-500 dark:border-primary-600 p-4 rounded">
              <h4 class="text-sm font-semibold text-primary-900 dark:text-primary-100 mb-2">Question</h4>
              <div class="text-neutral-800 dark:text-neutral-200" v-html="modalQuestion.question"></div>
            </div>
          </div>

          <!-- Answer Content -->
          <div class="prose dark:prose-invert max-w-none">
            <div class="bg-accent-50 dark:bg-accent-950/30 border-l-4 border-accent-500 dark:border-accent-600 p-4 rounded">
              <h4 class="text-sm font-semibold text-accent-900 dark:text-accent-100 mb-2">Answer</h4>
              <div class="text-neutral-800 dark:text-neutral-200" v-html="modalQuestion.answer"></div>
            </div>
          </div>
        </div>

        <div class="sticky bottom-0 bg-white dark:bg-neutral-900 border-t dark:border-neutral-800 p-4">
          <button
            @click="closeQuestionModal"
            class="w-full bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 px-6 py-3 rounded-lg font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import { useGamificationStore } from '@/stores/gamification'
import QuizService from '@/services/quizService'
import leaderboardService from '@/services/leaderboardService'
import Icon from '@/components/common/Icon.vue'

const router = useRouter()
const dataStore = useDataStore()
const gamification = useGamificationStore()

const currentQuiz = ref(null)
const quizService = ref(null)
const currentQuestionIndex = ref(0)
const selectedAnswer = ref(null)
const answered = ref(false)
const quizCompleted = ref(false)
const quizResults = ref(null)
const newAchievements = ref([])
const userAnswers = ref([]) // Track all user answers for scoring
const quizStartTime = ref(null) // Track quiz start time for leaderboard

// Customization state
const showCustomizationModal = ref(false)
const showFirstTimeGuide = ref(false)
const availableCategories = ref([])
const selectedCategories = ref([])
const selectedDifficulty = ref('all')
const questionCount = ref(10)
const customizationMode = ref('custom') // 'custom' or 'rapid-fire'

// Loading state
const isLoadingCategories = ref(true)

// Question detail modal state
const showQuestionModal = ref(false)
const modalQuestion = ref(null)

// Category info for current question
const currentQuestionCategory = ref(null)

const currentQuestion = computed(() => {
  if (!currentQuiz.value || currentQuestionIndex.value >= currentQuiz.value.questions.length) {
    return null
  }
  return currentQuiz.value.questions[currentQuestionIndex.value]
})

// First-time guide management
function checkFirstTimeUser() {
  const hasSeenGuide = localStorage.getItem('quiz-guide-seen')
  if (!hasSeenGuide) {
    // Show immediately, don't wait for async operations
    showFirstTimeGuide.value = true
  }
}

function closeFirstTimeGuide() {
  localStorage.setItem('quiz-guide-seen', 'true')
  showFirstTimeGuide.value = false
}

// Load category info for current question
async function loadCurrentQuestionCategory() {
  if (!currentQuestion.value) {
    currentQuestionCategory.value = null
    return
  }

  try {
    let categoryRef = currentQuestion.value.primaryCategory
    let category = null

    // Try primary category first
    if (categoryRef) {
      category = await dataStore.getCategory(categoryRef)
    }

    // If primary category doesn't exist, try to find a valid category from categories array
    if (!category && currentQuestion.value.categories && currentQuestion.value.categories.length > 0) {
      console.log(`⚠️  Primary category ${categoryRef} not found - trying fallback categories`)

      for (const fallbackRef of currentQuestion.value.categories) {
        category = await dataStore.getCategory(fallbackRef)
        if (category) {
          categoryRef = fallbackRef
          console.log(`✅ Using fallback category ${fallbackRef}: ${category.title}`)
          break
        }
      }
    }

    // If still no valid category found
    if (!category) {
      console.log(`⚠️  No valid categories found for question - skipping breadcrumb`)
      currentQuestionCategory.value = null
      return
    }

    // Build breadcrumb from ancestors
    const breadcrumb = []
    if (category.ancestors && category.ancestors.length > 0) {
      // Load ancestor categories, skip any that don't exist
      for (const ancestorRef of category.ancestors) {
        const ancestor = await dataStore.getCategory(ancestorRef)
        if (ancestor) {
          breadcrumb.push(ancestor.title)
        } else {
          console.log(`⚠️  Ancestor category ${ancestorRef} not found - skipping in breadcrumb`)
        }
      }
    }
    breadcrumb.push(category.title)

    currentQuestionCategory.value = {
      reference: category.reference,
      title: category.title,
      breadcrumb: breadcrumb.join(' > ')
    }
  } catch (error) {
    console.error('Error loading category for question:', error)
    currentQuestionCategory.value = null
  }
}

// Customization modal management
function openCustomization(mode) {
  console.log('🎨 Opening customization modal:', mode)
  console.log('  - Available categories:', availableCategories.value.map(c => `${c.reference}: ${c.title}`))
  console.log('  - Quiz service ready:', quizService.value !== null)

  customizationMode.value = mode

  // Set defaults based on mode
  if (mode === 'rapid-fire') {
    questionCount.value = 20
  } else {
    questionCount.value = 10
  }

  // Reset to all categories selected by default
  selectedCategories.value = [...availableCategories.value]
  selectedDifficulty.value = 'all'

  console.log('  - Selected categories after reset:', selectedCategories.value.map(c => `${c.reference}: ${c.title}`))

  showCustomizationModal.value = true
}

function closeCustomizationModal() {
  showCustomizationModal.value = false
}

function toggleCategory(category) {
  const index = selectedCategories.value.findIndex(c => c.reference === category.reference)
  if (index > -1) {
    selectedCategories.value.splice(index, 1)
  } else {
    selectedCategories.value.push(category)
  }
}

function toggleAllCategories() {
  if (selectedCategories.value.length === availableCategories.value.length) {
    selectedCategories.value = []
  } else {
    selectedCategories.value = [...availableCategories.value]
  }
}

async function startCustomQuiz() {
  if (selectedCategories.value.length === 0) {
    return
  }

  try {
    // Extract category references from selected categories
    const categoryReferences = selectedCategories.value.map(cat => cat.reference)

    if (customizationMode.value === 'rapid-fire') {
      currentQuiz.value = await quizService.value.getRapidFireQuiz({
        categories: categoryReferences,
        difficulty: selectedDifficulty.value
      })
    } else {
      currentQuiz.value = await quizService.value.getCustomQuiz({
        categories: categoryReferences,
        difficulty: selectedDifficulty.value,
        count: questionCount.value,
        mode: 'custom'
      })
    }

    currentQuestionIndex.value = 0
    selectedAnswer.value = null
    answered.value = false
    userAnswers.value = []
    quizStartTime.value = Date.now() // Track start time
    showCustomizationModal.value = false
    // Load category for first question
    await loadCurrentQuestionCategory()
  } catch (error) {
    console.error('Error starting custom quiz:', error)
    alert('Failed to load custom quiz. Please try again.')
  }
}

// Quiz Mode Starters (now async with database)
async function startDailyQuiz() {
  try {
    currentQuiz.value = await quizService.value.getDailyQuiz()
    currentQuestionIndex.value = 0
    selectedAnswer.value = null
    answered.value = false
    userAnswers.value = [] // Reset answers array
    quizStartTime.value = Date.now() // Track start time
    // Load category for first question
    await loadCurrentQuestionCategory()
  } catch (error) {
    console.error('Error starting daily quiz:', error)
    alert('Failed to load daily quiz. Please try again.')
  }
}

async function startChallengeQuiz() {
  try {
    currentQuiz.value = await quizService.value.getChallengeQuiz()
    currentQuestionIndex.value = 0
    selectedAnswer.value = null
    answered.value = false
    userAnswers.value = [] // Reset answers array
    quizStartTime.value = Date.now() // Track start time
    // Load category for first question
    await loadCurrentQuestionCategory()
  } catch (error) {
    console.error('Error starting challenge quiz:', error)
    alert('Failed to load challenge quiz. Please try again.')
  }
}

function selectAnswer(optionIndex) {
  if (answered.value) return
  selectedAnswer.value = optionIndex
  answered.value = true
}

// View full question in modal instead of navigating
async function viewFullQuestion(questionId) {
  try {
    const question = await dataStore.getQuestion(questionId)
    if (question) {
      modalQuestion.value = question
      showQuestionModal.value = true
    }
  } catch (error) {
    console.error('Error loading full question:', error)
    alert('Failed to load question details.')
  }
}

function closeQuestionModal() {
  showQuestionModal.value = false
  modalQuestion.value = null
}

async function nextQuestion() {
  // Save the current answer before moving to next question
  userAnswers.value.push(selectedAnswer.value)

  if (currentQuestionIndex.value < currentQuiz.value.questions.length - 1) {
    currentQuestionIndex.value++
    selectedAnswer.value = null
    answered.value = false
    // Load category for new question
    await loadCurrentQuestionCategory()
  } else {
    completeQuiz()
  }
}

async function completeQuiz() {
  // Calculate score using the collected user answers
  quizResults.value = quizService.value.calculateScore(currentQuiz.value, userAnswers.value)

  // Award points and check achievements
  const previousUnlocked = gamification.unlockedAchievements.length
  gamification.completeQuiz(quizResults.value.score, quizResults.value.accuracy)
  const newlyUnlocked = gamification.unlockedAchievements.length - previousUnlocked
  newAchievements.value = gamification.unlockedAchievements.slice(-newlyUnlocked)

  // Submit to leaderboard
  try {
    const timeTaken = quizStartTime.value ? Math.floor((Date.now() - quizStartTime.value) / 1000) : 0
    await leaderboardService.submitScore({
      score: quizResults.value.score,
      correct: quizResults.value.correct,
      total: quizResults.value.total,
      accuracy: quizResults.value.accuracy,
      quizId: currentQuiz.value.id,
      mode: currentQuiz.value.mode,
      timeTaken: timeTaken
    })
    console.log('✅ Score submitted to leaderboard')
  } catch (error) {
    console.error('⚠️ Failed to submit score to leaderboard:', error)
    // Don't block user if leaderboard submission fails
  }

  quizCompleted.value = true

  console.log('✅ Quiz completed!', {
    answers: userAnswers.value,
    results: quizResults.value
  })
}

function restartQuiz() {
  currentQuiz.value = null
  quizCompleted.value = false
  quizResults.value = null
  newAchievements.value = []
  selectedAnswer.value = null
  answered.value = false
  currentQuestionIndex.value = 0
  userAnswers.value = [] // Reset answers array
}

function goBack() {
  // Only warn about lost progress if quiz is active but not completed
  if (currentQuiz.value && !quizCompleted.value) {
    if (confirm('Are you sure? Your progress will be lost.')) {
      restartQuiz()
    }
  } else {
    router.back()
  }
}

// viewFullQuestion is now defined earlier to show modal instead of navigating

// Initialize
onMounted(async () => {
  try {
    console.log('🎯 Initializing Quiz View (new database-driven system)...')

    // Show onboarding popup IMMEDIATELY (before async operations)
    checkFirstTimeUser()

    // Initialize gamification
    gamification.initializeFromStorage()

    // Initialize leaderboard service
    try {
      await leaderboardService.initUser()
      console.log('  ✅ Leaderboard service initialized')
    } catch (error) {
      console.error('  ⚠️ Failed to initialize leaderboard:', error)
      // Don't block quiz if leaderboard fails
    }

    // Initialize quiz service (now uses database instead of pre-generated JSON)
    quizService.value = new QuizService()
    console.log('  ✅ Quiz service initialized (using database)')

    // Load available categories from database
    console.log('  🔄 Loading available categories from database...')
    const categories = await quizService.value.getAvailableCategories()
    availableCategories.value = categories || []
    selectedCategories.value = [...availableCategories.value] // Select all by default
    isLoadingCategories.value = false // Mark loading complete

    console.log('  ✅ Quiz view ready')
    console.log(`  - Available categories: ${availableCategories.value.length}`)
    console.log('  - Categories:', availableCategories.value.map(c => `${c.reference}: ${c.title}`).join(', '))

    console.log('🎯 Quiz view initialized successfully!')
  } catch (error) {
    console.error('❌ FATAL ERROR initializing quiz view:', error)
    isLoadingCategories.value = false
    alert(`Failed to initialize quiz: ${error.message}\n\nPlease check the console for details.`)
  }
})
</script>

<style scoped>
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
