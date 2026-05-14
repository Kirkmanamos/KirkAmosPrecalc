<script setup lang="ts">
/**
 * MathCanvas — reusable canvas container component.
 * 
 * Provides a properly sized <canvas> element that fills its parent.
 * Exposes the canvas ref for use with useCanvasRenderer composable.
 */
import { ref } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)

defineExpose({ canvasRef })
</script>

<template>
  <div class="math-canvas-wrap">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<style scoped>
.math-canvas-wrap {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: var(--radius-lg, 16px);
  overflow: hidden;
}

.math-canvas-wrap canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
