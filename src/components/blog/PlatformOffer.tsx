import { Image } from '../../shared/components/ui'
import { useSettingsStore } from '../../store/settingsStore'
import { parseLibraryAdsRoot, normalizeAdUrl, type PlatformOffer } from './adConfig'
import { useDeviceWidth } from '../../shared/hooks/useDeviceWidth'
import { cn } from '../../lib/utils'

/** يختار رابط العرض المناسب للجهاز الحالي مع fallback (تابلت ← كمبيوتر، هاتف ← هاتف ثم كمبيوتر) */
const pickOfferLink = (offer: PlatformOffer, device: 'mobile' | 'tablet' | 'desktop'): string => {
  if (device === 'mobile') return normalizeAdUrl(offer.linkMobile || offer.linkDesktop)
  if (device === 'tablet') return normalizeAdUrl(offer.linkTablet || offer.linkDesktop)
  return normalizeAdUrl(offer.linkDesktop)
}

/**
 * بطاقة عرض المنصة — صورة قابلة للنقر تفتح الرابط المناسب للجهاز.
 * تظهر في 3 مواضع مشتركة: تحت الملفات الأكثر قراءة، تحت اختيار الفصل الدراسي، وتحت اختيار المادة.
 */
export const PlatformOffer = ({ className }: { className?: string }) => {
  const raw = useSettingsStore((s) => s.libraryAds)
  const device = useDeviceWidth()
  const offer = parseLibraryAdsRoot(raw).offers

  if (!offer) return null

  const imageUrl = normalizeAdUrl(
    device === 'mobile' ? offer.imageMobile || offer.imageDesktop : offer.imageDesktop,
  )
  const linkUrl = pickOfferLink(offer, device)
  if (!imageUrl || !linkUrl) return null

  return (
    <a
      href={linkUrl}
      target="_blank"
      rel="sponsored noopener noreferrer"
      aria-label="عرض المنصة"
      className={cn(
        'block overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-1 transition-shadow duration-300 hover:shadow-elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 lg:rounded-none',
        className,
      )}
    >
      <div className="h-28 w-full sm:h-36 lg:h-40">
        <Image
          src={imageUrl}
          alt="عرض المنصة"
          className="h-full w-full"
          imgClassName="object-cover"
          withSkeleton
          loading="lazy"
        />
      </div>
    </a>
  )
}
