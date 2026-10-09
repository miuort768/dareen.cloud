import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '../../../lib/utils'

interface CelebrationBurstProps {
  count?: number
  className?: string
}

const COLORS = ['bg-primary', 'bg-warning', 'bg-success', 'bg-info', 'bg-error', 'bg-accent']

interface Particle {
  id: number
  color: string
  x: number
  y: number
  rotate: number
  delay: number
  size: number
}

export const CelebrationBurst = ({ count = 28, className }: CelebrationBurstProps) => {
  const reduced = useReducedMotion()

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6
      const distance = 70 + Math.random() * 100
      return {
        id: i,
        color: COLORS[i % COLORS.length] ?? 'bg-primary',
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 40,
        rotate: (Math.random() - 0.5) * 340,
        delay: Math.random() * 0.18,
        size: 6 + Math.round(Math.random() * 6),
      }
    })
  }, [count])

  if (reduced) return null

  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      aria-hidden="true"
    >
      <div className="absolute start-1/2 top-1/2">
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className={cn('absolute rounded-sm', p.color)}
            style={{ width: p.size, height: p.size }}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0.4, rotate: 0 }}
            animate={{ opacity: [0, 1, 1, 0], x: p.x, y: p.y, scale: 1, rotate: p.rotate }}
            transition={{ duration: 1.35, delay: p.delay, ease: 'easeOut' }}
          />
        ))}
      </div>
    </div>
  )
}
