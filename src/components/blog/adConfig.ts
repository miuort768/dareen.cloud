export type LibraryAdSlotId = 'belowSearch' | 'belowTypesHero' | 'belowSelectionHero'

export interface LibraryAdSlot {
  desktop?: string
  mobile?: string
  link?: string
}

export interface LibraryAds {
  belowSearch?: LibraryAdSlot
  belowTypesHero?: LibraryAdSlot
  belowSelectionHero?: LibraryAdSlot
}

export const parseLibraryAds = (raw: string | undefined): LibraryAds => {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as LibraryAds) : {}
  } catch {
    return {}
  }
}

/** يضمن وجود scheme — روابط بدون https:// تُعامل كمسارات داخلية وتفشل */
export const normalizeAdUrl = (url?: string): string => {
  const t = (url || '').trim()
  if (!t) return ''
  if (/^(https?:\/\/|data:image\/)/i.test(t)) return t
  return `https://${t}`
}
