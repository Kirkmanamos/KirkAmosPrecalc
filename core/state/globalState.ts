import { reactive } from 'vue'

/**
 * Global reactive state shared across all slides.
 * 
 * Using a module-level reactive object ensures state persists
 * when navigating between slides in Slidev.
 */
export const state = reactive({
  /** Current angle in degrees (0–360) */
  angle: 45,

  /** Which trig functions are visible on the visualization */
  showSine: true,
  showCosine: false,
  showTangent: false,

  /** Whether to draw the wave trace from 0 to current angle */
  traceHistory: true,

  /** Auto-play animation state */
  isPlaying: false,
})
