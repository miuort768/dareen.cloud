import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface HeroSwapProps {
  first: ReactNode
  second: ReactNode
  className?: string
  intervalMs?: number
  showDots?: boolean
}

/**
 * مستطيل واحد يعرض أحد العنصرين في كل مرة بعرض كامل وبنفس الأبعاد.
 * كلا المستطيلين مثبتان دائماً في نفس الخليّة (grid-cell) لضمان تساوي الارتفاع.
 * يحترم prefers-reduced-motion ويوقف التبديل عند التمرير/التركيز.
 */
export const HeroSwap = ({
  first,
  second,
  className = 'relative',
  intervalMs = 7000,
  showDots = true,
}: HeroSwapProps) => {
  const [active, setActive] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const prevActiveRef = useRef(0)
  const slides = [first, second]

  useEffect(() => {
    prevActiveRef.current = active
  }, [active])

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }
    if (isPaused) return

    const timer = window.setInterval(() => {
      setActive((s) => (s + 1) % slides.length)
    }, intervalMs)

    return () => window.clearInterval(timer)
  }, [intervalMs, isPaused, slides.length])

  const direction = active >= prevActiveRef.current ? 1 : -1

  const goTo = (index: number) => {
    if (index === active) return
    setActive(index)
  }

  return (
    <div
      className={className}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="grid grid-cols-1">
        {slides.map((slide, i) => {
          const isActive = i === active

          return (
            <motion.div
              key={i}
              animate={{
                x: isActive ? 0 : direction > 0 ? -24 : 24,
                opacity: isActive ? 1 : 0,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              className={`col-start-1 row-start-1 h-full w-full will-change-transform ${
                isActive ? 'z-10' : 'z-0'
              }`}
              style={{ pointerEvents: isActive ? 'auto' : 'none' }}
              aria-hidden={!isActive}
            >
              {slide}
            </motion.div>
          )
        })}
      </div>

      {showDots && slides.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`عرض المستطيل ${i + 1}`}
              aria-current={i === active ? 'page' : undefined}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                i === active
                  ? 'w-6 bg-primary shadow-[0_0_0_4px] shadow-primary/10'
                  : 'w-2 bg-border hover:bg-primary/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
