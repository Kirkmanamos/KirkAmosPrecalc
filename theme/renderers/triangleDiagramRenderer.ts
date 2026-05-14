/**
 * Triangle Diagram Renderer
 *
 * Draws a unit circle with a right triangle inscribed at a fixed angle.
 * Two modes:
 *   'pythagorean' — labels sides as x, y, r=1 and shows x² + y² = 1
 *   'trigRatios'  — labels sides as adj, opp, hyp and shows how
 *                   sin/cos reduce to the coordinates when r = 1
 */

const C = {
  bg:         '#0d1117',
  grid:       'rgba(139, 148, 158, 0.06)',
  axis:       'rgba(139, 148, 158, 0.25)',
  axisLabel:  'rgba(139, 148, 158, 0.55)',
  circle:     'rgba(139, 148, 158, 0.2)',
  arm:        '#e6edf3',
  sin:        '#79c0ff',
  cos:        '#d29922',
  hyp:        '#e6edf3',
  point:      '#f0f6fc',
  arc:        'rgba(139, 148, 158, 0.45)',
  rightAngle: 'rgba(139, 148, 158, 0.35)',
  text:       '#e6edf3',
  textMuted:  '#8b949e',
  formula:    '#58a6ff',
  labelBg:    'rgba(13, 17, 23, 0.85)',
}

const FONT = "'Inter', -apple-system, sans-serif"
const FONT_MONO = "'JetBrains Mono', monospace"

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180
}

export type DiagramMode = 'pythagorean' | 'trigRatios'

export function renderTriangleDiagram(
  ctx: CanvasRenderingContext2D,
  totalWidth: number,
  totalHeight: number,
  mode: DiagramMode,
  angleDeg: number = 50
) {
  const rad = degToRad(angleDeg)
  const cosVal = Math.cos(rad)
  const sinVal = Math.sin(rad)

  // Fill background
  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, totalWidth, totalHeight)

  // Center the diagram in the canvas with padding
  const pad = 40
  const availW = totalWidth - pad * 2
  const availH = totalHeight - pad * 2
  const r = Math.min(availW, availH) * 0.38
  const cx = pad + availW * 0.45  // slightly left of center to leave room for labels
  const cy = pad + availH * 0.50

  ctx.save()

  // ── Grid ──
  ctx.strokeStyle = C.grid
  ctx.lineWidth = 1
  const gridStep = r / 2
  for (let i = -4; i <= 4; i++) {
    const gx = cx + i * gridStep
    const gy = cy + i * gridStep
    if (gx > pad && gx < totalWidth - pad) {
      ctx.beginPath()
      ctx.moveTo(gx, pad + 10)
      ctx.lineTo(gx, totalHeight - pad - 10)
      ctx.stroke()
    }
    if (gy > pad + 10 && gy < totalHeight - pad - 10) {
      ctx.beginPath()
      ctx.moveTo(pad + 10, gy)
      ctx.lineTo(totalWidth - pad - 10, gy)
      ctx.stroke()
    }
  }

  // ── Axes ──
  ctx.strokeStyle = C.axis
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(pad + 10, cy)
  ctx.lineTo(totalWidth - pad - 10, cy)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx, pad + 10)
  ctx.lineTo(cx, totalHeight - pad - 10)
  ctx.stroke()

  // ── Unit circle ──
  ctx.strokeStyle = C.circle
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.stroke()

  // ── Triangle vertices ──
  const px = cx + cosVal * r   // point on circle
  const py = cy - sinVal * r
  const fx = px                // foot of perpendicular (on x-axis)
  const fy = cy

  // ── Right angle mark ──
  const raSize = 12
  ctx.strokeStyle = C.rightAngle
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(fx - raSize, fy)
  ctx.lineTo(fx - raSize, fy - raSize)
  ctx.lineTo(fx, fy - raSize)
  ctx.stroke()

  // ── Draw the triangle sides with distinct colors ──

  // Horizontal leg (x / adjacent) — gold
  ctx.strokeStyle = C.cos
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(fx, fy)
  ctx.stroke()

  // Vertical leg (y / opposite) — blue
  ctx.strokeStyle = C.sin
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(fx, fy)
  ctx.lineTo(px, py)
  ctx.stroke()

  // Hypotenuse (r = 1) — white
  ctx.strokeStyle = C.hyp
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(px, py)
  ctx.stroke()

  // ── Angle arc ──
  const arcR = r * 0.2
  ctx.strokeStyle = C.arc
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(cx, cy, arcR, 0, -rad, true)
  ctx.stroke()

  // θ label
  ctx.font = `italic 500 14px ${FONT}`
  ctx.fillStyle = C.text
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const thetaLabelR = arcR + 16
  ctx.fillText('θ', cx + Math.cos(-rad / 2) * thetaLabelR, cy + Math.sin(-rad / 2) * thetaLabelR)

  // ── Point on circle ──
  ctx.fillStyle = C.point
  ctx.beginPath()
  ctx.arc(px, py, 5, 0, Math.PI * 2)
  ctx.fill()

  // ── Labels based on mode ──
  if (mode === 'pythagorean') {
    drawPythagoreanLabels(ctx, cx, cy, px, py, fx, fy, r, cosVal, sinVal)
  } else {
    drawTrigRatioLabels(ctx, cx, cy, px, py, fx, fy, r, cosVal, sinVal)
  }

  ctx.restore()
}

// ── Pythagorean mode: x, y, r=1, x²+y²=1 ──
function drawPythagoreanLabels(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  px: number, py: number,
  fx: number, fy: number,
  r: number,
  cosVal: number, sinVal: number
) {
  // Horizontal leg label: "x"
  ctx.font = `600 16px ${FONT}`
  ctx.fillStyle = C.cos
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('x', (cx + fx) / 2, cy + 10)

  // Vertical leg label: "y"
  ctx.fillStyle = C.sin
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('y', fx + 10, (fy + py) / 2)

  // Hypotenuse label: "r = 1"
  ctx.fillStyle = C.hyp
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  const hypMidX = (cx + px) / 2 - 14
  const hypMidY = (cy + py) / 2 - 6
  ctx.fillText('r = 1', hypMidX, hypMidY)

  // Point coordinate label
  ctx.font = `400 12px ${FONT_MONO}`
  ctx.fillStyle = C.textMuted
  ctx.textAlign = 'left'
  ctx.textBaseline = 'bottom'
  ctx.fillText(`(x, y)`, px + 12, py - 6)

  // ── Equation: x² + y² = r² = 1 ──
  const eqY = cy + r + 50
  ctx.font = `500 18px ${FONT_MONO}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  // Draw with color-coding
  const eq1 = 'x²'
  const eq2 = ' + '
  const eq3 = 'y²'
  const eq4 = ' = r² = '
  const eq5 = '1'

  const m1 = ctx.measureText(eq1).width
  const m2 = ctx.measureText(eq2).width
  const m3 = ctx.measureText(eq3).width
  const m4 = ctx.measureText(eq4).width
  const m5 = ctx.measureText(eq5).width
  const totalEq = m1 + m2 + m3 + m4 + m5
  let eqX = cx - totalEq / 2

  ctx.textAlign = 'left'
  ctx.fillStyle = C.cos
  ctx.fillText(eq1, eqX, eqY)
  eqX += m1

  ctx.fillStyle = C.text
  ctx.fillText(eq2, eqX, eqY)
  eqX += m2

  ctx.fillStyle = C.sin
  ctx.fillText(eq3, eqX, eqY)
  eqX += m3

  ctx.fillStyle = C.textMuted
  ctx.fillText(eq4, eqX, eqY)
  eqX += m4

  ctx.fillStyle = C.formula
  ctx.fillText(eq5, eqX, eqY)
}

// ── Trig ratio mode: adj, opp, hyp → sin = y, cos = x ──
function drawTrigRatioLabels(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  px: number, py: number,
  fx: number, fy: number,
  r: number,
  cosVal: number, sinVal: number
) {
  // Horizontal leg label
  ctx.font = `600 13px ${FONT}`
  ctx.fillStyle = C.cos
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('adjacent', (cx + fx) / 2, cy + 10)

  // Vertical leg label
  ctx.fillStyle = C.sin
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('opposite', fx + 10, (fy + py) / 2)

  // Hypotenuse label
  ctx.fillStyle = C.hyp
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  const hypMidX = (cx + px) / 2 - 20
  const hypMidY = (cy + py) / 2 - 6
  ctx.fillText('hyp = 1', hypMidX, hypMidY)

  // ── Trig ratio equations ──
  const eqStartY = cy + r + 30
  const lineH = 28
  ctx.font = `500 15px ${FONT_MONO}`
  ctx.textAlign = 'left'

  // Line 1: cos θ = adj / hyp = x / 1 = x
  const line1X = cx - r * 0.8
  let xPos = line1X

  ctx.fillStyle = C.cos
  ctx.fillText('cos θ', xPos, eqStartY)
  xPos += ctx.measureText('cos θ').width

  ctx.fillStyle = C.textMuted
  ctx.fillText(' = ', xPos, eqStartY)
  xPos += ctx.measureText(' = ').width

  ctx.fillStyle = C.text
  ctx.fillText('adj / hyp', xPos, eqStartY)
  xPos += ctx.measureText('adj / hyp').width

  ctx.fillStyle = C.textMuted
  ctx.fillText(' = ', xPos, eqStartY)
  xPos += ctx.measureText(' = ').width

  ctx.fillStyle = C.cos
  ctx.fillText('x / 1', xPos, eqStartY)
  xPos += ctx.measureText('x / 1').width

  ctx.fillStyle = C.textMuted
  ctx.fillText(' = ', xPos, eqStartY)
  xPos += ctx.measureText(' = ').width

  ctx.fillStyle = C.cos
  ctx.font = `700 16px ${FONT_MONO}`
  ctx.fillText('x', xPos, eqStartY)

  // Line 2: sin θ = opp / hyp = y / 1 = y
  ctx.font = `500 15px ${FONT_MONO}`
  xPos = line1X

  ctx.fillStyle = C.sin
  ctx.fillText('sin θ', xPos, eqStartY + lineH)
  xPos += ctx.measureText('sin θ').width

  ctx.fillStyle = C.textMuted
  ctx.fillText(' = ', xPos, eqStartY + lineH)
  xPos += ctx.measureText(' = ').width

  ctx.fillStyle = C.text
  ctx.fillText('opp / hyp', xPos, eqStartY + lineH)
  xPos += ctx.measureText('opp / hyp').width

  ctx.fillStyle = C.textMuted
  ctx.fillText(' = ', xPos, eqStartY + lineH)
  xPos += ctx.measureText(' = ').width

  ctx.fillStyle = C.sin
  ctx.fillText('y / 1', xPos, eqStartY + lineH)
  xPos += ctx.measureText('y / 1').width

  ctx.fillStyle = C.textMuted
  ctx.fillText(' = ', xPos, eqStartY + lineH)
  xPos += ctx.measureText(' = ').width

  ctx.fillStyle = C.sin
  ctx.font = `700 16px ${FONT_MONO}`
  ctx.fillText('y', xPos, eqStartY + lineH)

  // Emphasis line: "Since r = 1, the coordinates ARE the trig values"
  ctx.font = `italic 400 12px ${FONT}`
  ctx.fillStyle = C.formula
  ctx.textAlign = 'center'
  ctx.fillText('Since r = 1, the trig ratios simplify to the coordinates themselves.',
    cx, eqStartY + lineH * 2 + 6)
}
