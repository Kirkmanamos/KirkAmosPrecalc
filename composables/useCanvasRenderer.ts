import { ref, onMounted, onUnmounted, watch, type Ref, type WatchSource } from 'vue'

/**
 * Vue composable that bridges reactive state to Canvas2D rendering.
 *
 * Handles:
 * - HiDPI / Retina scaling (devicePixelRatio)
 * - Responsive resizing via ResizeObserver
 * - Efficient rendering: only redraws when watched dependencies change
 * - Cleanup on component unmount
 *
 * @param canvasRef - Vue ref to the <canvas> element
 * @param renderFn  - Pure drawing function (receives ctx, logical width, logical height)
 * @param deps      - Reactive sources that trigger a re-render when changed
 */
export function useCanvasRenderer(
  canvasRef: Ref<HTMLCanvasElement | null>,
  renderFn: (ctx: CanvasRenderingContext2D, width: number, height: number) => void,
  deps: WatchSource[]
) {
  const width = ref(0)
  const height = ref(0)
  let resizeObserver: ResizeObserver | null = null
  let rafId: number | null = null

  function configureCanvas() {
    const canvas = canvasRef.value
    if (!canvas) return

    const parent = canvas.parentElement
    if (!parent) return

    // Use offsetWidth/offsetHeight instead of getBoundingClientRect().
    // Slidev applies CSS transform: scale() to fit slides into the viewport,
    // which inflates getBoundingClientRect() values. offsetWidth/offsetHeight
    // give the layout dimensions BEFORE transforms — the correct canvas size.
    const w = parent.offsetWidth
    const h = parent.offsetHeight
    if (w === 0 || h === 0) return

    const dpr = window.devicePixelRatio || 1

    // Set the logical (CSS) size — let CSS handle the rest via 100%/100%
    width.value = w
    height.value = h

    // Set the physical (pixel) size for crisp HiDPI rendering
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)

    // Scale the context so drawing code uses logical pixels
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    scheduleRender()
  }

  function scheduleRender() {
    if (rafId !== null) return
    rafId = requestAnimationFrame(() => {
      rafId = null
      render()
    })
  }

  function render() {
    const canvas = canvasRef.value
    if (!canvas || width.value === 0 || height.value === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear the entire canvas
    const dpr = window.devicePixelRatio || 1
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.restore()

    // Call the pure render function with logical dimensions
    renderFn(ctx, width.value, height.value)
  }

  onMounted(() => {
    const canvas = canvasRef.value
    if (!canvas) return

    // Initial sizing
    configureCanvas()

    // Watch for container resizes
    const parent = canvas.parentElement
    if (parent) {
      resizeObserver = new ResizeObserver(() => {
        configureCanvas()
      })
      resizeObserver.observe(parent)
    }
  })

  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  })

  // Re-render whenever any reactive dependency changes
  watch(deps, () => {
    scheduleRender()
  }, { deep: true })

  return { width, height }
}
