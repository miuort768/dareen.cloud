import { motion, type Variant } from 'framer-motion'
import type { ReactNode } from 'react'

type AnimationType = 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scaleIn'

interface AnimateOnScrollProps {
  children: ReactNode
  animation?: AnimationType
  delay?: number
  duration?: number
  className?: string
  once?: boolean
}

const variants: Record<AnimationType, { hidden: Variant; visible: Variant }> = {
  fadeUp: {
    hidden: { opacity: 0, y: 30, pointerEvents: 'none' },
    visible: { opacity: 1, y: 0, pointerEvents: 'auto' },
  },
  fadeIn: {
    hidden: { opacity: 0, pointerEvents: 'none' },
    visible: { opacity: 1, pointerEvents: 'auto' },
  },
  slideLeft: {
    hidden: { opacity: 0, x: 40, pointerEvents: 'none' },
    visible: { opacity: 1, x: 0, pointerEvents: 'auto' },
  },
  slideRight: {
    hidden: { opacity: 0, x: -40, pointerEvents: 'none' },
    visible: { opacity: 1, x: 0, pointerEvents: 'auto' },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.95, pointerEvents: 'none' },
    visible: { opacity: 1, scale: 1, pointerEvents: 'auto' },
  },
}

export const AnimateOnScroll = ({
  children,
  animation = 'fadeUp',
  delay = 0,
  duration = 0.5,
  className,
  once = true,
}: AnimateOnScrollProps) => {
  const anim = variants[animation]

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '0px 0px -40px 0px' }}
      variants={anim}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
