import { useEffect, useState } from 'react'

export type DeviceWidth = 'mobile' | 'tablet' | 'desktop'

/* متوافقة مع مقاسات Tailwind: md=768 و lg=1024 */
const TABLET_MQ = '(min-width: 768px) and (max-width: 1023px)'
const DESKTOP_MQ = '(min-width: 1024px)'

const getDevice = (): DeviceWidth => {
  if (typeof window === 'undefined') return 'desktop'
  if (window.matchMedia(DESKTOP_MQ).matches) return 'desktop'
  if (window.matchMedia(TABLET_MQ).matches) return 'tablet'
  return 'mobile'
}

/** يحدد نوع الجهاز الحالي (موبايل / تابلت / كمبيوتر) ويستمع لتغيّر المقاس */
export const useDeviceWidth = (): DeviceWidth => {
  const [device, setDevice] = useState<DeviceWidth>(getDevice)

  useEffect(() => {
    const update = () => setDevice(getDevice())
    const tabletMq = window.matchMedia(TABLET_MQ)
    const desktopMq = window.matchMedia(DESKTOP_MQ)
    tabletMq.addEventListener?.('change', update)
    desktopMq.addEventListener?.('change', update)
    window.addEventListener('resize', update)
    return () => {
      tabletMq.removeEventListener?.('change', update)
      desktopMq.removeEventListener?.('change', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return device
}
