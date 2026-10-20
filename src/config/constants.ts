export const CURRENCY_SYMBOL = 'ج.م'

/** العملات المدعومة في النظام */
export const CURRENCY_OPTIONS = [
  { code: 'EGP', label: 'جنيه مصري', symbol: 'ج.م' },
  { code: 'KWD', label: 'دينار كويتي', symbol: 'د.ك' },
  { code: 'AED', label: 'درهم إماراتي', symbol: 'د.إ' },
  { code: 'SAR', label: 'ريال سعودي', symbol: 'ر.س' },
  { code: 'BHD', label: 'دينار بحريني', symbol: 'د.ب' },
  { code: 'OMR', label: 'ريال عماني', symbol: 'ر.ع' },
  { code: 'JOD', label: 'دينار أردني', symbol: 'د.أ' },
  { code: 'USD', label: 'دولار أمريكي', symbol: '$' },
]

export const CURRENCY_MAP: Record<string, { label: string; symbol: string }> = {
  EGP: { label: 'جنيه مصري', symbol: 'ج.م' },
  KWD: { label: 'دينار كويتي', symbol: 'د.ك' },
  AED: { label: 'درهم إماراتي', symbol: 'د.إ' },
  SAR: { label: 'ريال سعودي', symbol: 'ر.س' },
  BHD: { label: 'دينار بحريني', symbol: 'د.ب' },
  OMR: { label: 'ريال عماني', symbol: 'ر.ع' },
  JOD: { label: 'دينار أردني', symbol: 'د.أ' },
  USD: { label: 'دولار أمريكي', symbol: '$' },
}

export const getCurrencySymbol = (currency?: string | null): string => {
  const code = typeof currency === 'string' ? currency.trim().toUpperCase() : ''
  if (code && CURRENCY_MAP[code]) return CURRENCY_MAP[code].symbol
  return CURRENCY_SYMBOL
}

export const normalizeCurrency = (c: unknown): string => {
  const code = typeof c === 'string' ? c.trim().toUpperCase() : ''
  if (code && CURRENCY_MAP[code]) return code
  return 'EGP'
}
