<template>
  <div
    class="category-card bg-white rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-md active:bg-gray-50"
    @click="$emit('click')"
  >
    <div class="flex items-center">
      <div class="text-3xl mr-4">📖</div>
      <div class="flex-1">
        <h3 class="font-semibold text-gray-900">{{ category.category_links }}</h3>
        <p class="text-sm text-gray-600 mt-1">Category {{ category.element }}</p>
      </div>
      <div class="text-gray-400 text-xl">→</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  category: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])
</script>

<style scoped>
.category-card {
  user-select: none;
  -webkit-user-select: none;
}
</style>
