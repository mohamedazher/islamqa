<template>
  <div class="privacy-view h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
    <!-- Header -->
    <header class="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white p-4 shadow flex items-center">
      <button @click="goBack" class="mr-3 hover:opacity-80 transition-opacity">
        <Icon name="arrowLeft" size="md" />
      </button>
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <Icon name="shield" size="lg" class="flex-shrink-0" />
        <div class="min-w-0">
          <h1 class="text-lg md:text-xl font-bold truncate">Privacy Information</h1>
          <p class="text-primary-100 dark:text-primary-200 text-xs md:text-sm truncate">How we protect your data</p>
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4 pb-20 lg:pb-4 space-y-4">
      <!-- Overview -->
      <section class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 p-6">
        <div class="flex items-start gap-4 mb-4">
          <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
            <Icon name="shield" size="lg" class="text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Your Privacy Matters</h2>
            <p class="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              We believe in transparency and respect for your privacy. This page explains what data we collect,
              why we collect it, and how you control it.
            </p>
          </div>
        </div>
      </section>

      <!-- What We Collect (Optional) -->
      <section class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 overflow-hidden">
        <div class="px-6 py-4 bg-primary-50 dark:bg-primary-950/30 border-b border-primary-200 dark:border-primary-800">
          <h2 class="text-lg font-semibold text-primary-900 dark:text-primary-100 flex items-center gap-2">
            <Icon name="document" size="md" class="text-primary-600 dark:text-primary-400" />
            What We Collect (With Your Consent)
          </h2>
        </div>
        <div class="p-6 space-y-4">
          <div v-for="(item, index) in privacyInfo.dataCollected.filter(d => !d.required)" :key="index" class="border-l-4 border-primary-500 dark:border-primary-600 pl-4">
            <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{{ item.category }}</h3>
            <ul class="space-y-1.5 mb-3">
              <li v-for="(detail, i) in item.items" :key="i" class="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                <span class="text-primary-600 dark:text-primary-400 mt-0.5">•</span>
                <span>{{ detail }}</span>
              </li>
            </ul>
            <div class="space-y-1 text-sm">
              <p><strong class="text-neutral-900 dark:text-neutral-100">Purpose:</strong> {{ item.purpose }}</p>
              <p><strong class="text-neutral-900 dark:text-neutral-100">Retention:</strong> {{ item.retention }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Essential Data -->
      <section class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 overflow-hidden">
        <div class="px-6 py-4 bg-accent-50 dark:bg-accent-950/30 border-b border-accent-200 dark:border-accent-800">
          <h2 class="text-lg font-semibold text-accent-900 dark:text-accent-100 flex items-center gap-2">
            <Icon name="cog" size="md" class="text-accent-600 dark:text-accent-400" />
            Essential Data (Required for App)
          </h2>
        </div>
        <div class="p-6">
          <div v-for="(item, index) in privacyInfo.dataCollected.filter(d => d.required)" :key="index" class="border-l-4 border-accent-500 dark:border-accent-600 pl-4">
            <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{{ item.category }}</h3>
            <ul class="space-y-1.5 mb-3">
              <li v-for="(detail, i) in item.items" :key="i" class="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                <span class="text-accent-600 dark:text-accent-400 mt-0.5">•</span>
                <span>{{ detail }}</span>
              </li>
            </ul>
            <div class="space-y-1 text-sm">
              <p><strong class="text-neutral-900 dark:text-neutral-100">Purpose:</strong> {{ item.purpose }}</p>
              <p><strong class="text-neutral-900 dark:text-neutral-100">Retention:</strong> {{ item.retention }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- What We DON'T Collect -->
      <section class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 overflow-hidden">
        <div class="px-6 py-4 bg-green-50 dark:bg-green-950/30 border-b border-green-200 dark:border-green-800">
          <h2 class="text-lg font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
            <Icon name="check" size="md" class="text-green-600 dark:text-green-400" />
            What We Never Collect
          </h2>
        </div>
        <div class="p-6">
          <ul class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <li v-for="(item, index) in privacyInfo.dataNotCollected" :key="index" class="flex items-start gap-2">
              <Icon name="check" size="sm" class="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <span class="text-neutral-700 dark:text-neutral-300">{{ item }}</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- Third-Party Services -->
      <section class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 overflow-hidden">
        <div class="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Icon name="globe" size="md" class="text-primary-600 dark:text-primary-400" />
            Third-Party Services
          </h2>
        </div>
        <div class="p-6 space-y-3">
          <div v-for="(service, index) in privacyInfo.thirdPartyServices" :key="index" class="bg-neutral-50 dark:bg-neutral-950/50 rounded-lg p-4 border border-neutral-200 dark:border-neutral-800">
            <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{{ service.name }}</h3>
            <p class="text-sm text-neutral-700 dark:text-neutral-300 mb-2">{{ service.purpose }}</p>
            <a :href="service.link" target="_blank" rel="noopener noreferrer" class="text-sm text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1">
              Privacy Policy
              <Icon name="chevronRight" size="xs" />
            </a>
          </div>
        </div>
      </section>

      <!-- Your Rights -->
      <section class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 overflow-hidden">
        <div class="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Icon name="user" size="md" class="text-primary-600 dark:text-primary-400" />
            Your Rights
          </h2>
        </div>
        <div class="p-6">
          <ul class="space-y-3">
            <li v-for="(right, index) in privacyInfo.userRights" :key="index" class="flex items-start gap-3">
              <div class="w-6 h-6 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span class="text-primary-600 dark:text-primary-400 text-xs font-bold">{{ index + 1 }}</span>
              </div>
              <span class="text-neutral-700 dark:text-neutral-300">{{ right }}</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- GDPR & Compliance -->
      <section class="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-950/30 dark:to-accent-950/30 rounded-lg shadow dark:shadow-neutral-800/50 p-6">
        <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
          <Icon name="globe" size="md" class="text-primary-600 dark:text-primary-400" />
          Privacy Compliance
        </h2>
        <p class="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
          We respect privacy regulations including GDPR, CCPA, and other data protection laws.
          All analytics data is anonymous and cannot be used to identify you personally.
        </p>
        <div class="bg-white dark:bg-neutral-900 rounded-lg p-4 border border-primary-200 dark:border-primary-800">
          <p class="text-sm text-neutral-700 dark:text-neutral-300">
            <strong class="text-neutral-900 dark:text-neutral-100">Data Controller:</strong> BetterIslam Q&A App<br>
            <strong class="text-neutral-900 dark:text-neutral-100">Contact:</strong> For privacy concerns, please visit our
            <a href="https://github.com/mohamedazher/islamqa/issues" target="_blank" class="text-primary-600 dark:text-primary-400 hover:underline">GitHub Issues</a>
          </p>
        </div>
      </section>

      <!-- Actions -->
      <section class="bg-white dark:bg-neutral-900 rounded-lg shadow dark:shadow-neutral-800/50 p-6">
        <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Manage Your Privacy</h2>
        <div class="space-y-3">
          <button
            @click="goToSettings"
            class="w-full bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 text-white px-6 py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 dark:hover:from-primary-600 dark:hover:to-primary-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Icon name="cog" size="md" />
            Go to Privacy Settings
          </button>

          <p class="text-sm text-center text-neutral-600 dark:text-neutral-400">
            You can change your privacy preferences anytime in the Settings page
          </p>
        </div>
      </section>

      <!-- Last Updated -->
      <div class="text-center py-4">
        <p class="text-sm text-neutral-500 dark:text-neutral-500">
          Last updated: {{ lastUpdated }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '@/components/common/Icon.vue'
import { getPrivacyInfo } from '@/services/privacyConsent'

const router = useRouter()
const privacyInfo = getPrivacyInfo()

const lastUpdated = computed(() => {
  const date = new Date()
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
})

function goBack() {
  router.back()
}

function goToSettings() {
  router.push('/settings')
}
</script>
