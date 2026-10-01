import { describe, it, expect } from 'vitest'
import { monthCompletionPercent, hasMonthSessions } from '../../pages/teacher-dashboard/heroMetrics'

describe('monthCompletionPercent', () => {
  it('computes the percentage for a normal month', () => {
    expect(monthCompletionPercent(15, 30)).toBe(50)
    expect(monthCompletionPercent(0, 10)).toBe(0)
    expect(monthCompletionPercent(10, 10)).toBe(100)
  })

  it('rounds fractional percentages', () => {
    expect(monthCompletionPercent(2, 3)).toBe(67)
    expect(monthCompletionPercent(1, 3)).toBe(33)
  })

  it('returns 0 instead of NaN when the month has no sessions', () => {
    expect(monthCompletionPercent(0, 0)).toBe(0)
    expect(monthCompletionPercent(5, 0)).toBe(0)
    expect(hasMonthSessions(0)).toBe(false)
  })

  it('survives non-numeric input without producing NaN', () => {
    expect(monthCompletionPercent(Number.NaN, 10)).toBe(0)
    expect(monthCompletionPercent(5, Number.NaN)).toBe(0)
    expect(monthCompletionPercent(Number.POSITIVE_INFINITY, 10)).toBe(0)
  })

  it('clamps out-of-range ratios into 0..100', () => {
    expect(monthCompletionPercent(20, 10)).toBe(100)
    expect(monthCompletionPercent(-5, 10)).toBe(0)
  })

  it('reports true when sessions exist', () => {
    expect(hasMonthSessions(12)).toBe(true)
    expect(hasMonthSessions(Number.NaN)).toBe(false)
  })
})
