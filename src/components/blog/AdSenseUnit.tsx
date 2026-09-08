import { useEffect, useMemo, useRef } from 'react'
import { useSettingsStore } from '../../store/settingsStore'
import { parseLibraryAdsRoot, stripExternalScripts, type AdSenseSlotId } from './adConfig'

/** يضمن تحميل مكتبة أدسنس مرة واحدة فقط بمعرّف الناشر المستخرج من الأكواد الملصوقة */
const ensureAdSenseLoader = (code: string) => {
  if (document.querySelector('script[data-adsense-loader]')) return
  const match = code.match(/client\s*=\s*(ca-pub-[A-Za-z0-9_-]+)/i)
  if (!match) return
  const script = document.createElement('script')
  script.async = true
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${match[1]}`
  script.crossOrigin = 'anonymous'
  script.setAttribute('data-adsense-loader', 'true')
  document.head.appendChild(script)
}

/** يحقن كود الإعلان في الحاوية مع إعادة إنشاء العناصر فعليًا حتى تُنفَّذ <script> الداخلية */
const mountCode = (host: HTMLElement | null, code: string) => {
  if (!host || !code) return
  host.innerHTML = ''
  const template = document.createElement('div')
  template.innerHTML = code
  Array.from(template.childNodes).forEach((node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return
    const el = document.createElement((node as Element).tagName.toLowerCase())
    Array.from((node as Element).attributes).forEach((attr) =>
      el.setAttribute(attr.name, attr.value),
    )
    el.innerHTML = (node as Element).innerHTML
    host.appendChild(el)
  })
  if (!/\.push\s*\(/.test(code)) {
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] }
      w.adsbygoogle = w.adsbygoogle || []
      w.adsbygoogle.push({})
    } catch {
      /* مكتبة أدسنس غير متاحة — تجاهل */
    }
  }
}

/**
 * إعلان جوجل أدسنس في موضع محدد من صفحة المكتبة.
 * كود الكمبيوتر يظهر على md وأعلى وكود الجوال تحتها — نفس نمط AdBanner (الأحجام تختلف).
 * السكربتات الخارجية تُزال من الكود الملصوق والمكتبة تُحمَّل مرة واحدة تلقائيًا.
 */
export const AdSenseUnit = ({ slot, className }: { slot: AdSenseSlotId; className?: string }) => {
  const raw = useSettingsStore((s) => s.libraryAds)
  const desktopHost = useRef<HTMLDivElement>(null)
  const mobileHost = useRef<HTMLDivElement>(null)

  const { desktopCode, mobileCode } = useMemo(() => {
    const ads = parseLibraryAdsRoot(raw).adsense?.[slot]
    return {
      desktopCode: stripExternalScripts(ads?.desktop),
      mobileCode: stripExternalScripts(ads?.mobile),
    }
  }, [raw, slot])

  useEffect(() => {
    if (!desktopCode && !mobileCode) return
    ensureAdSenseLoader(desktopCode || mobileCode)
    mountCode(desktopHost.current, desktopCode)
    mountCode(mobileHost.current, mobileCode)
  }, [desktopCode, mobileCode])

  if (!desktopCode && !mobileCode) return null

  const frame =
    'overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-1 lg:rounded-none'

  return (
    <div className={className}>
      {mobileCode && (
        <div className={`${frame} md:hidden`}>
          <div ref={mobileHost} className="w-full text-center" />
        </div>
      )}
      {desktopCode && (
        <div className={`${frame} hidden md:block`}>
          <div ref={desktopHost} className="w-full text-center" />
        </div>
      )}
    </div>
  )
}
