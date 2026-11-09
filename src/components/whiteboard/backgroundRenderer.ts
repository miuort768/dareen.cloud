import type { BackgroundPattern } from '../types/whiteboard'

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pattern: BackgroundPattern,
) {
  ctx.save()

  // Base background fill
  if (pattern === 'black') {
    ctx.fillStyle = '#0f172a' // slate-900
    ctx.fillRect(0, 0, width, height)
  } else {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
  }

  if (pattern === 'white') {
    ctx.restore()
    return
  }

  if (pattern === 'black') {
    // Subtle grid on black
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)'
    ctx.lineWidth = 1
    const step = 30
    ctx.beginPath()
    for (let x = step; x < width; x += step) {
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
    }
    for (let y = step; y < height; y += step) {
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
    }
    ctx.stroke()
    ctx.restore()
    return
  }

  if (pattern === 'grid') {
    // Math coordinate grid
    const step = 30
    const majorStep = 150

    ctx.strokeStyle = 'rgba(79, 70, 229, 0.08)' // soft indigo
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let x = step; x < width; x += step) {
      if (x % majorStep === 0) continue
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
    }
    for (let y = step; y < height; y += step) {
      if (y % majorStep === 0) continue
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
    }
    ctx.stroke()

    // Major axis lines
    ctx.strokeStyle = 'rgba(79, 70, 229, 0.18)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    for (let x = majorStep; x < width; x += majorStep) {
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
    }
    for (let y = majorStep; y < height; y += majorStep) {
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
    }
    ctx.stroke()
  } else if (pattern === 'ruled') {
    // Notebook ruled lines
    const lineSpacing = 36
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.16)' // ruled blue
    ctx.lineWidth = 1.2
    ctx.beginPath()
    for (let y = lineSpacing * 2; y < height; y += lineSpacing) {
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
    }
    ctx.stroke()

    // Margin line (RTL oriented: right side margin)
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.22)' // soft red margin
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(width - 60, 0)
    ctx.lineTo(width - 60, height)
    ctx.stroke()
  } else if (pattern === 'dots') {
    // Dot grid
    const step = 28
    ctx.fillStyle = 'rgba(100, 116, 139, 0.25)'
    for (let x = step; x < width; x += step) {
      for (let y = step; y < height; y += step) {
        ctx.beginPath()
        ctx.arc(x, y, 1.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  ctx.restore()
}
