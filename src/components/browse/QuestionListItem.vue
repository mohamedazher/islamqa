<template>
  <div
    class="question-item bg-white rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-md active:bg-blue-50"
    @click="$emit('click')"
  >
    <h4 class="font-semibold text-gray-900 mb-2 line-clamp-2">{{ question.question }}</h4>
    <p class="text-sm text-gray-600 mb-3 line-clamp-1">{{ question.question_full }}</p>
    <div class="flex items-center justify-between">
      <span class="text-xs text-blue-600 font-medium">Q#{{ question.question_no }}</span>
      <span class="text-gray-400 text-xl">→</span>
    </div>
  </div>
</template>

<script setup>
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
