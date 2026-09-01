export const CURRENCY_SYMBOL = 'ج.م'
export const SITE_URL = 'https://dareen.cloud'

/** عملة النظام الموحدة: الجنيه المصري فقط — لا توجد عملات أخرى */
export const CURRENCY_OPTIONS = [{ code: 'EGP', label: 'جنيه مصري', symbol: 'ج.م' }]

export const CURRENCY_MAP: Record<string, string> = Object.fromEntries(
  CURRENCY_OPTIONS.map((c) => [c.code, c.symbol]),
)

/** أي عملة قديمة مخزنة (KWD/SAR/USD...) تُعرض بالجنيه المصري — العملة الموحدة للنظام */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getCurrencySymbol = (_currency?: string | null): string => CURRENCY_SYMBOL
