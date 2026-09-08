/* إعدادات إعلانات المكتبة (/books) — مخزّنة في SystemSetting key=library_ads */

/* ===== الإعلانات الخارجية (صور) ===== */

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

/* ===== إعلانات جوجل أدسنس (أكواد) ===== */

export type AdSenseSlotId =
  'belowSearch' | 'belowSelectionHero' | 'belowLanguageHero' | 'belowMoreArticles'

export interface AdSenseSlot {
  desktop?: string
  mobile?: string
}

export interface AdSenseAds {
  belowSearch?: AdSenseSlot
  belowSelectionHero?: AdSenseSlot
  belowLanguageHero?: AdSenseSlot
  belowMoreArticles?: AdSenseSlot
}

/* ===== عروض المنصة (صورة + رابط لكل جهاز) ===== */

export interface PlatformOffer {
  imageDesktop?: string
  imageMobile?: string
  linkDesktop?: string
  linkTablet?: string
  linkMobile?: string
}

/* ===== الحاوية الكاملة ===== */

export interface LibraryAdsRoot {
  external?: LibraryAds
  adsense?: AdSenseAds
  offers?: PlatformOffer
}

/** شكل التخزين القديم (إعلانات خارجية على المستوى الجذر) — للتوافق الخلفي */
export type LegacyLibraryAds = LibraryAds & {
  external?: unknown
  adsense?: unknown
  offers?: unknown
}

/* ===== Parsing ===== */

const isRecord = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v)

const asStringRecord = (v: unknown): Record<string, string | undefined> => {
  if (!isRecord(v)) return {}
  const out: Record<string, string | undefined> = {}
  Object.entries(v).forEach(([k, val]) => {
    if (typeof val === 'string') out[k] = val
  })
  return out
}

/** يفك JSON إعلانات المكتبة ويتعامل مع الشكل القديم (خارجي على الجذر) والجديد (external/adsense/offers) */
export const parseLibraryAdsRoot = (raw: string | undefined): LibraryAdsRoot => {
  if (!raw) return {}
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return {}
    const p = parsed as LegacyLibraryAds
    // الشكل القديم: مفاتيح المواضع كانت على الجذر مباشرة
    const isLegacy = !isRecord(p.external) && !isRecord(p.adsense) && !isRecord(p.offers)
    if (isLegacy) {
      return {
        external: {
          belowSearch: asStringRecord(p.belowSearch) as LibraryAdSlot,
          belowTypesHero: asStringRecord(p.belowTypesHero) as LibraryAdSlot,
          belowSelectionHero: asStringRecord(p.belowSelectionHero) as LibraryAdSlot,
        },
      }
    }
    return {
      external: isRecord(p.external) ? (p.external as LibraryAds) : undefined,
      adsense: isRecord(p.adsense) ? (p.adsense as AdSenseAds) : undefined,
      offers: isRecord(p.offers) ? (p.offers as PlatformOffer) : undefined,
    }
  } catch {
    return {}
  }
}

/** توافق خلفي — يرجع الإعلانات الخارجية فقط */
export const parseLibraryAds = (raw: string | undefined): LibraryAds =>
  parseLibraryAdsRoot(raw).external ?? {}

/** يضمن وجود scheme — روابط بدون https:// تُعامل كمسارات داخلية وتفشل */
export const normalizeAdUrl = (url?: string): string => {
  const t = (url || '').trim()
  if (!t) return ''
  if (/^(https?:\/\/|data:image\/)/i.test(t)) return t
  return `https://${t}`
}

/* ===== أدسنس: مساعدات ===== */

/** يزيل أي وسوم <script> خارجية من الكود الملصوق (نمنع استدعاء مكتبة أدسنس يدويًا — الحقن في index.html مسؤول عنها) */
export const stripExternalScripts = (code?: string): string =>
  (code || '').replace(/<script\b[^>]*src\s*=[^>]*>[\s\S]*?<\/script>/gi, '').trim()

/** هل يبدو النص ككود إعلان أدسنس؟ (فحص تحذيري فقط — لا يمنع الحفظ) */
export const looksLikeAdCode = (code?: string): boolean => {
  const t = (code || '').trim()
  if (!t) return true
  return /<ins\b|adsbygoogle|<iframe\b/i.test(t)
}

/** أبعاد مقترحة لكل موضع أدسنس — للعرض في صفحة المعلنين */
export const ADSENSE_SLOT_META: Record<
  AdSenseSlotId,
  { title: string; desc: string; desktopOnly?: boolean }
> = {
  belowSearch: {
    title: 'تحت حقل البحث',
    desc: 'أسفل حقل البحث في الصفحة الرئيسية للمكتبة على الكمبيوتر',
    desktopOnly: true,
  },
  belowSelectionHero: {
    title: 'تحت هيرو اختار المنهج والمرحلة',
    desc: 'أسفل شاشتي «اختر المنهج» و«اختر المرحلة» على الهاتف والكمبيوتر',
  },
  belowLanguageHero: {
    title: 'تحت هيرو اختار اللغة',
    desc: 'أسفل شاشة «اختر اللغة» على الهاتف والكمبيوتر',
  },
  belowMoreArticles: {
    title: 'تحت أول 3 مقالات في قسم المزيد',
    desc: 'بين نتائج قسم «المزيد» — يظهر بعد البطاقة الثالثة مباشرة',
  },
}
