import type { PeriodFilter } from '../components/AttendanceFilters'

/** يحسب نطاق التاريخ (بداية/نهاية بصيغة en-CA) لفلتر الفترة المحدد */
export const getPeriodRange = (
  date: string,
  periodFilter: PeriodFilter,
  customStart?: string,
  customEnd?: string,
): { start: string; end: string } => {
  const d = new Date(date)
  switch (periodFilter) {
    case 'today':
      return { start: date, end: date }
    case 'week': {
      const day = d.getDay()
      const diff = day === 0 ? 6 : day - 1
      const mon = new Date(d)
      mon.setDate(d.getDate() - diff)
      const sun = new Date(d)
      sun.setDate(mon.getDate() + 6)
      return {
        start: mon.toLocaleDateString('en-CA'),
        end: sun.toLocaleDateString('en-CA'),
      }
    }
    case 'month':
      return {
        start: new Date(d.getFullYear(), d.getMonth(), 1).toLocaleDateString('en-CA'),
        end: new Date(d.getFullYear(), d.getMonth() + 1, 0).toLocaleDateString('en-CA'),
      }
    case 'custom':
      return { start: customStart || date, end: customEnd || date }
    default:
      return { start: date, end: date }
  }
}

/** تسمية عربية للفترة المحددة */
export const getPeriodLabel = (periodFilter: PeriodFilter): string => {
  switch (periodFilter) {
    case 'today':
      return 'اليوم'
    case 'week':
      return 'الأسبوع'
    case 'month':
      return 'الشهر'
    case 'custom':
      return 'الفترة'
    default:
      return 'اليوم'
  }
}
