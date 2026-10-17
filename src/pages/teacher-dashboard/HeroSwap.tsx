import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface HeroSwapProps {
  first: ReactNode
  second: ReactNode
  className?: string
  intervalMs?: number
  showDots?: boolean
}

/**
 * مستطيل واحد يعرض أحد العنصرين في كل مرة بعرض كامل وبنفس الأبعاد.
 * يتبادلان مكانهما بانزلاق أفقي متبادل + شبح خفيف، ويستندان على نفس الارتفاع.
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

  const prevActive = prevActiveRef.current
  const direction = active > prevActive ? 1 : active < prevActive ? -1 : 0
  const slideDir = direction === 0 ? (active === 0 ? -1 : 1) : direction

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 16 : -16,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -16 : 16,
      opacity: 0,
    }),
  }

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
        <AnimatePresence initial={false} custom={slideDir}>
          <motion.div
            key={active}
            custom={slideDir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 260, damping: 28, mass: 0.92 }}
            className="col-start-1 row-start-1 h-full w-full will-change-transform"
            aria-live="polite"
          >
            <div className="h-full">{slides[active]}</div>
          </motion.div>
        </AnimatePresence>
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
