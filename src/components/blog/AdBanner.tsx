import { Image } from '../../shared/components/ui'
import { useSettingsStore } from '../../store/settingsStore'

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

interface AdBannerProps {
  slot: LibraryAdSlotId
  variant?: 'both' | 'desktop'
  className?: string
}

export const AdBanner = ({ slot, variant = 'both', className }: AdBannerProps) => {
  const ads = parseLibraryAds(useSettingsStore((s) => s.libraryAds))
  const ad = ads[slot]
  if (!ad) return null

  const linkProps = ad.link
    ? ({ href: ad.link, target: '_blank', rel: 'sponsored noopener noreferrer' } as const)
    : {}

  const showMobile = variant === 'both' && !!ad.mobile
  const showDesktop = !!ad.desktop

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
              src={ad.mobile!}
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
              src={ad.desktop!}
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
