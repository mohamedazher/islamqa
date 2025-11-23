<template>
  <div class="qibla-compass flex flex-col items-center justify-center">
    <!-- Compass Container -->
    <div class="relative" :style="{ width: size + 'px', height: size + 'px' }">
      <!-- Outer Ring with Degree Markers -->
      <svg
        :width="size"
        :height="size"
        class="absolute inset-0"
      >
        <!-- Background Circle -->
        <circle
          :cx="size / 2"
          :cy="size / 2"
          :r="size / 2 - 4"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="text-neutral-200 dark:text-neutral-700"
        />

        <!-- Degree Markers -->
        <g :transform="`translate(${size / 2}, ${size / 2})`">
          <!-- Major markers every 30 degrees -->
          <g v-for="deg in majorDegrees" :key="'major-' + deg">
            <line
              :x1="0"
              :y1="-(size / 2 - 20)"
              :x2="0"
              :y2="-(size / 2 - 8)"
              stroke="currentColor"
              stroke-width="2"
              class="text-neutral-400 dark:text-neutral-500"
              :transform="`rotate(${deg})`"
            />
          </g>
          <!-- Minor markers every 10 degrees -->
          <g v-for="deg in minorDegrees" :key="'minor-' + deg">
            <line
              :x1="0"
              :y1="-(size / 2 - 16)"
              :x2="0"
              :y2="-(size / 2 - 8)"
              stroke="currentColor"
              stroke-width="1"
              class="text-neutral-300 dark:text-neutral-600"
              :transform="`rotate(${deg})`"
            />
          </g>
        </g>

        <!-- Cardinal Direction Labels -->
        <g :transform="`translate(${size / 2}, ${size / 2})`">
          <text
            v-for="cardinal in cardinals"
            :key="cardinal.label"
            :x="cardinal.x"
            :y="cardinal.y"
            text-anchor="middle"
            dominant-baseline="middle"
            class="text-xs font-bold fill-current"
            :class="cardinal.label === 'N' ? 'text-red-500 dark:text-red-400' : 'text-neutral-600 dark:text-neutral-400'"
          >
            {{ cardinal.label }}
          </text>
        </g>
      </svg>

      <!-- Rotating Compass Rose (rotates opposite to device heading) -->
      <div
        class="absolute inset-0 transition-transform"
        :style="{
          transform: `rotate(${-deviceHeading}deg)`,
          transitionDuration: smooth ? '100ms' : '0ms'
        }"
      >
        <!-- Inner compass circle -->
        <svg :width="size" :height="size" class="absolute inset-0">
          <circle
            :cx="size / 2"
            :cy="size / 2"
            :r="size / 2 - 40"
            fill="currentColor"
            class="text-neutral-100 dark:text-neutral-800"
          />
        </svg>
      </div>

      <!-- Qibla Direction Indicator (always points to Qibla) -->
      <div
        class="absolute inset-0 transition-transform"
        :style="{
          transform: `rotate(${qiblaRelative}deg)`,
          transitionDuration: smooth ? '100ms' : '0ms'
        }"
      >
        <svg :width="size" :height="size" class="absolute inset-0">
          <!-- Qibla Arrow -->
          <g :transform="`translate(${size / 2}, ${size / 2})`">
            <!-- Arrow body -->
            <polygon
              :points="`0,${-(size / 2 - 50)} -12,${-(size / 2 - 90)} 0,${-(size / 2 - 80)} 12,${-(size / 2 - 90)}`"
              fill="currentColor"
              class="text-emerald-500 dark:text-emerald-400"
            />
            <!-- Arrow line -->
            <line
              x1="0"
              :y1="-(size / 2 - 90)"
              x2="0"
              y2="0"
              stroke="currentColor"
              stroke-width="3"
              class="text-emerald-500 dark:text-emerald-400"
            />
          </g>
        </svg>
      </div>

      <!-- Center Kaaba Icon -->
      <div
        class="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300"
          :class="isAligned
            ? 'bg-emerald-500 dark:bg-emerald-600 text-white'
            : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 shadow-lg'"
        >
          <!-- Kaaba Symbol -->
          <svg
            viewBox="0 0 24 24"
            class="w-8 h-8"
            fill="currentColor"
          >
            <!-- 3D Kaaba cube -->
            <path d="M12 2L3 6.5v11L12 22l9-4.5v-11L12 2zm0 1.5l7.5 3.75L12 11 4.5 7.25 12 3.5zM4.5 8.5l7 3.5v8l-7-3.5v-8zm8.5 11.5v-8l7-3.5v8l-7 3.5z" />
          </svg>
        </div>
      </div>

      <!-- North Indicator (fixed at top) -->
      <div class="absolute top-2 left-1/2 -translate-x-1/2">
        <div class="w-3 h-3 bg-red-500 dark:bg-red-400 rounded-full shadow"></div>
      </div>

      <!-- Alignment Glow Effect -->
      <div
        v-if="isAligned"
        class="absolute inset-0 rounded-full animate-pulse"
        :style="{
          boxShadow: '0 0 40px rgba(16, 185, 129, 0.5), inset 0 0 40px rgba(16, 185, 129, 0.1)'
        }"
      ></div>
    </div>

    <!-- Direction Info -->
    <div class="mt-6 text-center">
      <div class="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
        {{ Math.round(qiblaDirection) }}°
        <span class="text-lg font-normal text-neutral-500 dark:text-neutral-400">
          {{ cardinalDirection }}
        </span>
      </div>
      <div v-if="isAligned" class="mt-2 text-emerald-600 dark:text-emerald-400 font-semibold animate-pulse">
        Facing Qibla
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Qibla direction from North (0-360)
  qiblaDirection: {
    type: Number,
    required: true
  },
  // Current device heading from compass (0-360)
  deviceHeading: {
    type: Number,
    default: 0
  },
  // Cardinal direction string (N, NE, E, etc.)
  cardinalDirection: {
    type: String,
    default: ''
  },
  // Size of compass in pixels
  size: {
    type: Number,
    default: 280
  },
  // Enable smooth transitions
  smooth: {
    type: Boolean,
    default: true
  },
  // Tolerance for alignment detection (degrees)
  alignmentTolerance: {
    type: Number,
    default: 5
  }
})

// Calculate Qibla direction relative to device
const qiblaRelative = computed(() => {
  return (props.qiblaDirection - props.deviceHeading + 360) % 360
})

// Check if device is aligned with Qibla
const isAligned = computed(() => {
  const relative = qiblaRelative.value
  return relative <= props.alignmentTolerance || relative >= (360 - props.alignmentTolerance)
})

// Major degree markers (every 30 degrees)
const majorDegrees = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]

// Minor degree markers (every 10 degrees, excluding major ones)
const minorDegrees = [10, 20, 40, 50, 70, 80, 100, 110, 130, 140, 160, 170, 190, 200, 220, 230, 250, 260, 280, 290, 310, 320, 340, 350]

// Cardinal direction positions
const cardinals = computed(() => {
  const radius = props.size / 2 - 30
  return [
    { label: 'N', x: 0, y: -radius },
    { label: 'E', x: radius, y: 0 },
    { label: 'S', x: 0, y: radius },
    { label: 'W', x: -radius, y: 0 }
  ]
})
</script>

<style scoped>
.qibla-compass {
  user-select: none;
  -webkit-user-select: none;
}
</style>
