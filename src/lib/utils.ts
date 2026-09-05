import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts Eastern-Arabic digits (٠-٩ / ۰-۹) to ASCII (0-9) so that
 * Number()/parseFloat() never produce NaN on Arabic keyboards.
 * Silent-zero bug: Number('١٦٠') === NaN → || 0 → price saved as 0.
 */
export function toAsciiDigits(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return ''
  return String(input)
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
}

/** Safe numeric parse tolerant of Eastern-Arabic digits. */
export function parseNumberSafe(input: string | number | null | undefined): number {
  const n = Number(toAsciiDigits(input))
  return Number.isFinite(n) ? n : 0
}

export function formatTimeAgo(dateInput?: string | Date | null): string {
  if (!dateInput) return ''
  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) return ''
  const diffMs = Date.now() - date.getTime()
  const seconds = Math.floor(diffMs / 1000)
  if (seconds < 60) return 'الآن'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `منذ ${minutes} دقيقة`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `منذ ${hours} ساعة`
  const days = Math.floor(hours / 24)
  if (days < 30) return days === 1 ? 'منذ يوم' : `منذ ${days} يوم`
  const months = Math.floor(days / 30)
  if (months < 12) return months === 1 ? 'منذ شهر' : `منذ ${months} شهر`
  return date.toLocaleDateString('ar-EG', { dateStyle: 'medium' })
}
