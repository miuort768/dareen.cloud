import React, { useRef, useEffect, useState, useCallback } from 'react'
import type {
  WhiteboardTool,
  WhiteboardElement,
  WhiteboardPage,
  Point,
  PathElement,
  LineElement,
  ShapeElement,
  TextElement,
} from '../../types/whiteboard'
import { drawBackground } from './backgroundRenderer'
import { drawElement, hitTestElement } from './canvasRenderer'

interface WhiteboardCanvasProps {
  page: WhiteboardPage
  tool: WhiteboardTool
  color: string
  strokeWidth: number
  fillColor: string
  onElementsChange: (elements: WhiteboardElement[]) => void
  selectedElementId: string | null
  setSelectedElementId: (id: string | null) => void
}

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  page,
  tool,
  color,
  strokeWidth,
  fillColor,
  onElementsChange,
  selectedElementId,
  setSelectedElementId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Zoom and Pan
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const isPanning = useRef(false)
  const lastPanPoint = useRef({ x: 0, y: 0 })

  // Active interaction
  const isInteracting = useRef(false)
  const currentPath = useRef<Point[]>([])
  const activeStartPoint = useRef<Point>({ x: 0, y: 0 })
  const movingElementOffset = useRef<Point>({ x: 0, y: 0 })

  // Text inline input overlay state
  const [textInput, setTextInput] = useState<{
    visible: boolean
    x: number
    y: number
    text: string
    fontSize: number
  } | null>(null)

  // Convert client viewport coordinates to canvas virtual coordinates (accounting for pan and zoom)
  const getCanvasPoint = useCallback(
    (clientX: number, clientY: number): Point => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }
      const rect = canvas.getBoundingClientRect()
      const clientOffsetX = clientX - rect.left
      const clientOffsetY = clientY - rect.top
      return {
        x: (clientOffsetX - pan.x) / zoom,
        y: (clientOffsetY - pan.y) / zoom,
      }
    },
    [pan, zoom],
  )

  // Re-render canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const width = canvas.width / dpr
    const height = canvas.height / dpr

    ctx.save()
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, height)

    // Apply pan and zoom
    ctx.translate(pan.x, pan.y)
    ctx.scale(zoom, zoom)

    // Virtual board boundaries: 3200 x 2200
    const boardWidth = 3200
    const boardHeight = 2200

    // Draw background
    drawBackground(ctx, boardWidth, boardHeight, page.background)

    // Draw elements
    page.elements.forEach((el) => {
      drawElement(ctx, el, el.id === selectedElementId)
    })

    // Draw active drawing in progress
    if (isInteracting.current) {
      if (tool === 'pen' || tool === 'highlighter') {
        const previewEl: PathElement = {
          id: '__preview',
          type: 'path',
          x: 0,
          y: 0,
          points: currentPath.current,
          strokeColor: color,
          strokeWidth,
          isHighlighter: tool === 'highlighter',
        }
        drawElement(ctx, previewEl, false)
      }
    }

    ctx.restore()
  }, [page, tool, color, strokeWidth, pan, zoom, selectedElementId])

  // Resize canvas to match container
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current
      const canvas = canvasRef.current
      if (!container || !canvas) return

      const dpr = window.devicePixelRatio || 1
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      render()
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [render])

  useEffect(() => {
    render()
  }, [render])

  // Mouse / Touch pointer down
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Middle click or space down = pan
    if (e.button === 1 || e.altKey) {
      isPanning.current = true
      lastPanPoint.current = { x: e.clientX, y: e.clientY }
      return
    }

    const pt = getCanvasPoint(e.clientX, e.clientY)
    activeStartPoint.current = pt

    if (tool === 'select') {
      // Find element clicked (reverse search for top-most)
      const found = [...page.elements].reverse().find((el) => hitTestElement(el, pt))
      if (found) {
        setSelectedElementId(found.id)
        isInteracting.current = true
        movingElementOffset.current = {
          x: pt.x - found.x,
          y: pt.y - found.y,
        }
      } else {
        setSelectedElementId(null)
      }
      return
    }

    if (tool === 'eraser') {
      // Erase element under pointer
      const remaining = page.elements.filter((el) => !hitTestElement(el, pt))
      if (remaining.length !== page.elements.length) {
        onElementsChange(remaining)
      }
      return
    }

    if (tool === 'text') {
      setTextInput({
        visible: true,
        x: pt.x,
        y: pt.y,
        text: '',
        fontSize: Math.max(18, strokeWidth * 6),
      })
      return
    }

    isInteracting.current = true
    if (tool === 'pen' || tool === 'highlighter') {
      currentPath.current = [pt]
    }
  }

  // Pointer move
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPanning.current) {
      const dx = e.clientX - lastPanPoint.current.x
      const dy = e.clientY - lastPanPoint.current.y
      lastPanPoint.current = { x: e.clientX, y: e.clientY }
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }))
      return
    }

    const pt = getCanvasPoint(e.clientX, e.clientY)

    if (tool === 'eraser' && e.buttons === 1) {
      const remaining = page.elements.filter((el) => !hitTestElement(el, pt))
      if (remaining.length !== page.elements.length) {
        onElementsChange(remaining)
      }
      return
    }

    if (!isInteracting.current) return

    if (tool === 'select' && selectedElementId) {
      // Move selected element
      const updated = page.elements.map((el) => {
        if (el.id !== selectedElementId) return el
        const newX = pt.x - movingElementOffset.current.x
        const newY = pt.y - movingElementOffset.current.y
        const dx = newX - el.x
        const dy = newY - el.y

        if (el.type === 'path') {
          const p = el as PathElement
          return {
            ...p,
            x: newX,
            y: newY,
            points: p.points.map((pt) => ({ x: pt.x + dx, y: pt.y + dy })),
          }
        }
        if (el.type === 'line' || el.type === 'arrow' || el.type === 'doubleArrow') {
          const l = el as LineElement
          return {
            ...l,
            x: newX,
            y: newY,
            endX: l.endX + dx,
            endY: l.endY + dy,
          }
        }
        return {
          ...el,
          x: newX,
          y: newY,
        }
      })
      onElementsChange(updated)
      return
    }

    if (tool === 'pen' || tool === 'highlighter') {
      currentPath.current.push(pt)
      render()
    }
  }

  // Pointer up / end drawing
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPanning.current) {
      isPanning.current = false
      return
    }

    if (!isInteracting.current) return
    isInteracting.current = false

    const pt = getCanvasPoint(e.clientX, e.clientY)
    const start = activeStartPoint.current

    if (tool === 'pen' || tool === 'highlighter') {
      if (currentPath.current.length > 1) {
        const newEl: PathElement = {
          id: `path_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          type: 'path',
          x: start.x,
          y: start.y,
          points: [...currentPath.current],
          strokeColor: color,
          strokeWidth,
          isHighlighter: tool === 'highlighter',
        }
        onElementsChange([...page.elements, newEl])
      }
      currentPath.current = []
      render()
      return
    }

    // Line / Arrow
    if (tool === 'line' || tool === 'arrow' || tool === 'doubleArrow') {
      const newLine: LineElement = {
        id: `line_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: tool,
        x: start.x,
        y: start.y,
        endX: pt.x,
        endY: pt.y,
        strokeColor: color,
        strokeWidth,
      }
      onElementsChange([...page.elements, newLine])
      return
    }

    // Rect / Ellipse / Triangle / Star
    if (tool === 'rect' || tool === 'ellipse' || tool === 'triangle' || tool === 'star') {
      const width = pt.x - start.x
      const height = pt.y - start.y
      if (Math.abs(width) > 4 && Math.abs(height) > 4) {
        const newShape: ShapeElement = {
          id: `shape_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          type: tool,
          x: width < 0 ? pt.x : start.x,
          y: height < 0 ? pt.y : start.y,
          width: Math.abs(width),
          height: Math.abs(height),
          strokeColor: color,
          fillColor: fillColor || 'transparent',
          strokeWidth,
        }
        onElementsChange([...page.elements, newShape])
      }
    }
  }

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY < 0 ? 1.1 : 0.9
      setZoom((z) => Math.min(Math.max(0.3, z * delta), 4))
    } else {
      setPan((p) => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }))
    }
  }

  // Commit text input
  const handleCommitText = () => {
    if (textInput && textInput.text.trim()) {
      const newText: TextElement = {
        id: `text_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: 'text',
        x: textInput.x,
        y: textInput.y,
        text: textInput.text,
        fontSize: textInput.fontSize,
        strokeColor: color,
        strokeWidth: 1,
      }
      onElementsChange([...page.elements, newText])
    }
    setTextInput(null)
  }

  return (
    <div
      ref={containerRef}
      className="bg-surface-active/20 relative h-full w-full flex-1 touch-none select-none overflow-hidden"
      onWheel={handleWheel}
    >
      <canvas
        ref={canvasRef}
        className={`h-full w-full ${
          tool === 'select'
            ? 'cursor-default'
            : tool === 'eraser'
              ? 'cursor-crosshair'
              : 'cursor-crosshair'
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />

      {/* Floating text inline editor */}
      {textInput && (
        <div
          style={{
            left: `${textInput.x * zoom + pan.x}px`,
            top: `${textInput.y * zoom + pan.y}px`,
          }}
          className="absolute z-20"
        >
          <textarea
            autoFocus
            dir="auto"
            rows={2}
            value={textInput.text}
            onChange={(e) => setTextInput({ ...textInput, text: e.target.value })}
            onBlur={handleCommitText}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleCommitText()
              }
            }}
            placeholder="اكتب هنا..."
            className="bg-surface/95 rounded-lg border-2 border-primary p-2 font-sans text-main shadow-elevation-3 outline-none"
            style={{
              fontSize: `${textInput.fontSize * zoom}px`,
              color,
              minWidth: '180px',
            }}
          />
        </div>
      )}

      {/* Zoom indicator & controls overlay */}
      <div className="bg-surface/90 absolute bottom-3 end-3 z-10 flex items-center gap-1 rounded-xl border border-border px-2 py-1 shadow-elevation-2 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.3, z - 0.15))}
          className="h-6 w-6 rounded-lg text-sm font-bold text-main hover:bg-hover"
          title="تصغير"
        >
          -
        </button>
        <span className="min-w-12 text-center font-mono text-xs font-bold text-main">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(4, z + 0.15))}
          className="h-6 w-6 rounded-lg text-sm font-bold text-main hover:bg-hover"
          title="تكبير"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => {
            setZoom(1)
            setPan({ x: 0, y: 0 })
          }}
          className="ms-1 rounded px-1 text-[10px] text-muted hover:text-main"
          title="إعادة ضبط الرؤية"
        >
          إعادة ضبط
        </button>
      </div>
    </div>
  )
}
