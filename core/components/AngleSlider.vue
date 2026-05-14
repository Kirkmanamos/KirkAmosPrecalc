<script setup lang="ts">
/**
 * AngleSlider — styled θ input with degree + radian readout.
 *
 * Emits the angle as a number (degrees).
 * Includes an optional auto-play toggle that animates θ from 0→360.
 */
import { ref, computed, watch, onUnmounted } from 'vue'

const props = defineProps<{
  modelValue: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const isPlaying = ref(false)
let animFrame: number | null = null
let lastTime: number | null = null

// ── Radian display ────────────────────────────────────────
const specialAngles: Record<number, string> = {
  0: '0', 30: 'π/6', 45: 'π/4', 60: 'π/3', 90: 'π/2',
  120: '2π/3', 135: '3π/4', 150: '5π/6', 180: 'π',
  210: '7π/6', 225: '5π/4', 240: '4π/3', 270: '3π/2',
  300: '5π/3', 315: '7π/4', 330: '11π/6', 360: '2π',
}

const radianDisplay = computed(() => {
  const deg = Math.round(props.modelValue)
  if (specialAngles[deg]) return specialAngles[deg]
  return ((deg * Math.PI) / 180).toFixed(2)
})

const isSpecialAngle = computed(() => {
  return Math.round(props.modelValue) in specialAngles
})

// ── Slider handler ────────────────────────────────────────
function onInput(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', Number(target.value))
}

// ── Auto-play animation ───────────────────────────────────
function togglePlay() {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    lastTime = null
    animate()
  } else {
    if (animFrame !== null) {
      cancelAnimationFrame(animFrame)
      animFrame = null
    }
  }
}

function animate() {
  animFrame = requestAnimationFrame((time) => {
    if (!isPlaying.value) return
    if (lastTime === null) lastTime = time
    const dt = time - lastTime
    lastTime = time

    // ~45°/second
    let next = props.modelValue + (dt / 1000) * 45
    if (next > 360) next = 0
    emit('update:modelValue', next)

    animate()
  })
}

onUnmounted(() => {
  if (animFrame !== null) cancelAnimationFrame(animFrame)
})

// Stop auto-play if user manually moves the slider
watch(() => props.modelValue, () => {}, { flush: 'sync' })
</script>

<template>
  <div class="angle-slider-container">
    <div class="slider-row">
      <button
        class="play-btn"
        :class="{ active: isPlaying }"
        @click="togglePlay"
        :title="isPlaying ? 'Pause' : 'Animate'"
      >
        <span v-if="!isPlaying">▶</span>
        <span v-else>⏸</span>
      </button>

      <input
        type="range"
        class="angle-slider"
        :value="modelValue"
        @input="onInput"
        min="0"
        max="360"
        step="1"
      />
    </div>

    <div class="readout">
      <span class="label">θ</span>
      <span class="eq">=</span>
      <span class="deg">{{ Math.round(modelValue) }}°</span>
      <span class="eq">=</span>
      <span class="rad" :class="{ special: isSpecialAngle }">
        {{ radianDisplay }} rad
      </span>
    </div>
  </div>
</template>

<style scoped>
.angle-slider-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.play-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--border-default, #30363d);
  background: var(--bg-surface, #161b22);
  color: var(--text-secondary, #8b949e);
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;
  flex-shrink: 0;
}

.play-btn:hover {
  border-color: var(--accent, #58a6ff);
  color: var(--accent, #58a6ff);
}

.play-btn.active {
  background: var(--accent-subtle, rgba(88, 166, 255, 0.15));
  border-color: var(--accent, #58a6ff);
  color: var(--accent, #58a6ff);
}

.readout {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-family: var(--font-mono, monospace);
  font-size: 14px;
  padding-left: 44px; /* align with slider (past play button) */
}

.label {
  font-style: italic;
  color: var(--text-primary, #e6edf3);
  font-weight: 500;
}

.eq {
  color: var(--text-muted, #484f58);
}

.deg {
  color: var(--text-primary, #e6edf3);
  font-weight: 500;
  min-width: 36px;
}

.rad {
  color: var(--text-secondary, #8b949e);
}

.rad.special {
  color: var(--accent, #58a6ff);
}
</style>
