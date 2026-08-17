/**
 * Shared framer-motion fade-up animation variants.
 */

/** Factory — returns props with a configurable delay. Used in dashboard cards. */
export const fadeUp = (delay: number, duration = 0.45) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration, ease: [0.25, 0.1, 0.25, 1] },
})

/** Static — no delay, shorter duration. Used in stat bars and schedule headers. */
export const fadeUpStatic = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: 'easeOut' as const },
}
