<template>
  <div class="ornamental-divider-wrapper" :class="spacing">
    <div class="ornamental-divider"></div>
  </div>
</template>

<script setup>
defineProps({
  spacing: {
    type: String,
    default: 'my-8', // Options: my-4, my-6, my-8, my-12
    validator: (value) => ['my-4', 'my-6', 'my-8', 'my-12', 'my-16'].includes(value)
  }
})
</script>

<style scoped>
.ornamental-divider-wrapper {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
