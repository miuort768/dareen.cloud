import React, { useRef, useState } from 'react'
import { RotateCcw, X } from 'lucide-react'

interface InteractiveRulerProps {
  visible: boolean
  onClose: () => void
}

export const InteractiveRuler: React.FC<InteractiveRulerProps> = ({ visible, onClose }) => {
  const [pos, setPos] = useState({ x: 200, y: 300 })
  const [angle, setAngle] = useState(0)
  const isDragging = useRef(false)
  const startDrag = useRef({ x: 0, y: 0 })

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
        transformOrigin: '0% 0%',
      }}
      className="bg-surface/90 absolute z-20 cursor-move select-none rounded-xl border border-primary/20 shadow-elevation-3 backdrop-blur-md transition-shadow hover:shadow-elevation-4"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className="relative flex h-16 w-96 items-center px-4">
        {/* Ruler ticks */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex h-4 justify-between px-2">
          {Array.from({ length: 31 }).map((_, i) => (
            <div
              key={i}
              className={`w-0.5 bg-muted ${
                i % 10 === 0 ? 'h-4 bg-primary font-bold' : i % 5 === 0 ? 'h-3' : 'h-1.5'
              }`}
            >
              {i % 5 === 0 && (
                <span className="mt-3 block -translate-x-1/2 font-mono text-[8px] text-main">
                  {i}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="z-10 ms-auto flex items-center gap-1.5">
          <button
            type="button"
            title="تدوير المسطرة 15 درجة"
            onClick={(e) => {
              e.stopPropagation()
              setAngle((a) => (a + 15) % 360)
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-main shadow-elevation-1 transition-colors hover:bg-hover"
          >
            <RotateCcw size={14} />
          </button>
          <button
            type="button"
            title="إغلاق المسطرة"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="bg-error/10 hover:bg-error/20 flex h-8 w-8 items-center justify-center rounded-lg text-error transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

interface InteractiveProtractorProps {
  visible: boolean
  onClose: () => void
}

export const InteractiveProtractor: React.FC<InteractiveProtractorProps> = ({
  visible,
  onClose,
}) => {
  const [pos, setPos] = useState({ x: 300, y: 250 })
  const [angle, setAngle] = useState(0)
  const isDragging = useRef(false)
  const startDrag = useRef({ x: 0, y: 0 })

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
      }}
      className="bg-surface/85 absolute z-20 h-40 w-80 cursor-move select-none rounded-t-full border-x border-t border-primary/30 shadow-elevation-3 backdrop-blur-md"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Semicircle ticks */}
      <svg className="pointer-events-none h-full w-full overflow-visible" viewBox="0 0 200 100">
        <path
          d="M 10 100 A 90 90 0 0 1 190 100 Z"
          fill="none"
          stroke="currentColor"
          className="text-primary/20"
          strokeWidth="1"
        />
        {Array.from({ length: 19 }).map((_, i) => {
          const deg = i * 10
          const rad = (deg * Math.PI) / 180
          const x1 = 100 - 90 * Math.cos(rad)
          const y1 = 100 - 90 * Math.sin(rad)
          const x2 = 100 - (i % 3 === 0 ? 76 : 82) * Math.cos(rad)
          const y2 = 100 - (i % 3 === 0 ? 76 : 82) * Math.sin(rad)
          return (
            <g key={i}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                className="text-muted"
                strokeWidth={i % 3 === 0 ? 1.5 : 1}
              />
              {i % 3 === 0 && (
                <text
                  x={100 - 68 * Math.cos(rad)}
                  y={100 - 68 * Math.sin(rad)}
                  fontSize="7"
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

      <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-2">
        <button
          type="button"
          title="تدوير المنقلة 15 درجة"
          onClick={(e) => {
            e.stopPropagation()
            setAngle((a) => (a + 15) % 360)
          }}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-main shadow-elevation-1 transition-colors hover:bg-hover"
        >
          <RotateCcw size={12} />
        </button>
        <button
          type="button"
          title="إغلاق المنقلة"
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="bg-error/10 hover:bg-error/20 flex h-7 w-7 items-center justify-center rounded-lg text-error transition-colors"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  )
}
