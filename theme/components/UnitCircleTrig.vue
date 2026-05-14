<script setup lang="ts">
/**
 * UnitCircleTrig — main interactive component for Phase 1.
 *
 * Composes the canvas renderer, angle slider, and toggle buttons
 * into a single full-slide interactive visualization.
 */
import { ref, computed, watch } from 'vue'
import { state } from '../state/globalState'
import { useCanvasRenderer } from '../composables/useCanvasRenderer'
import { renderUnitCircle } from '../renderers/unitCircleRenderer'

const canvasRef = ref<HTMLCanvasElement | null>(null)

// Bridge: Vue reactive state → Canvas renderer
useCanvasRenderer(
  canvasRef,
  (ctx, w, h) => {
    renderUnitCircle(ctx, w, h, {
      angle: state.angle,
      showSine: state.showSine,
      showCosine: state.showCosine,
      showTangent: state.showTangent,
      traceHistory: state.traceHistory,
    })
  },
  [
    () => state.angle,
    () => state.showSine,
    () => state.showCosine,
    () => state.showTangent,
    () => state.traceHistory,
  ]
)

// ── Toggle handlers ───────────────────────────────────────
function toggleSine() {
  state.showSine = !state.showSine
}
function toggleCosine() {
  state.showCosine = !state.showCosine
}
function toggleTrace() {
  state.traceHistory = !state.traceHistory
}
function resetAngle() {
  state.angle = 0
}
</script>

<template>
  <div class="unit-circle-layout">
    <!-- Canvas visualization -->
    <div class="canvas-area">
      <canvas ref="canvasRef"></canvas>
    </div>

    <!-- Controls bar -->
    <div class="controls-bar">
      <div class="slider-section">
        <AngleSlider v-model="state.angle" />
      </div>

      <div class="toggles">
        <button
          class="toggle-btn"
          :class="{ active: state.showSine }"
          @click="toggleSine"
        >
          <span class="dot sin-dot"></span>
          sin θ
        </button>

        <button
          class="toggle-btn"
          :class="{ active: state.showCosine }"
          @click="toggleCosine"
        >
          <span class="dot cos-dot"></span>
          cos θ
        </button>

        <button
          class="toggle-btn"
          :class="{ active: state.traceHistory }"
          @click="toggleTrace"
        >
          Trace
        </button>

        <button
          class="reset-btn"
          @click="resetAngle"
          title="Reset to 0°"
        >
          ↺
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.unit-circle-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: 12px;
  padding: 8px 16px 12px;
  box-sizing: border-box;
}

.canvas-area {
  flex: 1;
  min-height: 0;
  position: relative;
  border-radius: var(--radius-lg, 16px);
  border: 1px solid var(--border-subtle, rgba(139, 148, 158, 0.12));
  overflow: hidden;
}

.canvas-area canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.controls-bar {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  flex-shrink: 0;
}

.slider-section {
  flex: 1;
  min-width: 0;
}

.toggles {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding-top: 2px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--border-default, #30363d);
  background: var(--bg-surface, #161b22);
  color: var(--text-secondary, #8b949e);
  font-family: var(--font-mono, monospace);
  font-size: 12px;
  cursor: pointer;
  transition: all 150ms ease;
  white-space: nowrap;
}

.toggle-btn:hover {
  border-color: var(--text-secondary, #8b949e);
}

.toggle-btn.active {
  border-color: var(--accent, #58a6ff);
  background: var(--accent-subtle, rgba(88, 166, 255, 0.15));
  color: var(--text-primary, #e6edf3);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.sin-dot {
  background: var(--color-sin, #79c0ff);
}

.cos-dot {
  background: var(--color-cos, #d29922);
}

.reset-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid var(--border-default, #30363d);
  background: var(--bg-surface, #161b22);
  color: var(--text-secondary, #8b949e);
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;
}

.reset-btn:hover {
  border-color: var(--text-secondary, #8b949e);
  color: var(--text-primary, #e6edf3);
}

/* Responsive: stack on narrow viewports */
@media (max-width: 640px) {
  .controls-bar {
    flex-direction: column;
    gap: 12px;
  }

  .toggles {
    flex-wrap: wrap;
  }
}
</style>
