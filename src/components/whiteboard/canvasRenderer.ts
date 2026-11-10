import type {
  WhiteboardElement,
  PathElement,
  LineElement,
  ShapeElement,
  TextElement,
  Point,
} from '../../types/whiteboard'

export function drawArrowhead(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  size = 12,
) {
  const angle = Math.atan2(toY - fromY, toX - fromX)
  ctx.beginPath()
  ctx.moveTo(toX, toY)
  ctx.lineTo(toX - size * Math.cos(angle - Math.PI / 6), toY - size * Math.sin(angle - Math.PI / 6))
  ctx.lineTo(toX - size * Math.cos(angle + Math.PI / 6), toY - size * Math.sin(angle + Math.PI / 6))
  ctx.closePath()
  ctx.fillStyle = ctx.strokeStyle
  ctx.fill()
}

export function drawElement(
  ctx: CanvasRenderingContext2D,
  element: WhiteboardElement,
  isSelected = false,
) {
  ctx.save()

  // Base opacity
  if (element.opacity !== undefined) {
    ctx.globalAlpha = element.opacity
  }

  ctx.strokeStyle = element.strokeColor
  ctx.lineWidth = element.strokeWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  if (element.fillColor) {
    ctx.fillStyle = element.fillColor
  }

  switch (element.type) {
    case 'path': {
      const p = element as PathElement
      if (p.points.length < 2) break

      if (p.isHighlighter) {
        ctx.globalAlpha = 0.35
        ctx.lineCap = 'square'
      }

      ctx.beginPath()
      ctx.moveTo(p.points[0].x, p.points[0].y)
      for (let i = 1; i < p.points.length; i++) {
        const xc = (p.points[i - 1].x + p.points[i].x) / 2
        const yc = (p.points[i - 1].y + p.points[i].y) / 2
        ctx.quadraticCurveTo(p.points[i - 1].x, p.points[i - 1].y, xc, yc)
      }
      const last = p.points[p.points.length - 1]
      ctx.lineTo(last.x, last.y)
      ctx.stroke()
      break
    }

    case 'line': {
      const l = element as LineElement
      ctx.beginPath()
      ctx.moveTo(l.x, l.y)
      ctx.lineTo(l.endX, l.endY)
      ctx.stroke()
      break
    }

    case 'arrow': {
      const a = element as LineElement
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(a.endX, a.endY)
      ctx.stroke()
      drawArrowhead(ctx, a.x, a.y, a.endX, a.endY, Math.max(10, a.strokeWidth * 3))
      break
    }

    case 'doubleArrow': {
      const da = element as LineElement
      ctx.beginPath()
      ctx.moveTo(da.x, da.y)
      ctx.lineTo(da.endX, da.endY)
      ctx.stroke()
      drawArrowhead(ctx, da.x, da.y, da.endX, da.endY, Math.max(10, da.strokeWidth * 3))
      drawArrowhead(ctx, da.endX, da.endY, da.x, da.y, Math.max(10, da.strokeWidth * 3))
      break
    }

    case 'rect': {
      const s = element as ShapeElement
      ctx.beginPath()
      ctx.rect(s.x, s.y, s.width, s.height)
      if (s.fillColor && s.fillColor !== 'transparent') {
        ctx.fill()
      }
      ctx.stroke()
      break
    }

    case 'ellipse': {
      const s = element as ShapeElement
      const cx = s.x + s.width / 2
      const cy = s.y + s.height / 2
      const rx = Math.abs(s.width / 2)
      const ry = Math.abs(s.height / 2)
      ctx.beginPath()
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
      if (s.fillColor && s.fillColor !== 'transparent') {
        ctx.fill()
      }
      ctx.stroke()
      break
    }

    case 'triangle': {
      const s = element as ShapeElement
      ctx.beginPath()
      ctx.moveTo(s.x + s.width / 2, s.y)
      ctx.lineTo(s.x + s.width, s.y + s.height)
      ctx.lineTo(s.x, s.y + s.height)
      ctx.closePath()
      if (s.fillColor && s.fillColor !== 'transparent') {
        ctx.fill()
      }
      ctx.stroke()
      break
    }

    case 'star': {
      const s = element as ShapeElement
      const cx = s.x + s.width / 2
      const cy = s.y + s.height / 2
      const spikes = 5
      const outerRadius = Math.min(Math.abs(s.width), Math.abs(s.height)) / 2
      const innerRadius = outerRadius / 2
      let rot = (Math.PI / 2) * 3
      const step = Math.PI / spikes

      ctx.beginPath()
      ctx.moveTo(cx, cy - outerRadius)
      for (let i = 0; i < spikes; i++) {
        let x = cx + Math.cos(rot) * outerRadius
        let y = cy + Math.sin(rot) * outerRadius
        ctx.lineTo(x, y)
        rot += step

        x = cx + Math.cos(rot) * innerRadius
        y = cy + Math.sin(rot) * innerRadius
        ctx.lineTo(x, y)
        rot += step
      }
      ctx.lineTo(cx, cy - outerRadius)
      ctx.closePath()
      if (s.fillColor && s.fillColor !== 'transparent') {
        ctx.fill()
      }
      ctx.stroke()
      break
    }

    case 'diamond': {
      const s = element as ShapeElement
      ctx.beginPath()
      ctx.moveTo(s.x + s.width / 2, s.y)
      ctx.lineTo(s.x + s.width, s.y + s.height / 2)
      ctx.lineTo(s.x + s.width / 2, s.y + s.height)
      ctx.lineTo(s.x, s.y + s.height / 2)
      ctx.closePath()
      if (s.fillColor && s.fillColor !== 'transparent') {
        ctx.fill()
      }
      ctx.stroke()
      break
    }

    case 'rightTriangle': {
      const s = element as ShapeElement
      ctx.beginPath()
      ctx.moveTo(s.x, s.y)
      ctx.lineTo(s.x, s.y + s.height)
      ctx.lineTo(s.x + s.width, s.y + s.height)
      ctx.closePath()
      if (s.fillColor && s.fillColor !== 'transparent') {
        ctx.fill()
      }
      ctx.stroke()

      // رسم زاوية قائمة 90 درجة صغيرة
      const markSize = Math.min(16, Math.abs(s.width) * 0.2, Math.abs(s.height) * 0.2)
      if (markSize > 4) {
        ctx.beginPath()
        ctx.moveTo(s.x, s.y + s.height - markSize)
        ctx.lineTo(s.x + markSize, s.y + s.height - markSize)
        ctx.lineTo(s.x + markSize, s.y + s.height)
        ctx.stroke()
      }
      break
    }

    case 'hexagon': {
      const s = element as ShapeElement
      const cx = s.x + s.width / 2
      const cy = s.y + s.height / 2
      const rx = s.width / 2
      const ry = s.height / 2
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6
        const x = cx + rx * Math.cos(angle)
        const y = cy + ry * Math.sin(angle)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      if (s.fillColor && s.fillColor !== 'transparent') {
        ctx.fill()
      }
      ctx.stroke()
      break
    }

    case 'cube': {
      const s = element as ShapeElement
      const w = s.width * 0.75
      const h = s.height * 0.75
      const d = Math.min(s.width * 0.25, s.height * 0.25)

      // Front Face
      ctx.beginPath()
      ctx.rect(s.x, s.y + d, w, h)
      if (s.fillColor && s.fillColor !== 'transparent') {
        ctx.fill()
      }
      ctx.stroke()

      // Top Face
      ctx.beginPath()
      ctx.moveTo(s.x, s.y + d)
      ctx.lineTo(s.x + d, s.y)
      ctx.lineTo(s.x + d + w, s.y)
      ctx.lineTo(s.x + w, s.y + d)
      ctx.closePath()
      if (s.fillColor && s.fillColor !== 'transparent') {
        ctx.fill()
      }
      ctx.stroke()

      // Right Face
      ctx.beginPath()
      ctx.moveTo(s.x + w, s.y + d)
      ctx.lineTo(s.x + d + w, s.y)
      ctx.lineTo(s.x + d + w, s.y + h)
      ctx.lineTo(s.x + w, s.y + d + h)
      ctx.closePath()
      if (s.fillColor && s.fillColor !== 'transparent') {
        ctx.fill()
      }
      ctx.stroke()
      break
    }

    case 'cylinder': {
      const s = element as ShapeElement
      const ry = Math.min(18, s.height * 0.15)
      const cx = s.x + s.width / 2
      const rx = s.width / 2

      // Top Oval
      ctx.beginPath()
      ctx.ellipse(cx, s.y + ry, rx, ry, 0, 0, Math.PI * 2)
      if (s.fillColor && s.fillColor !== 'transparent') {
        ctx.fill()
      }
      ctx.stroke()

      // Body (sides)
      ctx.beginPath()
      ctx.moveTo(s.x, s.y + ry)
      ctx.lineTo(s.x, s.y + s.height - ry)
      ctx.moveTo(s.x + s.width, s.y + ry)
      ctx.lineTo(s.x + s.width, s.y + s.height - ry)
      ctx.stroke()

      // Bottom Oval (solid front arc)
      ctx.beginPath()
      ctx.ellipse(cx, s.y + s.height - ry, rx, ry, 0, 0, Math.PI)
      ctx.stroke()

      // Bottom Oval (dashed back arc)
      ctx.save()
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.ellipse(cx, s.y + s.height - ry, rx, ry, 0, Math.PI, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
      break
    }

    case 'coordinatePlane': {
      const s = element as ShapeElement
      const cx = s.x + s.width / 2
      const cy = s.y + s.height / 2

      // Axis lines
      ctx.beginPath()
      // X-Axis
      ctx.moveTo(s.x, cy)
      ctx.lineTo(s.x + s.width, cy)
      // Y-Axis
      ctx.moveTo(cx, s.y + s.height)
      ctx.lineTo(cx, s.y)
      ctx.stroke()

      // Arrow heads
      drawArrowhead(ctx, s.x, cy, s.x + s.width, cy, 8)
      drawArrowhead(ctx, cx, s.y + s.height, cx, s.y, 8)

      // Axis Labels (X & Y)
      ctx.save()
      ctx.font = 'bold 12px sans-serif'
      ctx.fillStyle = element.strokeColor
      ctx.fillText('X', s.x + s.width - 14, cy - 6)
      ctx.fillText('Y', cx + 6, s.y + 14)

      // Grid tick marks
      const ticks = 4
      const stepX = s.width / 2 / (ticks + 1)
      const stepY = s.height / 2 / (ticks + 1)
      for (let i = 1; i <= ticks; i++) {
        // X ticks
        ctx.beginPath()
        ctx.moveTo(cx + i * stepX, cy - 3)
        ctx.lineTo(cx + i * stepX, cy + 3)
        ctx.moveTo(cx - i * stepX, cy - 3)
        ctx.lineTo(cx - i * stepX, cy + 3)
        // Y ticks
        ctx.moveTo(cx - 3, cy - i * stepY)
        ctx.lineTo(cx + 3, cy - i * stepY)
        ctx.moveTo(cx - 3, cy + i * stepY)
        ctx.lineTo(cx + 3, cy + i * stepY)
        ctx.stroke()
      }
      ctx.restore()
      break
    }

    case 'text':
    case 'math': {
      const t = element as TextElement
      ctx.font = `${t.fontSize}px 'Alexandria', 'Cairo', sans-serif`
      ctx.fillStyle = t.strokeColor
      ctx.textBaseline = 'top'
      ctx.direction = 'rtl'
      const lines = t.text.split('\n')
      const lineHeight = t.fontSize * 1.3
      lines.forEach((line, idx) => {
        ctx.fillText(line, t.x, t.y + idx * lineHeight)
      })
      break
    }
  }

  // Draw selection bounding box if selected
  if (isSelected) {
    const bounds = getElementBounds(element)
    ctx.save()
    ctx.strokeStyle = '#4f46e5' // primary indigo
    ctx.lineWidth = 1.5
    ctx.setLineDash([4, 4])
    ctx.strokeRect(bounds.x - 6, bounds.y - 6, bounds.width + 12, bounds.height + 12)

    // Corner handle
    ctx.fillStyle = '#ffffff'
    ctx.strokeStyle = '#4f46e5'
    ctx.setLineDash([])
    const handles = [
      { x: bounds.x - 6, y: bounds.y - 6 },
      { x: bounds.x + bounds.width + 6, y: bounds.y - 6 },
      { x: bounds.x - 6, y: bounds.y + bounds.height + 6 },
      { x: bounds.x + bounds.width + 6, y: bounds.y + bounds.height + 6 },
    ]
    handles.forEach((h) => {
      ctx.fillRect(h.x - 4, h.y - 4, 8, 8)
      ctx.strokeRect(h.x - 4, h.y - 4, 8, 8)
    })
    ctx.restore()
  }

  ctx.restore()
}

export function getElementBounds(element: WhiteboardElement): {
  x: number
  y: number
  width: number
  height: number
} {
  switch (element.type) {
    case 'path': {
      const p = element as PathElement
      if (p.points.length === 0) return { x: p.x, y: p.y, width: 0, height: 0 }
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity
      for (const pt of p.points) {
        if (pt.x < minX) minX = pt.x
        if (pt.y < minY) minY = pt.y
        if (pt.x > maxX) maxX = pt.x
        if (pt.y > maxY) maxY = pt.y
      }
      return {
        x: minX,
        y: minY,
        width: Math.max(1, maxX - minX),
        height: Math.max(1, maxY - minY),
      }
    }

    case 'line':
    case 'arrow':
    case 'doubleArrow': {
      const l = element as LineElement
      const minX = Math.min(l.x, l.endX)
      const minY = Math.min(l.y, l.endY)
      const maxX = Math.max(l.x, l.endX)
      const maxY = Math.max(l.y, l.endY)
      return {
        x: minX,
        y: minY,
        width: Math.max(1, maxX - minX),
        height: Math.max(1, maxY - minY),
      }
    }

    case 'rect':
    case 'ellipse':
    case 'triangle':
    case 'star':
    case 'diamond':
    case 'rightTriangle':
    case 'hexagon':
    case 'cylinder':
    case 'cube':
    case 'coordinatePlane': {
      const s = element as ShapeElement
      const x = s.width < 0 ? s.x + s.width : s.x
      const y = s.height < 0 ? s.y + s.height : s.y
      return {
        x,
        y,
        width: Math.abs(s.width),
        height: Math.abs(s.height),
      }
    }

    case 'text':
    case 'math': {
      const t = element as TextElement
      const lines = t.text.split('\n')
      const estWidth = Math.max(...lines.map((l) => l.length * t.fontSize * 0.6), 40)
      const estHeight = lines.length * t.fontSize * 1.3
      return {
        x: t.x,
        y: t.y,
        width: t.width || estWidth,
        height: t.height || estHeight,
      }
    }
  }
}

export function hitTestElement(element: WhiteboardElement, pt: Point): boolean {
  const bounds = getElementBounds(element)
  const padding = Math.max(8, element.strokeWidth)
  return (
    pt.x >= bounds.x - padding &&
    pt.x <= bounds.x + bounds.width + padding &&
    pt.y >= bounds.y - padding &&
    pt.y <= bounds.y + bounds.height + padding
  )
}
