<script setup lang="ts">
/**
 * TriangleDiagram — illustrates the right triangle inscribed in the unit circle.
 *
 * Two modes:
 *   'pythagorean' — Slide 2: shows x, y, r=1 and the Pythagorean theorem
 *   'trigRatios'  — Slide 3: shows how sin/cos equal the coordinates
 */
import { ref } from 'vue'
import { useCanvasRenderer } from '../composables/useCanvasRenderer'
import { renderTriangleDiagram, type DiagramMode } from '../renderers/triangleDiagramRenderer'

const props = withDefaults(defineProps<{
  mode: DiagramMode
  angle?: number
}>(), {
  angle: 50
})

const canvasRef = ref<HTMLCanvasElement | null>(null)

useCanvasRenderer(
  canvasRef,
  (ctx, w, h) => {
    renderTriangleDiagram(ctx, w, h, props.mode, props.angle)
  },
  [() => props.mode, () => props.angle]
)
</script>

<template>
  <div class="triangle-diagram">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<style scoped>
.triangle-diagram {
  width: 100%;
  height: 100%;
  min-height: 320px;
  border-radius: var(--radius-lg, 16px);
  border: 1px solid var(--border-subtle, rgba(139, 148, 158, 0.12));
  overflow: hidden;
}

.triangle-diagram canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
