/** ألوان دلالية موحدة لنسب الحضور — تُستخدم في عرض الأدمن (سطح المكتب + الهاتف) */

export const getRateColor = (rate: number) => {
  if (rate >= 80) return 'text-success'
  if (rate >= 60) return 'text-warning dark:text-primary'
  return 'text-error'
}

export const getRateBg = (rate: number) => {
  if (rate >= 80) return 'bg-success-soft'
  if (rate >= 60) return 'bg-warning-soft dark:bg-primary-soft'
  return 'bg-error-soft'
}

export const getRateBarColor = (rate: number) => {
  if (rate >= 80) return 'bg-success'
  if (rate >= 60) return 'bg-warning dark:bg-primary'
  return 'bg-error'
}
