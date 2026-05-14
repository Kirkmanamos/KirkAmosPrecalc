/**
 * Unit Circle + Sine Wave Renderer
 *
 * Pure drawing function — no Vue dependency.
 * Takes a canvas context, dimensions, and state,
 * then draws the split-view visualization.
 *
 * Left panel:  Unit circle with terminal arm, sin/cos segments
 * Right panel: Sine wave traced from 0° to current angle
 */

// ── Color Palette ──────────────────────────────────────────
const C = {
  bg:         '#0d1117',
  grid:       'rgba(139, 148, 158, 0.06)',
  axis:       'rgba(139, 148, 158, 0.25)',
  axisLabel:  'rgba(139, 148, 158, 0.55)',
  circle:     'rgba(139, 148, 158, 0.2)',
  arm:        '#c9d1d9',
  sin:        '#79c0ff',
  cos:        '#d29922',
  tan:        '#56d364',
  point:      '#f0f6fc',
  arc:        'rgba(139, 148, 158, 0.45)',
  trace:      '#79c0ff',
  dashed:     'rgba(121, 192, 255, 0.25)',
  divider:    'rgba(139, 148, 158, 0.1)',
  labelBg:    'rgba(13, 17, 23, 0.8)',
}

const FONT = "'Inter', -apple-system, sans-serif"
const FONT_MONO = "'JetBrains Mono', monospace"

// ── Helpers ────────────────────────────────────────────────
function degToRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/** Format a degree value as a clean radian string for display */
function formatRadians(deg: number): string {
  const special: Record<number, string> = {
    0: '0', 30: 'π/6', 45: 'π/4', 60: 'π/3', 90: 'π/2',
    120: '2π/3', 135: '3π/4', 150: '5π/6', 180: 'π',
    210: '7π/6', 225: '5π/4', 240: '4π/3', 270: '3π/2',
    300: '5π/3', 315: '7π/4', 330: '11π/6', 360: '2π',
  }
  if (special[deg] !== undefined) return special[deg]
  return (degToRad(deg)).toFixed(2)
}

export interface RenderState {
  angle: number       // degrees
  showSine: boolean
  showCosine: boolean
  showTangent: boolean
  traceHistory: boolean
}

// ── Layout Constants ───────────────────────────────────────
// Global margin keeps all drawing safely inside the canvas
const MARGIN = { top: 20, right: 20, bottom: 20, left: 20 }
const PANEL_GAP = 20
const CIRCLE_RADIUS_FACTOR = 0.28  // fraction of min(panel width, panel height)

// Wave panel padding (space for axis labels and tick marks)
const WAVE_PAD = { top: 36, bottom: 48, left: 40, right: 24 }

// ── Main Render Function ───────────────────────────────────
export function renderUnitCircle(
  ctx: CanvasRenderingContext2D,
  totalWidth: number,
  totalHeight: number,
  state: RenderState
) {
  const { angle, showSine, showCosine, traceHistory } = state
  const rad = degToRad(angle)

  // Fill background
  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, totalWidth, totalHeight)

  // Compute the drawable area inside the global margin
  const drawX = MARGIN.left
  const drawY = MARGIN.top
  const drawW = totalWidth - MARGIN.left - MARGIN.right
  const drawH = totalHeight - MARGIN.top - MARGIN.bottom

  // Split: left panel = circle (35%), right panel = wave (65%)
  const leftW = (drawW - PANEL_GAP) * 0.35
  const rightW = (drawW - PANEL_GAP) * 0.65
  const leftX = drawX
  const rightX = drawX + leftW + PANEL_GAP

  drawUnitCirclePanel(ctx, leftX, drawY, leftW, drawH, rad, showSine, showCosine)
  drawSineWavePanel(ctx, rightX, drawY, rightW, drawH, rad, angle, showSine, showCosine, traceHistory)

  // Connecting dashed line between panels
  if (showSine) {
    const circleR = Math.min(leftW, drawH) * CIRCLE_RADIUS_FACTOR
    const circleCY = drawY + drawH / 2
    const sinY = circleCY - Math.sin(rad) * circleR

    // Map the sin value to the wave panel's y coordinate
    const waveH = drawH - WAVE_PAD.top - WAVE_PAD.bottom
    const waveCY = drawY + WAVE_PAD.top + waveH / 2
    const waveScale = waveH / 2 * 0.85
    const waveY = waveCY - Math.sin(rad) * waveScale

    ctx.save()
    ctx.strokeStyle = C.dashed
    ctx.lineWidth = 1
    ctx.setLineDash([4, 6])
    ctx.beginPath()
    ctx.moveTo(leftX + leftW / 2 + Math.cos(rad) * circleR + 6, sinY)
    ctx.lineTo(rightX + computeWaveX(angle, rightW), waveY)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()
  }
}

// ── Left Panel: Unit Circle ────────────────────────────────
function drawUnitCirclePanel(
  ctx: CanvasRenderingContext2D,
  ox: number, oy: number, w: number, h: number,
  rad: number,
  showSine: boolean,
  showCosine: boolean
) {
  const cx = ox + w / 2
  const cy = oy + h / 2
  const r = Math.min(w, h) * CIRCLE_RADIUS_FACTOR

  ctx.save()

  // Panel label
  ctx.font = `500 11px ${FONT}`
  ctx.fillStyle = C.axisLabel
  ctx.textAlign = 'center'
  ctx.fillText('UNIT CIRCLE', cx, oy + 24)

  // Inner bounds for drawing (keep clear of the panel edges)
  const innerTop = oy + 36
  const innerBot = oy + h - 16
  const innerLeft = ox + 12
  const innerRight = ox + w - 12

  // Grid lines
  ctx.strokeStyle = C.grid
  ctx.lineWidth = 1
  const gridStep = r / 2
  for (let i = -4; i <= 4; i++) {
    const gx = cx + i * gridStep
    const gy = cy + i * gridStep
    if (gx >= innerLeft && gx <= innerRight) {
      ctx.beginPath()
      ctx.moveTo(gx, innerTop)
      ctx.lineTo(gx, innerBot)
      ctx.stroke()
    }
    if (gy >= innerTop && gy <= innerBot) {
      ctx.beginPath()
      ctx.moveTo(innerLeft, gy)
      ctx.lineTo(innerRight, gy)
      ctx.stroke()
    }
  }

  // Axes
  ctx.strokeStyle = C.axis
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(innerLeft, cy)
  ctx.lineTo(innerRight, cy)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx, innerTop)
  ctx.lineTo(cx, innerBot)
  ctx.stroke()

  // Axis tick labels
  ctx.font = `400 10px ${FONT_MONO}`
  ctx.fillStyle = C.axisLabel
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('1', cx + r, cy + 6)
  ctx.fillText('−1', cx - r, cy + 6)
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.fillText('1', cx - 8, cy - r)
  ctx.fillText('−1', cx - 8, cy + r)

  // Unit circle
  ctx.strokeStyle = C.circle
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.stroke()

  // cos(θ) segment (horizontal)
  if (showCosine) {
    const cosX = cx + Math.cos(rad) * r
    ctx.strokeStyle = C.cos
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cosX, cy)
    ctx.stroke()

    // cos label
    ctx.font = `500 11px ${FONT_MONO}`
    ctx.fillStyle = C.cos
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(`cos θ = ${Math.cos(rad).toFixed(3)}`, (cx + cosX) / 2, cy + 10)
  }

  // sin(θ) segment (vertical)
  if (showSine) {
    const px = cx + Math.cos(rad) * r
    const py = cy - Math.sin(rad) * r
    ctx.strokeStyle = C.sin
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(px, cy)
    ctx.lineTo(px, py)
    ctx.stroke()

    // sin label
    ctx.font = `500 11px ${FONT_MONO}`
    ctx.fillStyle = C.sin
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    const labelX = px + 8
    const labelY = (cy + py) / 2
    ctx.fillText(`sin θ = ${Math.sin(rad).toFixed(3)}`, labelX, labelY)
  }

  // Terminal arm
  const px = cx + Math.cos(rad) * r
  const py = cy - Math.sin(rad) * r
  ctx.strokeStyle = C.arm
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(px, py)
  ctx.stroke()

  // Angle arc
  const arcR = r * 0.18
  ctx.strokeStyle = C.arc
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(cx, cy, arcR, 0, -rad, rad > 0)
  // Canvas arcs go clockwise, but our angle is measured counterclockwise
  // so we draw from 0 to -rad (which is counterclockwise in screen coords)
  ctx.stroke()

  // Angle label
  const labelRad = rad / 2
  const labelDist = arcR + 14
  ctx.font = `500 11px ${FONT}`
  ctx.fillStyle = C.axisLabel
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('θ', cx + Math.cos(-labelRad) * labelDist, cy + Math.sin(-labelRad) * labelDist)

  // Point on circle
  ctx.fillStyle = C.point
  ctx.beginPath()
  ctx.arc(px, py, 5, 0, Math.PI * 2)
  ctx.fill()

  // Point shadow/glow
  ctx.fillStyle = 'rgba(121, 192, 255, 0.15)'
  ctx.beginPath()
  ctx.arc(px, py, 10, 0, Math.PI * 2)
  ctx.fill()

  // Coordinate readout near point — clamped to stay within panel bounds
  ctx.font = `400 10px ${FONT_MONO}`
  const coordText = `(${Math.cos(rad).toFixed(2)}, ${Math.sin(rad).toFixed(2)})`
  const tm = ctx.measureText(coordText)
  const pillW = tm.width + 8
  const pillH = 16

  // Default: label to the upper-right of the point
  let coordX = px + 12
  let coordY = py - 8

  // Clamp horizontally: keep the pill inside the panel
  if (coordX + pillW > ox + w - 8) {
    coordX = px - pillW - 8  // flip to left side
  }
  if (coordX < ox + 8) {
    coordX = ox + 8
  }

  // Clamp vertically: keep the pill inside the panel
  if (coordY - pillH < oy + 28) {
    coordY = py + 20  // flip below the point
  }
  if (coordY > oy + h - 8) {
    coordY = oy + h - 8
  }

  // Background pill for readability
  ctx.fillStyle = C.labelBg
  ctx.textAlign = 'left'
  ctx.textBaseline = 'bottom'
  ctx.beginPath()
  ctx.roundRect(coordX - 4, coordY - pillH + 2, pillW, pillH, 4)
  ctx.fill()
  ctx.fillStyle = C.axisLabel
  ctx.fillText(coordText, coordX, coordY)

  ctx.restore()
}

// ── Right Panel: Sine Wave ─────────────────────────────────
function computeWaveX(angleDeg: number, panelW: number): number {
  const usable = panelW - WAVE_PAD.left - WAVE_PAD.right
  return WAVE_PAD.left + (angleDeg / 360) * usable
}

function drawSineWavePanel(
  ctx: CanvasRenderingContext2D,
  ox: number, oy: number, w: number, h: number,
  rad: number,
  angleDeg: number,
  showSine: boolean,
  showCosine: boolean,
  traceHistory: boolean
) {
  const graphH = h - WAVE_PAD.top - WAVE_PAD.bottom
  const graphW = w - WAVE_PAD.left - WAVE_PAD.right
  const graphLeft = ox + WAVE_PAD.left
  const graphRight = ox + w - WAVE_PAD.right
  const graphTop = oy + WAVE_PAD.top
  const graphBot = oy + h - WAVE_PAD.bottom
  const centerY = graphTop + graphH / 2
  const scale = graphH / 2 * 0.85

  ctx.save()

  // Panel label
  ctx.font = `500 11px ${FONT}`
  ctx.fillStyle = C.axisLabel
  ctx.textAlign = 'center'
  let waveLabel = 'SINE WAVE'
  if (showSine && showCosine) waveLabel = 'SINE & COSINE WAVES'
  else if (showCosine && !showSine) waveLabel = 'COSINE WAVE'
  ctx.fillText(waveLabel, ox + w / 2, oy + 24)

  // Horizontal grid lines
  ctx.strokeStyle = C.grid
  ctx.lineWidth = 1
  for (const v of [-1, -0.5, 0, 0.5, 1]) {
    const gy = centerY - v * scale
    ctx.beginPath()
    ctx.moveTo(graphLeft, gy)
    ctx.lineTo(graphRight, gy)
    ctx.stroke()
  }

  // Vertical grid lines at key angles
  ctx.strokeStyle = C.grid
  for (const deg of [0, 90, 180, 270, 360]) {
    const gx = graphLeft + (deg / 360) * graphW
    ctx.beginPath()
    ctx.moveTo(gx, graphTop)
    ctx.lineTo(gx, graphBot)
    ctx.stroke()
  }

  // Axes
  ctx.strokeStyle = C.axis
  ctx.lineWidth = 1
  // x-axis
  ctx.beginPath()
  ctx.moveTo(graphLeft - 4, centerY)
  ctx.lineTo(graphRight + 4, centerY)
  ctx.stroke()
  // y-axis
  ctx.beginPath()
  ctx.moveTo(graphLeft, graphTop - 4)
  ctx.lineTo(graphLeft, graphBot + 4)
  ctx.stroke()

  // Y-axis labels
  ctx.font = `400 10px ${FONT_MONO}`
  ctx.fillStyle = C.axisLabel
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.fillText('1', graphLeft - 8, centerY - scale)
  ctx.fillText('0', graphLeft - 8, centerY)
  ctx.fillText('−1', graphLeft - 8, centerY + scale)

  // X-axis labels
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  const xLabels: [number, string][] = [
    [0, '0°'], [90, '90°'], [180, '180°'], [270, '270°'], [360, '360°']
  ]
  for (const [deg, label] of xLabels) {
    const lx = graphLeft + (deg / 360) * graphW
    ctx.fillText(label, lx, graphBot + 6)
  }

  // Radian labels (second row)
  ctx.font = `400 9px ${FONT_MONO}`
  ctx.fillStyle = C.axisLabel
  const radLabels: [number, string][] = [
    [0, '0'], [90, 'π/2'], [180, 'π'], [270, '3π/2'], [360, '2π']
  ]
  for (const [deg, label] of radLabels) {
    const lx = graphLeft + (deg / 360) * graphW
    ctx.fillText(label, lx, graphBot + 20)
  }

  // Full sine wave (ghosted) — shows where the wave will go
  if (showSine) {
    ctx.strokeStyle = 'rgba(121, 192, 255, 0.08)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    for (let d = 0; d <= 360; d += 1) {
      const x = graphLeft + (d / 360) * graphW
      const y = centerY - Math.sin(degToRad(d)) * scale
      if (d === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  // Traced sine wave up to current angle
  if (showSine && traceHistory) {
    ctx.strokeStyle = C.trace
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    const steps = Math.max(1, Math.round(angleDeg))
    for (let d = 0; d <= steps; d += 1) {
      const x = graphLeft + (d / 360) * graphW
      const y = centerY - Math.sin(degToRad(d)) * scale
      if (d === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.lineCap = 'butt'
    ctx.lineJoin = 'miter'
  }

  // Full cosine wave (ghosted)
  if (showCosine) {
    ctx.strokeStyle = 'rgba(210, 153, 34, 0.08)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    for (let d = 0; d <= 360; d += 1) {
      const x = graphLeft + (d / 360) * graphW
      const y = centerY - Math.cos(degToRad(d)) * scale
      if (d === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  // Traced cosine wave
  if (showCosine && traceHistory) {
    ctx.strokeStyle = C.cos
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    const steps = Math.max(1, Math.round(angleDeg))
    for (let d = 0; d <= steps; d += 1) {
      const x = graphLeft + (d / 360) * graphW
      const y = centerY - Math.cos(degToRad(d)) * scale
      if (d === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.lineCap = 'butt'
    ctx.lineJoin = 'miter'
  }

  // Current point on sine wave
  if (showSine) {
    const currX = graphLeft + (angleDeg / 360) * graphW
    const currY = centerY - Math.sin(rad) * scale

    // Glow
    ctx.fillStyle = 'rgba(121, 192, 255, 0.15)'
    ctx.beginPath()
    ctx.arc(currX, currY, 10, 0, Math.PI * 2)
    ctx.fill()

    // Point
    ctx.fillStyle = C.point
    ctx.beginPath()
    ctx.arc(currX, currY, 4, 0, Math.PI * 2)
    ctx.fill()
  }

  // Current point on cosine wave
  if (showCosine) {
    const currX = graphLeft + (angleDeg / 360) * graphW
    const currY = centerY - Math.cos(rad) * scale

    ctx.fillStyle = 'rgba(210, 153, 34, 0.15)'
    ctx.beginPath()
    ctx.arc(currX, currY, 10, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = C.point
    ctx.beginPath()
    ctx.arc(currX, currY, 4, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

export { formatRadians }
