export const CURRENCY_SYMBOL = 'ج.م'
export const SITE_URL = 'https://dareen.cloud'

export const CURRENCY_OPTIONS = [
  { code: 'EGP', label: 'جنيه مصري', symbol: 'ج.م' },
  { code: 'SAR', label: 'ريال سعودي', symbol: 'ر.س' },
  { code: 'QAR', label: 'ريال قطري', symbol: 'ر.ق' },
  { code: 'KWD', label: 'دينار كويتي', symbol: 'د.ك' },
  { code: 'AED', label: 'درهم إماراتي', symbol: 'د.إ' },
  { code: 'BHD', label: 'دينار بحريني', symbol: 'د.ب' },
  { code: 'OMR', label: 'ريال عماني', symbol: 'ر.ع' },
  { code: 'USD', label: 'دولار أمريكي', symbol: '$' },
  { code: 'GBP', label: 'جنيه استرليني', symbol: '£' },
]

export const CURRENCY_MAP: Record<string, string> = Object.fromEntries(
  CURRENCY_OPTIONS.map((c) => [c.code, c.symbol]),
)

export const getCurrencySymbol = (currency?: string | null): string => {
  if (!currency) return CURRENCY_SYMBOL
  return CURRENCY_MAP[currency] || currency
}
