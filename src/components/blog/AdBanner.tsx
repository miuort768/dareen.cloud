import { Image } from '../../shared/components/ui'
import { useSettingsStore } from '../../store/settingsStore'
import { parseLibraryAds, normalizeAdUrl, type LibraryAdSlotId } from './adConfig'

interface AdBannerProps {
  slot: LibraryAdSlotId
  variant?: 'both' | 'desktop'
  className?: string
}

export const AdBanner = ({ slot, variant = 'both', className }: AdBannerProps) => {
  const ads = parseLibraryAds(useSettingsStore((s) => s.libraryAds))
  const ad = ads[slot]
  if (!ad) return null

  const desktopUrl = normalizeAdUrl(ad.desktop)
  const mobileUrl = normalizeAdUrl(ad.mobile) || desktopUrl
  const linkUrl = normalizeAdUrl(ad.link)

  const linkProps = linkUrl
    ? ({ href: linkUrl, target: '_blank', rel: 'sponsored noopener noreferrer' } as const)
    : {}

  const showMobile = variant === 'both' && !!mobileUrl
  const showDesktop = !!desktopUrl

  if (!showMobile && !showDesktop) return null

  return (
    <div className={className}>
      {showMobile && (
        <a
          {...linkProps}
          aria-label="إعلان"
          className="block overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-1 transition-shadow duration-300 hover:shadow-elevation-2 md:hidden"
        >
          <div className="aspect-[16/10] w-full">
            <Image
              src={mobileUrl}
              alt="إعلان"
              className="h-full w-full"
              imgClassName="object-cover"
              withSkeleton
              loading="lazy"
            />
          </div>
        </a>
      )}
      {showDesktop && (
        <a
          {...linkProps}
          aria-label="إعلان"
          className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-1 transition-shadow duration-300 hover:shadow-elevation-2 md:block"
        >
          <div className="h-36 w-full lg:h-44">
            <Image
              src={desktopUrl}
              alt="إعلان"
              className="h-full w-full"
              imgClassName="object-cover"
              withSkeleton
              loading="lazy"
            />
          </div>
        </a>
      )}
    </div>
  )
}
