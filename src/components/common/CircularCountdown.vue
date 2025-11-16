<template>
  <div class="circular-countdown relative" :style="{ width: size + 'px', height: size + 'px' }">
    <!-- SVG Circle Progress -->
    <svg class="countdown-svg" :width="size" :height="size" viewBox="0 0 100 100">
      <!-- Background circle -->
      <circle
        class="countdown-bg"
        cx="50"
        cy="50"
        :r="radius"
        fill="none"
        :stroke="bgColor"
        :stroke-width="strokeWidth"
      />
      <!-- Progress circle -->
      <circle
        class="countdown-progress"
        cx="50"
        cy="50"
        :r="radius"
        fill="none"
        :stroke="progressColor"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        stroke-linecap="round"
        transform="rotate(-90 50 50)"
      />
    </svg>

    <!-- Countdown Text -->
    <div class="absolute inset-0 flex flex-col items-center justify-center px-2">
      <div class="countdown-time font-mono font-bold leading-tight text-center" :style="{ fontSize: timeFontSize }">
        {{ formattedTime }}
      </div>
      <div v-if="label" class="countdown-label mt-0.5 opacity-80 text-center" :style="{ fontSize: labelFontSize }">
        {{ label }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Countdown values
  hours: {
    type: Number,
    default: 0
  },
  minutes: {
    type: Number,
    default: 0
  },
  seconds: {
    type: Number,
    default: 0
  },
  totalSeconds: {
    type: Number,
    required: true
  },
  // Max duration for progress calculation (in seconds)
  maxDuration: {
    type: Number,
    default: null // If null, will use totalSeconds as max
  },
  // Display options
  size: {
    type: Number,
    default: 120
  },
  strokeWidth: {
    type: Number,
    default: 8
  },
  progressColor: {
    type: String,
    default: 'currentColor'
  },
  bgColor: {
    type: String,
    default: 'rgba(255, 255, 255, 0.2)'
  },
  label: {
    type: String,
    default: ''
  },
  // Show format: 'auto', 'hms', 'ms', 's'
  format: {
    type: String,
    default: 'auto'
  }
})

// Circle calculations
const radius = computed(() => (100 - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)

// Calculate progress offset
// Shows remaining time: circle empties as time runs out
const dashOffset = computed(() => {
  const maxDuration = props.maxDuration || props.totalSeconds
  const progress = props.totalSeconds / maxDuration
  // Use progress directly (not 1-progress) so circle empties as time decreases
  return circumference.value * progress
})

// Format time display
const formattedTime = computed(() => {
  const { hours, minutes, seconds } = props

  switch (props.format) {
    case 'hms':
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    case 'ms':
      return `${minutes}:${String(seconds).padStart(2, '0')}`
    case 's':
      return `${seconds}s`
    case 'auto':
    default:
      if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      } else if (minutes > 0) {
        return `${minutes}:${String(seconds).padStart(2, '0')}`
      } else {
        return `${seconds}s`
      }
  }
})

// Responsive font sizes
const timeFontSize = computed(() => {
  // Adjust font size based on text length to prevent overflow
  const textLength = formattedTime.value.length
  let divisor = 5.5 // Base divisor for shorter text

  if (textLength >= 8) {
    // For "HH:MM:SS" format (8 chars)
    divisor = 6.5
  } else if (textLength >= 5) {
    // For "MM:SS" format (5 chars)
    divisor = 6
  }

  const baseSize = props.size / divisor
  return `${Math.floor(baseSize)}px`
})

const labelFontSize = computed(() => {
  const baseSize = props.size / 14 // Slightly smaller than before
  return `${Math.floor(baseSize)}px`
})
</script>

<style scoped>
.circular-countdown {
  display: inline-block;
  position: relative;
}

.countdown-svg {
  transform: scaleX(-1); /* Flip horizontally to make it count down clockwise */
}

.countdown-progress {
  transition: stroke-dashoffset 0.5s linear;
}

.countdown-time {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.countdown-label {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
</style>
