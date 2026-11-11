import React, { useRef, useState, useEffect } from 'react'
import { RotateCcw, RotateCw, X, GripHorizontal, Compass as CompassIcon } from 'lucide-react'

// Helper to calculate center position
function getCenterPosition(width: number, height: number) {
  if (typeof window === 'undefined') return { x: 200, y: 200 }
  const x = Math.max(16, Math.round((window.innerWidth - width) / 2))
  const y = Math.max(70, Math.round((window.innerHeight - height) / 2))
  return { x, y }
}

/* =========================================================================
   1. Interactive Ruler (المسطرة الهندسية التفاعلية)
   ========================================================================= */
interface InteractiveRulerProps {
  visible: boolean
  onClose: () => void
}

export const InteractiveRuler: React.FC<InteractiveRulerProps> = ({ visible, onClose }) => {
  const rulerWidth = 500
  const rulerHeight = 72
  const [pos, setPos] = useState(() => getCenterPosition(rulerWidth, rulerHeight))
  const [angle, setAngle] = useState(0)
  const isDragging = useRef(false)
  const startDrag = useRef({ x: 0, y: 0 })

  // Re-center when opened
  useEffect(() => {
    if (visible) {
      setPos(getCenterPosition(rulerWidth, rulerHeight))
      setAngle(0)
    }
  }, [visible])

  if (!visible) return null

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    startDrag.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging.current) {
      setPos({
        x: e.clientX - startDrag.current.x,
        y: e.clientY - startDrag.current.y,
      })
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false
    try {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      // ignore
    }
  }

  // 30 cm scale: 31 major marks, each cm has 10 mm subdivisions
  const totalCm = 25

  return (
    <div
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px) rotate(${angle}deg)`,
        transformOrigin: '50% 50%',
        width: `${rulerWidth}px`,
      }}
      className="bg-surface/90 fixed z-40 cursor-move select-none rounded-2xl border-2 border-primary/30 shadow-elevation-4 backdrop-blur-md transition-shadow hover:shadow-elevation-4"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className="relative flex h-[72px] flex-col justify-between overflow-hidden px-3 py-1.5">
        {/* Top Ticks: Centimeter & Millimeter Scale */}
        <div className="pointer-events-none relative flex h-6 w-full items-start justify-between">
          {Array.from({ length: totalCm + 1 }).map((_, cm) => (
            <div key={`cm-${cm}`} className="relative flex flex-col items-center">
              <div className="h-4 w-[1.5px] bg-primary font-bold" />
              <span className="mt-0.5 select-none font-mono text-[9px] font-black text-main">
                {cm}
              </span>

              {/* Sub-divisions: mm ticks between this cm and next */}
              {cm < totalCm && (
                <div className="pointer-events-none absolute start-0 top-0 flex w-full justify-between">
                  {/* We let flex distribution handle it */}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Center Control & Drag Grip Strip */}
        <div className="relative z-10 flex items-center justify-between px-2 pt-1">
          {/* Angle Display Badge */}
          <div className="bg-surface-active/60 border-border/50 flex items-center gap-1.5 rounded-lg border px-2 py-0.5 font-mono text-[10px] font-bold text-main">
            <CompassIcon size={12} className="text-primary" />
            <span>{Math.round(angle % 360)}°</span>
          </div>

          {/* Drag Handle Label */}
          <div className="flex items-center gap-1 text-[10px] font-bold text-muted">
            <GripHorizontal size={14} className="text-primary/70" />
            <span>مسطرة قياس (30 سم)</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="تدوير عكس عقارب الساعة (-15°)"
              onClick={(e) => {
                e.stopPropagation()
                setAngle((a) => (a - 15 + 360) % 360)
              }}
              className="flex h-6 w-6 items-center justify-center rounded-lg border border-border bg-surface text-main shadow-elevation-1 transition-colors hover:bg-hover"
            >
              <RotateCcw size={12} />
            </button>
            <button
              type="button"
              title="تدوير مع عقارب الساعة (+15°)"
              onClick={(e) => {
                e.stopPropagation()
                setAngle((a) => (a + 15) % 360)
              }}
              className="flex h-6 w-6 items-center justify-center rounded-lg border border-border bg-surface text-main shadow-elevation-1 transition-colors hover:bg-hover"
            >
              <RotateCw size={12} />
            </button>
            <button
              type="button"
              title="إعادة للوضع الأفقي (0°)"
              onClick={(e) => {
                e.stopPropagation()
                setAngle(0)
              }}
              className="rounded-lg border border-border bg-surface px-1.5 py-0.5 text-[9px] font-bold text-main hover:bg-hover"
            >
              0°
            </button>
            <button
              type="button"
              title="إغلاق المسطرة"
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className="bg-error/10 hover:bg-error/20 flex h-6 w-6 items-center justify-center rounded-lg text-error transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        </div>

        {/* Bottom subtle millimeter guide line */}
        <div className="pointer-events-none flex h-1.5 w-full justify-between border-t border-primary/20 pt-0.5 opacity-60">
          {Array.from({ length: 51 }).map((_, i) => (
            <div key={i} className={`w-[1px] bg-muted ${i % 5 === 0 ? 'h-1.5' : 'h-1'}`} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   2. Interactive Protractor (المنقلة والبرجل الهندسي)
   ========================================================================= */
interface InteractiveProtractorProps {
  visible: boolean
  onClose: () => void
}

export const InteractiveProtractor: React.FC<InteractiveProtractorProps> = ({
  visible,
  onClose,
}) => {
  const protractorWidth = 380
  const protractorHeight = 195
  const [pos, setPos] = useState(() => getCenterPosition(protractorWidth, protractorHeight))
  const [angle, setAngle] = useState(0)
  const isDragging = useRef(false)
  const startDrag = useRef({ x: 0, y: 0 })

  // Re-center when opened
  useEffect(() => {
    if (visible) {
      setPos(getCenterPosition(protractorWidth, protractorHeight))
      setAngle(0)
    }
  }, [visible])

  if (!visible) return null

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    startDrag.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging.current) {
      setPos({
        x: e.clientX - startDrag.current.x,
        y: e.clientY - startDrag.current.y,
      })
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false
    try {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      // ignore
    }
  }

  return (
    <div
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px) rotate(${angle}deg)`,
        transformOrigin: '50% 100%',
        width: `${protractorWidth}px`,
        height: `${protractorHeight}px`,
      }}
      className="bg-surface/90 fixed z-40 cursor-move select-none rounded-t-full border-x-2 border-t-2 border-primary/35 shadow-elevation-4 backdrop-blur-md transition-shadow hover:shadow-elevation-4"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Semicircle SVG with Degrees & Crosshair */}
      <svg className="pointer-events-none h-full w-full overflow-visible" viewBox="0 0 200 100">
        {/* Outer Arc */}
        <path
          d="M 6 100 A 94 94 0 0 1 194 100 Z"
          fill="none"
          stroke="currentColor"
          className="text-primary/30"
          strokeWidth="1.5"
        />

        {/* Inner Arc Cutout Line */}
        <path
          d="M 40 100 A 60 60 0 0 1 160 100 Z"
          fill="none"
          stroke="currentColor"
          className="text-primary/15"
          strokeWidth="1"
        />

        {/* Center Vertical 90° reference */}
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="6"
          stroke="currentColor"
          className="stroke-dasharray-[2,2] text-primary/40"
          strokeWidth="1"
        />

        {/* Center Origin Crosshair Point */}
        <circle
          cx="100"
          cy="100"
          r="3"
          fill="none"
          stroke="currentColor"
          className="text-primary"
          strokeWidth="1.5"
        />
        <line
          x1="93"
          y1="100"
          x2="107"
          y2="100"
          stroke="currentColor"
          className="text-primary"
          strokeWidth="1.5"
        />
        <line
          x1="100"
          y1="93"
          x2="100"
          y2="107"
          stroke="currentColor"
          className="text-primary"
          strokeWidth="1.5"
        />

        {/* Degree ticks (every 10°, with major 30° / 45° / 90° numbers) */}
        {Array.from({ length: 19 }).map((_, i) => {
          const deg = i * 10
          const rad = (deg * Math.PI) / 180
          const x1 = 100 - 94 * Math.cos(rad)
          const y1 = 100 - 94 * Math.sin(rad)
          const isMajor = deg % 30 === 0 || deg === 45 || deg === 90 || deg === 135
          const tickLen = isMajor ? 14 : deg % 5 === 0 ? 9 : 5
          const x2 = 100 - (94 - tickLen) * Math.cos(rad)
          const y2 = 100 - (94 - tickLen) * Math.sin(rad)

          return (
            <g key={i}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                className={isMajor ? 'text-primary' : 'text-muted'}
                strokeWidth={isMajor ? 1.5 : 0.8}
              />
              {deg % 20 === 0 && (
                <text
                  x={100 - 74 * Math.cos(rad)}
                  y={100 - 74 * Math.sin(rad)}
                  fontSize="5.5"
                  fontWeight="bold"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  className="fill-main font-mono"
                >
                  {deg}°
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Floating Control Hub */}
      <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5 px-4">
        <div className="bg-surface/95 flex items-center gap-1 rounded-xl border border-border px-2 py-1 shadow-elevation-2">
          {/* Current Angle */}
          <span className="pe-1 font-mono text-[10px] font-black text-main">
            {Math.round(angle % 360)}°
          </span>

          <button
            type="button"
            title="تدوير عكس عقارب الساعة (-15°)"
            onClick={(e) => {
              e.stopPropagation()
              setAngle((a) => (a - 15 + 360) % 360)
            }}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-main transition-colors hover:bg-hover"
          >
            <RotateCcw size={12} />
          </button>

          <button
            type="button"
            title="تدوير مع عقارب الساعة (+15°)"
            onClick={(e) => {
              e.stopPropagation()
              setAngle((a) => (a + 15) % 360)
            }}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-main transition-colors hover:bg-hover"
          >
            <RotateCw size={12} />
          </button>

          <button
            type="button"
            title="إعادة الوضع لـ 0°"
            onClick={(e) => {
              e.stopPropagation()
              setAngle(0)
            }}
            className="rounded-lg px-1.5 py-0.5 text-[9px] font-bold text-main hover:bg-hover"
          >
            0°
          </button>

          <div className="mx-0.5 h-4 w-px bg-border" />

          <button
            type="button"
            title="إغلاق المنقلة"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="hover:bg-error/10 flex h-6 w-6 items-center justify-center rounded-lg text-error"
          >
            <X size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   3. Interactive Set Square (المثلث الهندسي والكوس)
   ========================================================================= */
interface InteractiveSetSquareProps {
  visible: boolean
  onClose: () => void
}

export const InteractiveSetSquare: React.FC<InteractiveSetSquareProps> = ({ visible, onClose }) => {
  const squareSize = 250
  const [pos, setPos] = useState(() => getCenterPosition(squareSize, squareSize))
  const [angle, setAngle] = useState(0)
  const isDragging = useRef(false)
  const startDrag = useRef({ x: 0, y: 0 })

  // Re-center when opened
  useEffect(() => {
    if (visible) {
      setPos(getCenterPosition(squareSize, squareSize))
      setAngle(0)
    }
  }, [visible])

  if (!visible) return null

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    startDrag.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging.current) {
      setPos({
        x: e.clientX - startDrag.current.x,
        y: e.clientY - startDrag.current.y,
      })
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false
    try {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      // ignore
    }
  }

  return (
    <div
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px) rotate(${angle}deg)`,
        transformOrigin: '20% 80%',
        width: `${squareSize}px`,
        height: `${squareSize}px`,
      }}
      className="fixed z-40 cursor-move select-none shadow-elevation-4 backdrop-blur-md transition-shadow hover:shadow-elevation-4"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <svg className="h-full w-full drop-shadow-md" viewBox="0 0 200 200">
        {/* Outer Triangle (Acrylic base) */}
        <polygon
          points="10,190 190,190 10,10"
          className="fill-surface/85 stroke-primary/40"
          strokeWidth="2"
        />

        {/* Inner Cutout with soft border */}
        <polygon
          points="35,170 145,170 35,60"
          className="fill-background/40 stroke-primary/25"
          strokeWidth="1.5"
        />

        {/* 90-degree right angle symbol */}
        <polyline
          points="10,175 25,175 25,190"
          fill="none"
          stroke="currentColor"
          className="font-bold text-primary"
          strokeWidth="1.5"
        />

        {/* Pencil guide circular hole */}
        <circle cx="60" cy="145" r="8" className="fill-surface stroke-primary/40" strokeWidth="1" />

        {/* Bottom Horizontal Leg Scale (cm & mm) */}
        {Array.from({ length: 18 }).map((_, i) => (
          <g key={`h-${i}`}>
            <line
              x1={15 + i * 10}
              y1={190}
              x2={15 + i * 10}
              y2={i % 5 === 0 ? 176 : 183}
              stroke="currentColor"
              className={i % 5 === 0 ? 'text-primary' : 'text-muted'}
              strokeWidth={i % 5 === 0 ? 1.5 : 0.8}
            />
            {i % 5 === 0 && (
              <text
                x={15 + i * 10}
                y={172}
                fontSize="6"
                fontWeight="bold"
                textAnchor="middle"
                className="fill-main font-mono"
              >
                {i}
              </text>
            )}
          </g>
        ))}

        {/* Vertical Leg Scale (cm & mm) */}
        {Array.from({ length: 18 }).map((_, i) => (
          <g key={`v-${i}`}>
            <line
              x1={10}
              y1={185 - i * 10}
              x2={i % 5 === 0 ? 24 : 17}
              y2={185 - i * 10}
              stroke="currentColor"
              className={i % 5 === 0 ? 'text-primary' : 'text-muted'}
              strokeWidth={i % 5 === 0 ? 1.5 : 0.8}
            />
            {i % 5 === 0 && (
              <text
                x={28}
                y={187 - i * 10}
                fontSize="6"
                fontWeight="bold"
                alignmentBaseline="middle"
                className="fill-main font-mono"
              >
                {i}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Control Pill placed cleanly inside the triangle */}
      <div className="bg-surface/95 absolute bottom-6 start-8 flex items-center gap-1 rounded-xl border border-border p-1 shadow-elevation-2">
        <span className="px-1 font-mono text-[9px] font-bold text-main">
          {Math.round(angle % 360)}°
        </span>

        <button
          type="button"
          title="تدوير عكس عقارب الساعة (-15°)"
          onClick={(e) => {
            e.stopPropagation()
            setAngle((a) => (a - 15 + 360) % 360)
          }}
          className="flex h-6 w-6 items-center justify-center rounded-lg text-main hover:bg-hover"
        >
          <RotateCcw size={11} />
        </button>

        <button
          type="button"
          title="تدوير مع عقارب الساعة (+15°)"
          onClick={(e) => {
            e.stopPropagation()
            setAngle((a) => (a + 15) % 360)
          }}
          className="flex h-6 w-6 items-center justify-center rounded-lg text-main hover:bg-hover"
        >
          <RotateCw size={11} />
        </button>

        <button
          type="button"
          title="إعادة الوضع لـ 0°"
          onClick={(e) => {
            e.stopPropagation()
            setAngle(0)
          }}
          className="rounded-lg px-1.5 py-0.5 text-[9px] font-bold text-main hover:bg-hover"
        >
          0°
        </button>

        <div className="mx-0.5 h-4 w-px bg-border" />

        <button
          type="button"
          title="إغلاق مثلث الرسم"
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="hover:bg-error/10 flex h-6 w-6 items-center justify-center rounded-lg text-error"
        >
          <X size={11} />
        </button>
      </div>
    </div>
  )
}
