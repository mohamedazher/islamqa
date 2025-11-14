<template>
  <div class="settings-view h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
    <!-- Header -->
    <header class="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white p-4 shadow flex items-center">
      <button @click="goBack" class="mr-3 hover:opacity-80 transition-opacity lg:hidden">
        <Icon name="arrowLeft" size="md" />
      </button>
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <Icon name="cog" size="lg" class="flex-shrink-0" />
        <div class="min-w-0">
          <h1 class="text-lg md:text-xl font-bold truncate">Settings</h1>
          <p class="text-primary-100 dark:text-primary-200 text-xs md:text-sm truncate">Customize your experience</p>
        </div>
      </div>
    </header>

    <div class="flex-1 overflow-y-auto p-4 pb-20 lg:pb-4 space-y-4">
      <!-- Appearance Section -->
      <section class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 overflow-hidden">
        <div class="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Icon name="sun" size="md" class="text-primary-600 dark:text-primary-400" />
            Appearance
          </h2>
        </div>
        <div class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium text-neutral-900 dark:text-neutral-100">Theme</h3>
              <p class="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                {{ isDark ? 'Dark mode' : 'Light mode' }} enabled
              </p>
            </div>
            <button
              @click="toggleTheme"
              class="relative inline-flex h-9 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
              :class="isDark ? 'bg-primary-600 dark:bg-primary-500' : 'bg-neutral-300 dark:bg-neutral-700'"
            >
              <span
                class="inline-flex h-7 w-7 transform items-center justify-center rounded-full bg-white shadow-sm transition-transform"
                :class="isDark ? 'translate-x-8' : 'translate-x-1'"
              >
                <Icon :name="isDark ? 'moon' : 'sun'" size="sm" class="text-neutral-700" />
              </span>
            </button>
          </div>
        </div>
      </section>

      <!-- Profile Section -->
      <section class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 overflow-hidden">
        <div class="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Icon name="user" size="md" class="text-primary-600 dark:text-primary-400" />
            Profile
          </h2>
        </div>
        <div class="p-4 space-y-4">
          <!-- Profile Avatar & Username -->
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 dark:from-amber-500 dark:to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {{ userProfile.username ? userProfile.username.charAt(0).toUpperCase() : '?' }}
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-bold text-neutral-900 dark:text-neutral-100">{{ userProfile.username }}</h3>
                <button
                  @click="openUsernameDialog"
                  class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                  title="Edit username"
                >
                  <Icon name="edit" size="sm" />
                </button>
              </div>
              <p class="text-xs text-neutral-600 dark:text-neutral-400 font-mono">
                ID: {{ userProfile.userId ? userProfile.userId.substring(0, 8) : 'Loading...' }}
              </p>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-3 gap-3">
            <div class="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 text-center border border-amber-200 dark:border-amber-800">
              <div class="text-2xl font-bold text-amber-600 dark:text-amber-400">{{ userProfile.totalScore }}</div>
              <div class="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Total Score</div>
            </div>
            <div class="bg-orange-50 dark:bg-orange-950/30 rounded-lg p-3 text-center border border-orange-200 dark:border-orange-800">
              <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ userProfile.quizzesTaken }}</div>
              <div class="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Quizzes</div>
            </div>
            <div class="bg-primary-50 dark:bg-primary-950/30 rounded-lg p-3 text-center border border-primary-200 dark:border-primary-800">
              <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ userProfile.level }}</div>
              <div class="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Level</div>
            </div>
          </div>

          <!-- Account Type Badge -->
          <div class="bg-neutral-50 dark:bg-neutral-950/50 rounded-lg p-3 border border-neutral-200 dark:border-neutral-800">
            <div class="flex items-center gap-2">
              <Icon name="shield" size="sm" class="text-neutral-600 dark:text-neutral-400" />
              <p class="text-xs text-neutral-600 dark:text-neutral-400">
                <strong class="text-neutral-900 dark:text-neutral-100">Account Type:</strong> Anonymous User
              </p>
            </div>
            <p class="text-xs text-neutral-500 dark:text-neutral-500 mt-1 ml-6">
              Your progress is saved locally and synced to the leaderboard
            </p>
          </div>
        </div>
      </section>

      <!-- Prayer Times Section -->
      <section class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 overflow-hidden">
        <div class="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Icon name="sun" size="md" class="text-primary-600 dark:text-primary-400" />
            Prayer Times
          </h2>
        </div>
        <div class="p-4 space-y-4">
          <!-- Location Section -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <div>
                <h3 class="font-medium text-neutral-900 dark:text-neutral-100">Location</h3>
                <p class="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                  {{ prayerSettings.locationName }}
                </p>
              </div>
              <button
                @click="detectLocation"
                :disabled="detectingLocation"
                class="px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {{ detectingLocation ? 'Detecting...' : 'Detect' }}
              </button>
            </div>

            <!-- Manual Location Input -->
            <div class="space-y-3 bg-neutral-50 dark:bg-neutral-950/50 rounded-lg p-3">
              <div>
                <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Latitude
                </label>
                <input
                  v-model="manualLocation.latitude"
                  type="number"
                  step="any"
                  placeholder="e.g., 21.4225"
                  class="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Longitude
                </label>
                <input
                  v-model="manualLocation.longitude"
                  type="number"
                  step="any"
                  placeholder="e.g., 39.8262"
                  class="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  City Name (Optional)
                </label>
                <input
                  v-model="manualLocation.name"
                  type="text"
                  placeholder="e.g., Makkah"
                  class="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button
                @click="saveManualLocation"
                :disabled="!isManualLocationValid"
                class="w-full px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Save Location
              </button>
            </div>
          </div>

          <!-- Calculation Method -->
          <div>
            <label class="block font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              Calculation Method
            </label>
            <select
              v-model="prayerSettings.calculationMethod"
              @change="saveCalculationMethod"
              class="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option
                v-for="method in calculationMethods"
                :key="method.key"
                :value="method.key"
              >
                {{ method.name }}
              </option>
            </select>
            <p class="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              {{ selectedCalculationMethod?.description }}
            </p>
            <p v-if="selectedCalculationMethod?.regions" class="text-xs text-primary-600 dark:text-primary-400 mt-1">
              Used in: {{ selectedCalculationMethod.regions.join(', ') }}
            </p>
          </div>

          <!-- Madhab (Asr Calculation) -->
          <div>
            <label class="block font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              Madhab (Asr Calculation)
            </label>
            <div class="space-y-2">
              <label
                v-for="madhabOption in madhabOptions"
                :key="madhabOption.key"
                class="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-950/50 rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900/50 transition-colors"
              >
                <input
                  type="radio"
                  :value="madhabOption.key"
                  v-model="prayerSettings.madhab"
                  @change="saveMadhab"
                  class="w-4 h-4 text-primary-600 focus:ring-primary-500 focus:ring-2"
                />
                <div class="flex-1">
                  <div class="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                    {{ madhabOption.name }}
                  </div>
                  <div class="text-xs text-neutral-600 dark:text-neutral-400">
                    {{ madhabOption.description }}
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- Qibla Direction -->
          <div v-if="prayerSettings.location" class="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 rounded-lg p-4 border border-teal-200 dark:border-teal-800/30">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium text-neutral-900 dark:text-neutral-100 mb-1">Qibla Direction</h3>
                <p class="text-xs text-neutral-600 dark:text-neutral-400">From your location</p>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-teal-600 dark:text-teal-400">{{ qiblaDirection }}°</div>
                <div class="text-xs text-neutral-600 dark:text-neutral-400 mt-1">from North</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- About Section -->
      <section class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 overflow-hidden">
        <div class="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Icon name="document" size="md" class="text-primary-600 dark:text-primary-400" />
            About
          </h2>
        </div>
        <div class="p-4 space-y-4">
          <!-- App Logo/Icon -->
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-600 dark:to-primary-800 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              ☪
            </div>
            <div>
              <h3 class="text-lg font-bold text-neutral-900 dark:text-neutral-100">{{ appName }}</h3>
              <p class="text-sm text-neutral-600 dark:text-neutral-400">Version {{ appVersion }}</p>
            </div>
          </div>

          <p class="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            Access authentic Islamic Q&A content offline. Browse 8000+ questions and answers across 269 categories, all sourced from IslamQA.info.
          </p>

          <!-- Stats Grid -->
          <div class="grid grid-cols-3 gap-3 pt-2">
            <div class="bg-primary-50 dark:bg-primary-950/30 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ stats.questions > 0 ? stats.questions : '8000+' }}</div>
              <div class="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Questions</div>
            </div>
            <div class="bg-accent-50 dark:bg-accent-950/30 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-accent-600 dark:text-accent-400">{{ stats.categories > 0 ? stats.categories : '269' }}</div>
              <div class="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Categories</div>
            </div>
            <div class="bg-primary-50 dark:bg-primary-950/30 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">100%</div>
              <div class="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Offline</div>
            </div>
          </div>

          <!-- Share App Button -->
          <button
            @click="handleShareApp"
            class="w-full mt-4 bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-700 dark:to-accent-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-accent-700 dark:hover:from-primary-600 dark:hover:to-accent-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <Icon name="share" size="md" />
            Share App with Friends
          </button>
        </div>
      </section>

      <!-- Help & Tutorial Section -->
      <section class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 overflow-hidden">
        <div class="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Icon name="info" size="md" class="text-primary-600 dark:text-primary-400" />
            Help & Tutorial
          </h2>
        </div>
        <div class="p-4">
          <button
            @click="showTutorial"
            class="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-950/30 dark:to-accent-950/30 rounded-lg hover:from-primary-100 hover:to-accent-100 dark:hover:from-primary-950/50 dark:hover:to-accent-950/50 transition-colors group"
          >
            <div class="flex items-center gap-3 text-left">
              <div class="w-10 h-10 bg-primary-600 dark:bg-primary-500 rounded-full flex items-center justify-center">
                <Icon name="lightning" size="md" class="text-white" />
              </div>
              <div>
                <div class="font-medium text-neutral-900 dark:text-neutral-100">View App Tutorial</div>
                <div class="text-xs text-neutral-600 dark:text-neutral-400">Learn about all features and how to use them</div>
              </div>
            </div>
            <Icon name="arrowRight" size="sm" class="text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      <!-- Links Section -->
      <section class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 overflow-hidden">
        <div class="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Icon name="link" size="md" class="text-primary-600 dark:text-primary-400" />
            Links
          </h2>
        </div>
        <div class="divide-y divide-neutral-200 dark:divide-neutral-800">
          <a
            href="https://islamqa.info"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-between px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group"
          >
            <div class="flex items-center gap-3">
              <Icon name="globe" size="md" class="text-neutral-600 dark:text-neutral-400" />
              <div>
                <div class="font-medium text-neutral-900 dark:text-neutral-100">IslamQA.info</div>
                <div class="text-xs text-neutral-600 dark:text-neutral-400">Original source</div>
              </div>
            </div>
            <Icon name="chevronRight" size="sm" class="text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors" />
          </a>

          <a
            href="https://github.com/mohamedazher/islamqa"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-between px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group"
          >
            <div class="flex items-center gap-3">
              <Icon name="code" size="md" class="text-neutral-600 dark:text-neutral-400" />
              <div>
                <div class="font-medium text-neutral-900 dark:text-neutral-100">Source Code</div>
                <div class="text-xs text-neutral-600 dark:text-neutral-400">View on GitHub</div>
              </div>
            </div>
            <Icon name="chevronRight" size="sm" class="text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors" />
          </a>

          <a
            href="https://github.com/mohamedazher/islamqa/issues"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-between px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group"
          >
            <div class="flex items-center gap-3">
              <Icon name="exclamation" size="md" class="text-neutral-600 dark:text-neutral-400" />
              <div>
                <div class="font-medium text-neutral-900 dark:text-neutral-100">Report Issue</div>
                <div class="text-xs text-neutral-600 dark:text-neutral-400">Bug reports & feedback</div>
              </div>
            </div>
            <Icon name="chevronRight" size="sm" class="text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors" />
          </a>
        </div>
      </section>

      <!-- Privacy Section -->
      <section class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 overflow-hidden">
        <div class="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Icon name="shield" size="md" class="text-primary-600 dark:text-primary-400" />
            Privacy & Data
          </h2>
        </div>
        <div class="p-4 space-y-4">
          <!-- Analytics Toggle -->
          <div class="flex items-start justify-between">
            <div class="flex-1 pr-4">
              <h3 class="font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                Analytics
                <span v-if="!analyticsEnabled" class="text-xs bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded">Disabled</span>
              </h3>
              <p class="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                Help improve the app by sharing anonymous usage data. No personal information is collected.
              </p>
            </div>
            <button
              @click="toggleAnalytics"
              class="relative inline-flex h-9 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 flex-shrink-0"
              :class="analyticsEnabled ? 'bg-primary-600 dark:bg-primary-500' : 'bg-neutral-300 dark:bg-neutral-700'"
            >
              <span
                class="inline-flex h-7 w-7 transform items-center justify-center rounded-full bg-white shadow-sm transition-transform"
                :class="analyticsEnabled ? 'translate-x-8' : 'translate-x-1'"
              >
                <Icon :name="analyticsEnabled ? 'check' : 'close'" size="sm" class="text-neutral-700" />
              </span>
            </button>
          </div>

          <!-- Privacy Info Link -->
          <button
            @click="showPrivacyInfo"
            class="w-full flex items-center justify-between px-4 py-3 bg-primary-50 dark:bg-primary-950/30 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-950/50 transition-colors group"
          >
            <div class="flex items-center gap-3 text-left">
              <Icon name="document" size="md" class="text-primary-600 dark:text-primary-400" />
              <div>
                <div class="font-medium text-primary-900 dark:text-primary-100">Privacy Information</div>
                <div class="text-xs text-primary-700 dark:text-primary-300">What data we collect and why</div>
              </div>
            </div>
            <Icon name="chevronRight" size="sm" class="text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <!-- Current Status -->
          <div class="bg-neutral-50 dark:bg-neutral-950/50 rounded-lg p-3 border border-neutral-200 dark:border-neutral-800">
            <p class="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              <strong class="text-neutral-900 dark:text-neutral-100">Status:</strong>
              Analytics collection is currently <strong>{{ analyticsEnabled ? 'enabled' : 'disabled' }}</strong>.
              {{ analyticsEnabled
                ? 'Anonymous usage data is being collected to improve the app.'
                : 'No analytics data is being collected.' }}
            </p>
          </div>
        </div>
      </section>

      <!-- Data Management Section -->
      <section class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 overflow-hidden">
        <div class="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Icon name="database" size="md" class="text-primary-600 dark:text-primary-400" />
            Data Management
          </h2>
        </div>
        <div class="p-4">
          <div class="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div class="flex items-start gap-3 mb-3">
              <Icon name="exclamation" size="md" class="text-red-600 dark:text-red-400 mt-0.5" />
              <div class="flex-1">
                <h3 class="font-semibold text-red-900 dark:text-red-100 mb-1">Clear Data</h3>
                <p class="text-sm text-red-800 dark:text-red-300 mb-3">
                  Choose what data you want to clear. You can selectively remove the database, bookmarks, quiz progress, or settings.
                </p>
                <button
                  @click="openClearDataDialog"
                  :disabled="isClearing"
                  class="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Icon name="cog" size="sm" />
                  {{ isClearing ? 'Clearing...' : 'Manage Data' }}
                </button>
                <p class="text-xs text-red-700 dark:text-red-400 mt-2 italic">
                  💡 Tip: Click 10 times within 3 seconds for developer reset
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Legal Section -->
      <section class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 overflow-hidden">
        <div class="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Icon name="shield" size="md" class="text-primary-600 dark:text-primary-400" />
            Legal
          </h2>
        </div>
        <div class="p-4 space-y-3">
          <div>
            <h3 class="font-medium text-neutral-900 dark:text-neutral-100 mb-1">Content Source</h3>
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
              All Islamic content is sourced from <a href="https://islamqa.info" target="_blank" class="text-primary-600 dark:text-primary-400 hover:underline">IslamQA.info</a> and is used with respect to their terms of use.
            </p>
          </div>
          <div>
            <h3 class="font-medium text-neutral-900 dark:text-neutral-100 mb-1">Disclaimer</h3>
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
              This is an unofficial app created to provide offline access to Islamic Q&A content. For the most up-to-date content, please visit the official website.
            </p>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <div class="text-center py-6">
        <p class="text-sm text-neutral-500 dark:text-neutral-500">
          Made with ❤️ for the Muslim community
        </p>
        <p class="text-xs text-neutral-400 dark:text-neutral-600 mt-1">
          © {{ currentYear }} IslamQA App
        </p>
      </div>
    </div>

    <!-- Onboarding Tutorial Dialog -->
    <OnboardingSlides v-model="showOnboardingDialog" @complete="handleOnboardingClose" @skip="handleOnboardingClose" />

    <!-- Clear Data Dialog -->
    <ClearDataDialog v-model="showClearDataDialog" @clear="handleClearData" />

    <!-- Username Edit Dialog -->
    <div v-if="showUsernameDialog" class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4" @click.self="closeUsernameDialog">
      <div class="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold text-neutral-900 dark:text-neutral-100">Edit Username</h3>
          <button @click="closeUsernameDialog" class="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors">
            <Icon name="close" size="md" />
          </button>
        </div>

        <div>
          <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Choose your username
          </label>
          <input
            v-model="newUsername"
            type="text"
            maxlength="30"
            placeholder="Enter new username"
            class="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
            @keyup.enter="handleUpdateUsername"
          />
          <p class="text-xs text-neutral-500 dark:text-neutral-500 mt-2">
            Max 30 characters. This will be displayed on the leaderboard.
          </p>
        </div>

        <div class="flex gap-3 pt-2">
          <button
            @click="closeUsernameDialog"
            class="flex-1 px-4 py-3 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="handleUpdateUsername"
            :disabled="isUpdatingUsername || !newUsername.trim()"
            class="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-500 dark:to-accent-500 text-white rounded-lg font-medium hover:from-primary-700 hover:to-accent-700 dark:hover:from-primary-600 dark:hover:to-accent-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isUpdatingUsername ? 'Updating...' : 'Update' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useDataStore } from '@/stores/data'
import dexieDb from '@/services/dexieDatabase'
import Icon from '@/components/common/Icon.vue'
import { shareApp } from '@/utils/sharing'
import { usePrivacyConsent } from '@/services/privacyConsent'
import { useAnalytics } from '@/services/analytics'
import OnboardingSlides from '@/components/common/OnboardingSlides.vue'
import ClearDataDialog from '@/components/common/ClearDataDialog.vue'
import leaderboardService from '@/services/leaderboardService'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { resetOnboarding } from '@/services/onboarding'
import prayerTimesService, { CALCULATION_METHODS, MADHAB_OPTIONS } from '@/services/prayerTimesService'

const router = useRouter()
const { isDark, toggleTheme } = useTheme()
const dataStore = useDataStore()
const { isAnalyticsEnabled, updateConsent } = usePrivacyConsent()
const { setEnabled } = useAnalytics()

const appName = 'BetterIslam Q&A'
const appVersion = __APP_VERSION__ // Injected by Vite from package.json
const currentYear = new Date().getFullYear()

const stats = ref({
  categories: 0,
  questions: 0,
  answers: 0
})

const isClearing = ref(false)
const analyticsEnabled = ref(isAnalyticsEnabled)
const showOnboardingDialog = ref(false)
const showClearDataDialog = ref(false)
const clearClickCount = ref(0)
const clearClickTimer = ref(null)

// User profile data
const userProfile = ref({
  userId: null,
  username: 'Loading...',
  totalScore: 0,
  quizzesTaken: 0,
  level: 1,
  lastActive: null
})
const showUsernameDialog = ref(false)
const newUsername = ref('')
const isUpdatingUsername = ref(false)

// Prayer Times settings
const calculationMethods = Object.values(CALCULATION_METHODS)
const madhabOptions = Object.values(MADHAB_OPTIONS)
const prayerSettings = ref({
  location: null,
  locationName: 'Not Set',
  calculationMethod: 'MUSLIM_WORLD_LEAGUE',
  madhab: 'SHAFI'
})
const manualLocation = ref({
  latitude: '',
  longitude: '',
  name: ''
})
const detectingLocation = ref(false)
const qiblaDirection = ref(null)

const selectedCalculationMethod = computed(() => {
  return calculationMethods.find(m => m.key === prayerSettings.value.calculationMethod)
})

const isManualLocationValid = computed(() => {
  const lat = parseFloat(manualLocation.value.latitude)
  const lon = parseFloat(manualLocation.value.longitude)
  return !isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
})

onMounted(async () => {
  try {
    if (dataStore.isReady) {
      stats.value = await dataStore.getStats()
    }

    // Load user profile
    await loadUserProfile()

    // Load prayer times settings
    loadPrayerSettings()
  } catch (error) {
    console.error('Error loading stats:', error)
  }
})

function goBack() {
  router.back()
}

async function handleShareApp() {
  try {
    const result = await shareApp()

    if (result.success && result.platform === 'clipboard') {
      alert(result.message || 'App link copied to clipboard!')
    }
  } catch (error) {
    console.error('Error sharing app:', error)
    if (!error.cancelled) {
      alert('Failed to share app. Please try again.')
    }
  }
}

function toggleAnalytics() {
  analyticsEnabled.value = !analyticsEnabled.value
  updateConsent('analytics', analyticsEnabled.value)
  setEnabled(analyticsEnabled.value)

  console.log('[Settings] Analytics', analyticsEnabled.value ? 'enabled' : 'disabled')
}

function showPrivacyInfo() {
  router.push('/privacy')
}

function showTutorial() {
  showOnboardingDialog.value = true
  console.log('[Settings] Opening tutorial')
}

function handleOnboardingClose() {
  showOnboardingDialog.value = false
  console.log('[Settings] Tutorial closed')
}

function openClearDataDialog() {
  // Track clicks for developer reset feature
  clearClickCount.value++

  // Reset counter after 3 seconds
  if (clearClickTimer.value) {
    clearTimeout(clearClickTimer.value)
  }
  clearClickTimer.value = setTimeout(() => {
    clearClickCount.value = 0
  }, 3000)

  // Developer reset: 10 clicks within 3 seconds
  if (clearClickCount.value >= 10) {
    handleDeveloperReset()
    return
  }

  // Normal flow: open dialog
  showClearDataDialog.value = true
}

async function handleClearData(selections) {
  try {
    isClearing.value = true
    console.log('🗑️  Clearing selected data...', selections)

    // Clear database (questions, answers, categories)
    if (selections.database || selections.resetEverything) {
      console.log('🗑️  Clearing database...')
      await dexieDb.clearAllData()
      dataStore.isReady = false
    }

    // Clear bookmarks
    if (selections.bookmarks || selections.resetEverything) {
      console.log('🗑️  Clearing bookmarks...')
      localStorage.removeItem('bookmarks')
      localStorage.removeItem('bookmarkedQuestions')
      localStorage.removeItem('bookmarkCount')
    }

    // Clear quiz progress
    if (selections.quizProgress || selections.resetEverything) {
      console.log('🗑️  Clearing quiz progress...')
      localStorage.removeItem('userProfile')
      localStorage.removeItem('quiz_history')
      localStorage.removeItem('quiz_stats')
      // Reset user profile in this component
      userProfile.value.totalScore = 0
      userProfile.value.quizzesTaken = 0
      userProfile.value.level = 1
    }

    // Clear app settings
    if (selections.settings || selections.resetEverything) {
      console.log('🗑️  Clearing app settings...')
      localStorage.removeItem('theme')
      localStorage.removeItem('privacy_consent')
      localStorage.removeItem('analytics_enabled')
    }

    // Reset onboarding
    if (selections.resetEverything) {
      console.log('🗑️  Resetting onboarding...')
      resetOnboarding()
    }

    console.log('✅ Data cleared successfully')

    // Close dialog
    showClearDataDialog.value = false

    // Show success message
    let message = 'Selected data has been cleared successfully.'

    // Determine redirect
    if (selections.database || selections.resetEverything) {
      message += '\n\nRedirecting to import page...'
      alert(message)
      router.push('/import')
    } else if (selections.resetEverything) {
      message += '\n\nPlease refresh the app to see onboarding again.'
      alert(message)
      // Could reload the page here
      window.location.reload()
    } else {
      alert(message)
    }
  } catch (error) {
    console.error('❌ Error clearing data:', error)
    alert('Failed to clear data. Please try again.')
  } finally {
    isClearing.value = false
  }
}

async function handleDeveloperReset() {
  console.log('🔧 Developer reset triggered!')
  clearClickCount.value = 0

  const confirmed = confirm(
    '🔧 DEVELOPER RESET\n\n' +
    'This will clear EVERYTHING including:\n' +
    '• All database data\n' +
    '• All localStorage\n' +
    '• All settings\n' +
    '• Onboarding status\n\n' +
    'This is useful for testing first-launch experience.\n\n' +
    'Continue?'
  )

  if (!confirmed) return

  try {
    isClearing.value = true
    console.log('🔧 Performing complete developer reset...')

    // Clear database
    await dexieDb.clearAllData()
    dataStore.isReady = false

    // Clear ALL localStorage
    localStorage.clear()

    console.log('✅ Complete reset done')

    alert('🔧 Developer reset complete!\n\nThe page will now reload to show onboarding.')

    // Reload page to start fresh
    window.location.reload()
  } catch (error) {
    console.error('❌ Error in developer reset:', error)
    alert('Failed to perform developer reset.')
  } finally {
    isClearing.value = false
  }
}

// Profile management functions
async function loadUserProfile() {
  try {
    // Initialize user in leaderboard service
    const userInfo = await leaderboardService.initUser()

    userProfile.value.userId = userInfo.userId
    userProfile.value.username = userInfo.username

    // Fetch user stats from Firestore
    if (userInfo.userId) {
      const userRef = doc(leaderboardService.db, 'users', userInfo.userId)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        const data = userDoc.data()
        userProfile.value.totalScore = data.totalScore || 0
        userProfile.value.quizzesTaken = data.quizzesTaken || 0
        userProfile.value.level = data.level || 1
        userProfile.value.lastActive = data.lastActive
      }
    }

    console.log('✅ User profile loaded:', userProfile.value)
  } catch (error) {
    console.error('❌ Error loading user profile:', error)
    userProfile.value.username = 'Error loading profile'
  }
}

function openUsernameDialog() {
  newUsername.value = userProfile.value.username
  showUsernameDialog.value = true
}

function closeUsernameDialog() {
  showUsernameDialog.value = false
  newUsername.value = ''
}

async function handleUpdateUsername() {
  if (!newUsername.value.trim()) {
    alert('Please enter a username')
    return
  }

  if (newUsername.value.trim().length > 30) {
    alert('Username must be 30 characters or less')
    return
  }

  try {
    isUpdatingUsername.value = true

    // Update username in leaderboard service
    await leaderboardService.updateUsername(newUsername.value.trim())

    // Update local state
    userProfile.value.username = newUsername.value.trim()

    console.log('✅ Username updated successfully')

    closeUsernameDialog()

    // Show success message
    alert('Username updated successfully!')
  } catch (error) {
    console.error('❌ Error updating username:', error)
    alert('Failed to update username. Please try again.')
  } finally {
    isUpdatingUsername.value = false
  }
}

// Prayer Times functions
function loadPrayerSettings() {
  try {
    const settings = prayerTimesService.getSettings()
    prayerSettings.value = {
      location: settings.location,
      locationName: settings.locationName,
      calculationMethod: settings.calculationMethod,
      madhab: settings.madhab
    }

    // Pre-fill manual location if exists
    if (settings.location) {
      manualLocation.value.latitude = settings.location.latitude.toString()
      manualLocation.value.longitude = settings.location.longitude.toString()
      manualLocation.value.name = settings.locationName

      // Calculate Qibla direction
      try {
        qiblaDirection.value = prayerTimesService.getQiblaDirection()
      } catch (e) {
        console.error('Failed to calculate Qibla direction:', e)
      }
    }
  } catch (error) {
    console.error('Failed to load prayer settings:', error)
  }
}

async function detectLocation() {
  try {
    detectingLocation.value = true

    const location = await prayerTimesService.detectLocation()

    // Update UI
    prayerSettings.value.location = {
      latitude: location.latitude,
      longitude: location.longitude
    }
    prayerSettings.value.locationName = location.locationName

    // Update manual location fields
    manualLocation.value.latitude = location.latitude.toString()
    manualLocation.value.longitude = location.longitude.toString()
    manualLocation.value.name = location.locationName

    // Update Qibla direction
    qiblaDirection.value = prayerTimesService.getQiblaDirection()

    alert(`Location detected: ${location.locationName}`)
  } catch (error) {
    console.error('Failed to detect location:', error)
    alert(error.message || 'Failed to detect location. Please check your browser permissions.')
  } finally {
    detectingLocation.value = false
  }
}

function saveManualLocation() {
  try {
    const lat = parseFloat(manualLocation.value.latitude)
    const lon = parseFloat(manualLocation.value.longitude)
    const name = manualLocation.value.name.trim() || 'Manual Location'

    prayerTimesService.saveLocation(lat, lon, name)

    // Update UI
    prayerSettings.value.location = { latitude: lat, longitude: lon }
    prayerSettings.value.locationName = name

    // Update Qibla direction
    qiblaDirection.value = prayerTimesService.getQiblaDirection()

    alert('Location saved successfully!')
  } catch (error) {
    console.error('Failed to save location:', error)
    alert('Failed to save location. Please try again.')
  }
}

function saveCalculationMethod() {
  try {
    prayerTimesService.saveCalculationMethod(prayerSettings.value.calculationMethod)
    console.log('Calculation method saved:', prayerSettings.value.calculationMethod)
  } catch (error) {
    console.error('Failed to save calculation method:', error)
  }
}

function saveMadhab() {
  try {
    prayerTimesService.saveMadhab(prayerSettings.value.madhab)
    console.log('Madhab saved:', prayerSettings.value.madhab)
  } catch (error) {
    console.error('Failed to save madhab:', error)
  }
}
</script>
