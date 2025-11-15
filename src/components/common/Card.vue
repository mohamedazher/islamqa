<template>
  <component
    :is="clickable ? 'button' : 'div'"
    class="card relative bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 transition-all"
    :class="[
      clickable ? 'cursor-pointer card-hover active:scale-[0.98]' : '',
      padding === 'none' ? '' : padding === 'sm' ? 'p-3' : padding === 'md' ? 'p-4' : 'p-6',
      islamicBorder ? 'islamic-border' : '',
      islamicStyle ? 'card-islamic' : '',
      className
    ]"
    @click="clickable && $emit('click', $event)"
  >
    <slot></slot>
  </component>
</template>

<script setup>
defineProps({
  clickable: {
    type: Boolean,
    default: false
  },
  padding: {
    type: String,
    default: 'md', // none, sm, md, lg
    validator: (value) => ['none', 'sm', 'md', 'lg'].includes(value)
  },
  islamicBorder: {
    type: Boolean,
    default: false
  },
  islamicStyle: {
    type: Boolean,
    default: false
  },
  className: {
    type: String,
    default: ''
  }
})

defineEmits(['click'])
</script>
