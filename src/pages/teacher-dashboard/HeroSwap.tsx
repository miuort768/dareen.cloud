import { useEffect, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface HeroSwapProps {
  first: ReactNode
  second: ReactNode
  firstClassName?: string
  secondClassName?: string
  className?: string
  intervalMs?: number
}

/**
 * مستطيلان في صف واحد يتبادلان مكانهما تلقائيًا بحركة ناعمة.
 * على الهاتف يتراصّان عموديًا ويتبادلان الترتيب.
 */
export const HeroSwap = ({
  first,
  second,
  firstClassName,
  secondClassName,
  className = 'grid grid-cols-1 gap-5 lg:grid-cols-5',
  intervalMs = 7000,
}: HeroSwapProps) => {
  const [swapped, setSwapped] = useState(false)

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }
    const timer = window.setInterval(() => setSwapped((s) => !s), intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs])

  const items = swapped
    ? [
        { key: 'second', node: second, className: secondClassName },
        { key: 'first', node: first, className: firstClassName },
      ]
    : [
        { key: 'first', node: first, className: firstClassName },
        { key: 'second', node: second, className: secondClassName },
      ]

  return (
    <div className={className}>
      {items.map((it) => (
        <motion.div
          key={it.key}
          layout
          transition={{ type: 'spring', stiffness: 250, damping: 30 }}
          className={it.className}
        >
          {it.node}
        </motion.div>
      ))}
    </div>
  )
}
