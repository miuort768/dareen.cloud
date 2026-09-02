import { useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface CountUpProps {
  value: number
  format?: (n: number) => string
  className?: string
}

export const CountUp = ({ value, format, className }: CountUpProps) => {
  const raw = useMotionValue(0)
  const spring = useSpring(raw, { stiffness: 70, damping: 22 })
  const display = useTransform(spring, (v) => {
    const rounded = Math.round(v)
    return format ? format(rounded) : rounded.toLocaleString('ar-EG')
  })

  useEffect(() => {
    raw.set(value)
  }, [value, raw])

  return <motion.span className={className}>{display}</motion.span>
}
