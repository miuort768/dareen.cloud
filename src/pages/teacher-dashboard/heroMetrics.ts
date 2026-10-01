/**
 * Hero ring metrics for the teacher dashboard.
 *
 * stats.monthTotalSessions counts scheduled+completed rows in the current month,
 * so a month with no sessions at all must render 0 (never NaN) on the ring.
 */

/** Percentage of this month's sessions completed, clamped to 0..100. */
export const monthCompletionPercent = (completed: number, total: number): number => {
  if (!Number.isFinite(completed) || !Number.isFinite(total)) return 0
  if (total <= 0) return 0
  return Math.min(100, Math.max(0, Math.round((completed / total) * 100)))
}

/** Whether the ring has anything meaningful to show. */
export const hasMonthSessions = (total: number): boolean => Number.isFinite(total) && total > 0
