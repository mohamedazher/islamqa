<template>
  <div
    class="nav-card bg-white rounded-xl shadow-md p-5 cursor-pointer transition-all hover:shadow-lg hover:scale-105 active:scale-95 relative overflow-hidden"
    @click="$emit('click')"
  >
    <!-- Badge (optional) -->
    <div v-if="badge" class="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
      {{ badge }}
    </div>

    <!-- Icon -->
    <div class="text-4xl mb-3">{{ icon }}</div>

    <!-- Content -->
    <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ title }}</h3>
    <p class="text-sm text-gray-600">{{ description }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  badge: {
    type: String,
    default: ''
  }
})

defineEmits(['click'])
</script>

<style scoped>
.nav-card {
  user-select: none;
  -webkit-user-select: none;
}
</style>
