<template>
  <div
    class="question-item bg-white dark:bg-neutral-800 rounded-lg shadow dark:shadow-neutral-900/50 p-4 cursor-pointer transition-all hover:shadow-md dark:hover:shadow-neutral-900 active:bg-primary-50 dark:active:bg-primary-900/20"
    @click="$emit('click')"
  >
    <!-- UPDATED: Changed question field references for new data structure -->
    <h4 class="font-semibold text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-2">{{ question.title }}</h4>
    <!-- UPDATED: Changed question_full to question (HTML content), removed display of HTML -->
    <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-1">{{ question.title }}</p>
    <div class="flex items-center justify-between">
      <!-- UPDATED: Changed question_no to reference -->
      <span class="text-xs text-primary-600 dark:text-primary-400 font-medium">Q#{{ question.reference }}</span>
      <Icon name="chevronRight" size="sm" class="text-neutral-400 dark:text-neutral-500" />
    </div>
  </div>
</template>

<script setup>
import Icon from '@/components/common/Icon.vue'

defineProps({
  question: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
