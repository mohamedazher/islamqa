<template>
  <div
    class="question-item bg-white dark:bg-neutral-800 rounded-lg shadow dark:shadow-neutral-900/50 p-4 cursor-pointer transition-all hover:shadow-md dark:hover:shadow-neutral-900 active:bg-primary-50 dark:active:bg-primary-900/20"
    @click="$emit('click')"
  >
    <h4 class="font-semibold text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-2">{{ question.question }}</h4>
    <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-1">{{ question.question_full }}</p>
    <div class="flex items-center justify-between">
      <span class="text-xs text-primary-600 dark:text-primary-400 font-medium">Q#{{ question.question_no }}</span>
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
