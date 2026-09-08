import { useEffect, useState } from 'react'
import {
  Megaphone,
  Monitor,
  Smartphone,
  Tablet,
  Link2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  ExternalLink,
  Code2,
  BadgePercent,
  Globe2,
} from 'lucide-react'
import { Image, PageHeader, Tabs } from '../shared/components/ui'
import type { Tab } from '../shared/components/ui/Tabs'
import { useAcademyName } from '../context/AppContext'
import { useSettingsStore } from '../store/settingsStore'
import {
  parseLibraryAdsRoot,
  normalizeAdUrl,
  looksLikeAdCode,
  ADSENSE_SLOT_META,
  type LibraryAdSlot,
  type LibraryAds,
  type LibraryAdSlotId,
  type AdSenseSlotId,
  type AdSenseAds,
  type PlatformOffer,
} from '../components/blog/adConfig'
import { cn } from '../lib/utils'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

type AdTabId = 'adsense' | 'offers' | 'external'

const AD_TABS: Tab[] = [
  { value: 'adsense', label: 'ط¬ظˆط¬ظ„ ط£ط¯ط³ظ†ط³', icon: <Code2 size={15} /> },
  { value: 'offers', label: 'ط¹ط±ظˆط¶ ط§ظ„ظ…ظ†طµط©', icon: <BadgePercent size={15} /> },
  { value: 'external', label: 'ط®ط§ط±ط¬ظٹط©', icon: <Globe2 size={15} /> },
]

/* ================= ط§ظ„ط­ظ‚ظˆظ„ ط§ظ„ط£ط³ط§ط³ظٹط© ================= */

const emptySlot = (): LibraryAdSlot => ({ desktop: '', mobile: '', link: '' })

const FieldLabel = ({
  icon: Icon,
  children,
}: {
  icon: typeof Monitor
  children: React.ReactNode
}) => (
  <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-black text-main">
    <Icon size={12} className="text-primary" />
    {children}
  </span>
)

const inputClass =
  'w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-xs text-main outline-none transition-all placeholder:text-muted focus:border-primary focus-visible:ring-2 focus-visible:ring-focus'

const UrlField = ({
  label,
  icon,
  value,
  onChange,
  placeholder,
}: {
  label: string
  icon: typeof Monitor
  value: string
  onChange: (v: string) => void
  placeholder: string
}) => (
  <label className="block">
    <FieldLabel icon={icon}>{label}</FieldLabel>
    <input
      type="text"
      dir="ltr"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputClass}
    />
  </label>
)

const SlotPreview = ({ url, tall }: { url: string; tall?: boolean }) => {
  const normalized = normalizeAdUrl(url)
  if (!normalized) return null
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-card shadow-elevation-1',
        tall ? 'aspect-[16/10] w-full max-w-[280px]' : 'h-24 w-full',
      )}
    >
      <Image
        src={normalized}
        alt="ظ…ط¹ط§ظٹظ†ط© ط§ظ„ط¥ط¹ظ„ط§ظ†"
        className="h-full w-full"
        imgClassName="object-cover"
        withSkeleton
      />
    </div>
  )
}

/* ================= ط±ط£ط³ ط¨ط·ط§ظ‚ط© ظ…ظˆط¶ط¹ ================= */

const SlotCard = ({
  title,
  desc,
  icon,
  tone,
  children,
}: {
  title: string
  desc: string
  icon: React.ReactNode
  tone: string
  children: React.ReactNode
}) => (
  <section
    aria-label={title}
    className="rounded-2xl border border-border bg-card p-4 shadow-elevation-1 sm:p-5 md:p-6"
  >
    <div className="mb-4 flex items-center gap-2.5">
      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', tone)}>
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-black text-main">{title}</h3>
        <p className="text-[11px] font-bold text-muted">{desc}</p>
      </div>
    </div>
    {children}
  </section>
)

/* ================= طھطµظ†ظٹظپ 1: ط¬ظˆط¬ظ„ ط£ط¯ط³ظ†ط³ ================= */

const AdSenseSlotEditor = ({
  slotId,
  code,
  onChange,
}: {
  slotId: AdSenseSlotId
  code: { desktop?: string; mobile?: string }
  onChange: (patch: { desktop?: string; mobile?: string }) => void
}) => {
  const meta = ADSENSE_SLOT_META[slotId]
  const [showWarning, setShowWarning] = useState(false)
  const desktopCode = code.desktop ?? ''
  const mobileCode = code.mobile ?? ''
  const suspicious =
    (!looksLikeAdCode(desktopCode) && !!desktopCode.trim()) ||
    (!looksLikeAdCode(mobileCode) && !!mobileCode.trim())

  useEffect(() => {
    if (suspicious) {
      setShowWarning(true)
      const t = setTimeout(() => setShowWarning(false), 6000)
      return () => clearTimeout(t)
    }
  }, [suspicious])

  return (
    <SlotCard
      title={meta.title}
      desc={meta.desc}
      tone="bg-primary-soft"
      icon={<Code2 size={15} className="text-primary" />}
    >
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <label className="block">
            <FieldLabel icon={Monitor}>ظƒظˆط¯ ط¥ط¹ظ„ط§ظ† ط§ظ„ظƒظ…ط¨ظٹظˆطھط±</FieldLabel>
            <textarea
              dir="ltr"
              rows={5}
              value={desktopCode}
              onChange={(e) => onChange({ desktop: e.target.value })}
              placeholder={'<ins class="adsbygoogle" ...></ins>'}
              className={cn(inputClass, 'resize-y font-mono leading-relaxed')}
            />
          </label>
          {!meta.desktopOnly && (
            <label className="block">
              <FieldLabel icon={Smartphone}>ظƒظˆط¯ ط¥ط¹ظ„ط§ظ† ط§ظ„ط¬ظˆط§ظ„</FieldLabel>
              <textarea
                dir="ltr"
                rows={5}
                value={mobileCode}
                onChange={(e) => onChange({ mobile: e.target.value })}
                placeholder={'<ins class="adsbygoogle" ...></ins>'}
                className={cn(inputClass, 'resize-y font-mono leading-relaxed')}
              />
            </label>
          )}
        </div>
        <div className="space-y-2.5">
          <div className="rounded-xl border border-dashed border-border bg-surface p-3.5">
            <p className="text-[10px] font-bold leading-relaxed text-muted">
              ط§ظ„طµظ‚ ظƒظˆط¯ ظˆط­ط¯ط© ط£ط¯ط³ظ†ط³ ظƒط§ظ…ظ„ظ‹ط§ ظƒظ…ط§ ظ†ط³ط®طھظ‡ ظ…ظ† ظ„ظˆط­ط©
              طھط­ظƒظ… ط¬ظˆط¬ظ„.
              {meta.desktopOnly
                ? ' ظ‡ط°ط§ ط§ظ„ظ…ظˆط¶ط¹ ظٹط¸ظ‡ط± ط¹ظ„ظ‰ ط§ظ„ظƒظ…ط¨ظٹظˆطھط± ظپظ‚ط·.'
                : ' ط£ط¶ظپ ظƒظˆط¯ظ‹ط§ ظ…ظ†ظپطµظ„ظ‹ط§ ظ„ظ„ط¬ظˆط§ظ„ â€” ط£ط­ط¬ط§ظ… ط§ظ„ط¥ط¹ظ„ط§ظ†ط§طھ طھط®طھظ„ظپ ط¨ظٹظ† ط§ظ„ط£ط¬ظ‡ط²ط©.'}
            </p>
          </div>
          {showWarning && (
            <div className="border-warning/30 flex items-start gap-2 rounded-xl border bg-warning-soft p-3">
              <AlertTriangle size={14} className="mt-0.5 shrink-0 text-warning" />
              <p className="text-[10px] font-bold leading-relaxed text-warning">
                ط§ظ„ظ†طµ ط§ظ„ظ…ظ„طµظˆظ‚ ظ„ط§ ظٹط¨ط¯ظˆ ظƒظƒظˆط¯ ط£ط¯ط³ظ†ط³ (ظٹظ†ظ‚طµظ‡ &lt;ins&gt;
                ط£ظˆ adsbygoogle) â€” طھط£ظƒط¯ ظ‚ط¨ظ„ ط§ظ„ط­ظپط¸.
              </p>
            </div>
          )}
          {(desktopCode.trim() || mobileCode.trim()) && (
            <p className="text-[10px] font-bold text-muted">
              {(desktopCode + mobileCode).length} ط­ط±ظپ
            </p>
          )}
        </div>
      </div>
    </SlotCard>
  )
}

/* ================= طھطµظ†ظٹظپ 2: ط¹ط±ظˆط¶ ط§ظ„ظ…ظ†طµط© ================= */

const OfferEditor = ({
  offer,
  onChange,
}: {
  offer: PlatformOffer
  onChange: (patch: Partial<PlatformOffer>) => void
}) => (
  <SlotCard
    title="طµظˆط±ط© ط§ظ„ط¹ط±ط¶ ظˆط§ظ„ط±ظˆط§ط¨ط·"
    desc="طھط¸ظ‡ط± ظپظٹ 3 ظ…ظˆط§ط¶ط¹: طھط­طھ ط§ظ„ظ…ظ„ظپط§طھ ط§ظ„ط£ظƒط«ط± ظ‚ط±ط§ط،ط© آ· طھط­طھ ط§ط®طھظٹط§ط± ط§ظ„ظپطµظ„ ط§ظ„ط¯ط±ط§ط³ظٹ آ· طھط­طھ ط§ط®طھظٹط§ط± ط§ظ„ظ…ط§ط¯ط©"
    tone="bg-success-soft"
    icon={<BadgePercent size={15} className="text-success" />}
  >
    <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
      <div className="space-y-3">
        <UrlField
          label="ط±ط§ط¨ط· طµظˆط±ط© ط§ظ„ظƒظ…ط¨ظٹظˆطھط± ظˆط§ظ„طھط§ط¨ظ„طھ"
          icon={Monitor}
          value={offer.imageDesktop ?? ''}
          onChange={(v) => onChange({ imageDesktop: v })}
          placeholder="https://example.com/offer-desktop.jpg"
        />
        <UrlField
          label="ط±ط§ط¨ط· طµظˆط±ط© ط§ظ„ظ‡ط§طھظپ (ط§ط®طھظٹط§ط±ظٹ)"
          icon={Smartphone}
          value={offer.imageMobile ?? ''}
          onChange={(v) => onChange({ imageMobile: v })}
          placeholder="https://example.com/offer-mobile.jpg"
        />
        <SlotPreview url={offer.imageDesktop ?? ''} />
        {offer.imageMobile?.trim() && <SlotPreview url={offer.imageMobile} tall />}
      </div>
      <div className="space-y-3">
        <UrlField
          label="ط±ط§ط¨ط· ط§ظ„ظƒظ…ط¨ظٹظˆطھط±"
          icon={Link2}
          value={offer.linkDesktop ?? ''}
          onChange={(v) => onChange({ linkDesktop: v })}
          placeholder="https://example.com/offer"
        />
        <UrlField
          label="ط±ط§ط¨ط· ط§ظ„طھط§ط¨ظ„طھ"
          icon={Tablet}
          value={offer.linkTablet ?? ''}
          onChange={(v) => onChange({ linkTablet: v })}
          placeholder="https://example.com/offer-tablet"
        />
        <UrlField
          label="ط±ط§ط¨ط· ط§ظ„ظ‡ط§طھظپ"
          icon={Smartphone}
          value={offer.linkMobile ?? ''}
          onChange={(v) => onChange({ linkMobile: v })}
          placeholder="https://example.com/offer-mobile"
        />
        <p className="text-[10px] font-bold leading-relaxed text-muted">
          ط¹ظ†ط¯ ط§ظ„ط¶ط؛ط· ط¹ظ„ظ‰ طµظˆط±ط© ط§ظ„ط¹ط±ط¶ ظٹظڈظپطھط­ ط±ط§ط¨ط· ط§ظ„ط¬ظ‡ط§ط²
          ط§ظ„ظ…ظ†ط§ط³ط¨ â€” ط§ظ„طھط§ط¨ظ„طھ ظٹط±ط¬ط¹ ظ„ط±ط§ط¨ط· ط§ظ„ظƒظ…ط¨ظٹظˆطھط± طھظ„ظ‚ط§ط¦ظٹظ‹ط§
          ط¥ظ† طھظڈط±ظƒ ظپط§ط±ط؛ظ‹ط§.
        </p>
      </div>
    </div>
  </SlotCard>
)

/* ================= طھطµظ†ظٹظپ 3: ط§ظ„ط¥ط¹ظ„ط§ظ†ط§طھ ط§ظ„ط®ط§ط±ط¬ظٹط© ================= */

interface ExternalSlotConfig {
  id: LibraryAdSlotId
  title: string
  desc: string
  withMobile: boolean
  desktopHint: string
  mobileHint?: string
}

const EXTERNAL_SLOTS: ExternalSlotConfig[] = [
  {
    id: 'belowSearch',
    title: 'طھط­طھ ط­ظ‚ظ„ ط§ظ„ط¨ط­ط«',
    desc: 'ط´ط±ظٹط· ط¥ط¹ظ„ط§ظ†ظٹ ط¹ط±ظٹط¶ ط£ط³ظپظ„ ط­ظ‚ظ„ ط§ظ„ط¨ط­ط« ظپظٹ ط§ظ„طµظپط­ط© ط§ظ„ط±ط¦ظٹط³ظٹط© ظ„ظ„ظ…ظƒطھط¨ط©',
    withMobile: false,
    desktopHint: 'ط§ظ„ط£ط¨ط¹ط§ط¯ ط§ظ„ظ…ظ‚طھط±ط­ط©: ظ،ظ¦ظ ظ أ—ظ£ظ¦ظ  (ط¹ط±ظٹط¶)',
  },
  {
    id: 'belowTypesHero',
    title: 'طھط­طھ ظ‡ظٹط±ظˆ ط§ظ„ظ…ظƒطھط¨ط© ط§ظ„ط±ط¦ظٹط³ظٹ',
    desc: 'ط£ط³ظپظ„ ط§ظ„ط¹ظ†ظˆط§ظ† ط§ظ„ط±ط¦ظٹط³ظٹ ط¹ظ„ظ‰ ط§ظ„ظƒظ…ط¨ظٹظˆطھط± ظˆط£ط³ظپظ„ ط¨ط§ظ†ط± ط§ظ„طھط±ط­ظٹط¨ ط¹ظ„ظ‰ ط§ظ„ظ‡ط§طھظپ',
    withMobile: true,
    desktopHint: 'ط§ظ„ط£ط¨ط¹ط§ط¯ ط§ظ„ظ…ظ‚طھط±ط­ط©: ظ،ظ¦ظ ظ أ—ظ£ظ¦ظ  (ط¹ط±ظٹط¶)',
    mobileHint: 'ط§ظ„ط£ط¨ط¹ط§ط¯ ط§ظ„ظ…ظ‚طھط±ط­ط©: ظ¨ظ ظ أ—ظ¥ظ ظ  (ط¹ظ…ظˆط¯ظٹ)',
  },
  {
    id: 'belowSelectionHero',
    title: 'طھط­طھ ط¨ط§ظ†ط± آ«ط§ط®طھط± ط§ظ„ظ…ظ†ظ‡ط¬ / ط§ظ„ظ…ط±ط­ظ„ط©آ»',
    desc: 'ط£ط³ظپظ„ ط´ط§ط´ط§طھ ط§ط®طھظٹط§ط± ط§ظ„ظ…ظ†ظ‡ط¬ ظˆط§ظ„ظ…ط±ط­ظ„ط© ظˆط§ظ„ظ„ط؛ط© ط¹ظ„ظ‰ ط§ظ„ظ‡ط§طھظپ ظˆط§ظ„ظƒظ…ط¨ظٹظˆطھط±',
    withMobile: true,
    desktopHint: 'ط§ظ„ط£ط¨ط¹ط§ط¯ ط§ظ„ظ…ظ‚طھط±ط­ط©: ظ،ظ¦ظ ظ أ—ظ£ظ¦ظ  (ط¹ط±ظٹط¶)',
    mobileHint: 'ط§ظ„ط£ط¨ط¹ط§ط¯ ط§ظ„ظ…ظ‚طھط±ط­ط©: ظ¨ظ ظ أ—ظ¥ظ ظ  (ط¹ظ…ظˆط¯ظٹ)',
  },
]

const ExternalSlotEditor = ({
  slot,
  data,
  onChange,
}: {
  slot: ExternalSlotConfig
  data: LibraryAdSlot
  onChange: (patch: Partial<LibraryAdSlot>) => void
}) => (
  <SlotCard
    title={slot.title}
    desc={slot.desc}
    tone="bg-info-soft"
    icon={<Globe2 size={15} className="text-info" />}
  >
    <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
      <div className="space-y-3">
        <UrlField
          label="ط±ط§ط¨ط· طµظˆط±ط© ط§ظ„ظƒظ…ط¨ظٹظˆطھط±"
          icon={Monitor}
          value={data.desktop ?? ''}
          onChange={(v) => onChange({ desktop: v })}
          placeholder="https://example.com/ad-desktop.jpg"
        />
        {slot.withMobile && (
          <UrlField
            label="ط±ط§ط¨ط· طµظˆط±ط© ط§ظ„ظ‡ط§طھظپ"
            icon={Smartphone}
            value={data.mobile ?? ''}
            onChange={(v) => onChange({ mobile: v })}
            placeholder="https://example.com/ad-mobile.jpg"
          />
        )}
        <UrlField
          label="ط±ط§ط¨ط· ط§ظ„ط¥ط¹ظ„ط§ظ† ط¹ظ†ط¯ ط§ظ„ظ†ظ‚ط± (ط§ط®طھظٹط§ط±ظٹ)"
          icon={Link2}
          value={data.link ?? ''}
          onChange={(v) => onChange({ link: v })}
          placeholder="https://example.com"
        />
      </div>
      <div className="space-y-2.5">
        <SlotPreview url={data.desktop ?? ''} />
        {slot.withMobile && <SlotPreview url={data.mobile ?? ''} tall />}
        <p className="text-[10px] font-bold leading-relaxed text-muted">
          {slot.desktopHint}
          {slot.mobileHint ? ` آ· ${slot.mobileHint}` : ''}
        </p>
      </div>
    </div>
  </SlotCard>
)

/* ================= ط±ط£ط³ ط§ظ„طھطµظ†ظٹظپ ================= */

const SectionHeading = ({
  icon: Icon,
  title,
  sub,
  tone,
}: {
  icon: typeof Code2
  title: string
  sub: string
  tone: string
}) => (
  <div className="flex items-center gap-2.5 pt-1">
    <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', tone)}>
      <Icon size={20} />
    </div>
    <div>
      <h2 className="text-sm font-black text-main sm:text-base">{title}</h2>
      <p className="text-[11px] font-bold text-muted">{sub}</p>
    </div>
  </div>
)

/* ================= ط§ظ„طµظپط­ط© ================= */

export const Advertisers = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `ط§ظ„ظ…ط¹ظ„ظ†ظˆظ† | ${academyName}`
  }, [academyName])

  const libraryAds = useSettingsStore((s) => s.libraryAds)
  const setSetting = useSettingsStore((s) => s.setSetting)

  const parse = (raw: string | undefined) => {
    const root = parseLibraryAdsRoot(raw)
    return {
      external: (root.external ?? {}) as LibraryAds,
      adsense: (root.adsense ?? {}) as AdSenseAds,
      offers: root.offers ?? {},
    }
  }

  const [ads, setAds] = useState(parse(libraryAds))
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [activeTab, setActiveTab] = useState<AdTabId>('adsense')

  // ط¹ط¯ط¯ ط§ظ„ظ…ظˆط§ط¶ط¹ ط§ظ„ظ…ط¹ط¨ط£ط© ظ„ظƒظ„ طھطµظ†ظٹظپ â€” ط´ط§ط±ط© ط¹ظ„ظ‰ ط§ظ„طھط¨ظˆظٹط¨
  const counts = {
    adsense: (Object.keys(ADSENSE_SLOT_META) as AdSenseSlotId[]).filter(
      (id) => ads.adsense[id]?.desktop?.trim() || ads.adsense[id]?.mobile?.trim(),
    ).length,
    offers: ads.offers.imageDesktop?.trim() || ads.offers.imageMobile?.trim() ? 1 : 0,
    external: (Object.keys(ads.external) as LibraryAdSlotId[]).filter(
      (id) => ads.external[id]?.desktop?.trim() || ads.external[id]?.mobile?.trim(),
    ).length,
  }
  const filledCount = counts[activeTab]

  // ظ…ط²ط§ظ…ظ†ط© ظ…ط¹ ط§ظ„ظ€ store â€” ط¥ط°ط§ ظˆطµظ„طھ ط§ظ„ط¥ط¹ط¯ط§ط¯ط§طھ ط¨ط¹ط¯ ظپطھط­ ط§ظ„طµظپط­ط© ط£ظˆ ط£ظڈط¹ظٹط¯ ط¬ظ„ط¨ظ‡ط§
  useEffect(() => {
    setAds(parse(libraryAds))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libraryAds])

  const updateExternalSlot = (id: LibraryAdSlotId, patch: Partial<LibraryAdSlot>) => {
    setAds((prev) => ({
      ...prev,
      external: {
        ...prev.external,
        [id]: { ...emptySlot(), ...prev.external[id], ...patch },
      },
    }))
    if (saveState === 'saved') setSaveState('idle')
  }

  const updateAdSenseSlot = (id: AdSenseSlotId, patch: { desktop?: string; mobile?: string }) => {
    setAds((prev) => ({
      ...prev,
      adsense: { ...prev.adsense, [id]: { ...prev.adsense[id], ...patch } },
    }))
    if (saveState === 'saved') setSaveState('idle')
  }

  const updateOffer = (patch: Partial<PlatformOffer>) => {
    setAds((prev) => ({ ...prev, offers: { ...prev.offers, ...patch } }))
    if (saveState === 'saved') setSaveState('idle')
  }

  const handleSave = async () => {
    setSaveState('saving')
    try {
      // ط§ظ„ط¥ط¹ظ„ط§ظ†ط§طھ ط§ظ„ط®ط§ط±ط¬ظٹط©
      const external: LibraryAds = {}
      ;(Object.keys(ads.external) as LibraryAdSlotId[]).forEach((key) => {
        const slot = ads.external[key]
        if (!slot) return
        const trimmed: LibraryAdSlot = {
          desktop: normalizeAdUrl(slot.desktop) || undefined,
          mobile: normalizeAdUrl(slot.mobile) || undefined,
          link: normalizeAdUrl(slot.link) || undefined,
        }
        if (trimmed.desktop || trimmed.mobile) external[key] = trimmed
      })

      // ط£ط¯ط³ظ†ط³ â€” ط§ظ„ط£ظƒظˆط§ط¯ طھظڈط­ظپط¸ ظƒظ…ط§ ظ‡ظٹ ط¨ط¹ط¯ طھظ†ط¸ظٹظپ ط§ظ„ظپط±ط§ط؛ط§طھ ط§ظ„ط·ط±ظپظٹط©
      const adsense: AdSenseAds = {}
      ;(Object.keys(ads.adsense) as AdSenseSlotId[]).forEach((key) => {
        const slot = ads.adsense[key]
        if (!slot) return
        const trimmed = {
          desktop: slot.desktop?.trim() || undefined,
          mobile: slot.mobile?.trim() || undefined,
        }
        if (trimmed.desktop || trimmed.mobile) adsense[key] = trimmed
      })

      // ط¹ط±ط¶ ط§ظ„ظ…ظ†طµط©
      const offers: PlatformOffer = {
        imageDesktop: normalizeAdUrl(ads.offers.imageDesktop) || undefined,
        imageMobile: normalizeAdUrl(ads.offers.imageMobile) || undefined,
        linkDesktop: normalizeAdUrl(ads.offers.linkDesktop) || undefined,
        linkTablet: normalizeAdUrl(ads.offers.linkTablet) || undefined,
        linkMobile: normalizeAdUrl(ads.offers.linkMobile) || undefined,
      }
      const hasOffer = !!(offers.imageDesktop || offers.imageMobile)

      const clean: Record<string, unknown> = { external, adsense }
      if (hasOffer) clean.offers = offers

      await setSetting('libraryAds', JSON.stringify(clean))
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2500)
    } catch {
      setSaveState('error')
      setTimeout(() => setSaveState('idle'), 3500)
    }
  }

  const SaveButton = ({ className }: { className?: string }) => (
    <button
      type="button"
      onClick={handleSave}
      disabled={saveState === 'saving'}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 text-sm font-semibold shadow-elevation-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 active:scale-[0.97]',
        saveState === 'saved'
          ? 'bg-success text-on-success'
          : saveState === 'error'
            ? 'bg-error text-on-error'
            : 'bg-primary text-on-primary hover:bg-primary-hover hover:shadow-elevation-2',
        className,
      )}
    >
      {saveState === 'saved' ? (
        <>
          <CheckCircle2 size={15} /> طھظ… ط§ظ„ط­ظپط¸
        </>
      ) : saveState === 'error' ? (
        <>
          <AlertTriangle size={15} /> ظپط´ظ„ ط§ظ„ط­ظپط¸
        </>
      ) : (
        <>
          <Save size={15} />{' '}
          {saveState === 'saving' ? 'ط¬ط§ط±ظٹ ط§ظ„ط­ظپط¸...' : 'ط­ظپط¸ ظƒظ„ ط§ظ„ط¥ط¹ظ„ط§ظ†ط§طھ'}
        </>
      )}
    </button>
  )

  return (
    <div
      className="from-primary-soft/40 relative min-h-full overflow-x-hidden bg-gradient-to-b via-background to-background font-sans"
      dir="rtl"
    >
      <div className="mx-auto max-w-page space-y-4 px-2.5 pb-36 pt-3 sm:px-4 md:space-y-6 md:px-6 md:pb-8 md:pt-8">
        {/* Header */}
        <PageHeader
          title="ط§ظ„ظ…ط¹ظ„ظ†ظˆظ†"
          subtitle="ط¥ط¯ط§ط±ط© ظ…ط³ط§ط­ط§طھ ط§ظ„ط¥ط¹ظ„ط§ظ†ط§طھ ظپظٹ طµظپط­ط© ط§ظ„ظ…ظƒطھط¨ط© â€” ط£ط¯ط³ظ†ط³طŒ ط¹ط±ظˆط¶ ط§ظ„ظ…ظ†طµط©طŒ ظˆط§ظ„ط¥ط¹ظ„ط§ظ†ط§طھ ط§ظ„ط®ط§ط±ط¬ظٹط©"
          icon={<Megaphone size={22} />}
          meta={
            filledCount > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 text-[10px] font-extrabold text-success">
                <CheckCircle2 size={10} />
                {filledCount} ظ…ظˆط¶ط¹ ظ…ط¹ط¨ط£
              </span>
            ) : null
          }
          action={<SaveButton className="hidden md:inline-flex" />}
        />

        {/* ===== طھط¨ظˆظٹط¨ط§طھ ط§ظ„طھطµظ†ظٹظپط§طھ ===== */}
        <div className="rounded-2xl border border-border bg-card p-1.5 shadow-elevation-1">
          <Tabs
            tabs={AD_TABS.map((t) => ({
              ...t,
              badge:
                t.value === 'adsense'
                  ? counts.adsense
                  : t.value === 'offers'
                    ? counts.offers
                    : counts.external,
            }))}
            activeTab={activeTab}
            onChange={(v) => setActiveTab(v as AdTabId)}
            variant="pills"
            scrollable
          />
        </div>

        {/* ===== ظ…ط­طھظˆظ‰ ط§ظ„طھط¨ظˆظٹط¨ ط§ظ„ظ†ط´ط· ===== */}
        {activeTab === 'adsense' && (
          <>
            <SectionHeading
              icon={Code2}
              title="ط¥ط¹ظ„ط§ظ†ط§طھ ط¬ظˆط¬ظ„ ط£ط¯ط³ظ†ط³"
              sub="ط§ظ„طµظ‚ ظƒظˆط¯ ط§ظ„ظˆط­ط¯ط© ط§ظ„ط¥ط¹ظ„ط§ظ†ظٹط© ظپظٹ ط§ظ„ظ…ظˆط¶ط¹ ط§ظ„ظ…ط·ظ„ظˆط¨ â€” ظٹط¸ظ‡ط± طھظ„ظ‚ط§ط¦ظٹظ‹ط§ ظپظٹ طµظپط­ط© ط§ظ„ظ…ظƒطھط¨ط©"
              tone="bg-primary-soft text-primary"
            />
            <div className="space-y-4">
              {(Object.keys(ADSENSE_SLOT_META) as AdSenseSlotId[]).map((slotId) => (
                <AdSenseSlotEditor
                  key={slotId}
                  slotId={slotId}
                  code={ads.adsense[slotId] ?? {}}
                  onChange={(patch) => updateAdSenseSlot(slotId, patch)}
                />
              ))}
            </div>
          </>
        )}

        {activeTab === 'offers' && (
          <>
            <SectionHeading
              icon={BadgePercent}
              title="ط¹ط±ظˆط¶ ط§ظ„ظ…ظ†طµط©"
              sub="طµظˆط±ط© ط¹ط±ط¶ ظ…ط¹ ط±ط§ط¨ط· ظ…ط®طµطµ ظ„ظƒظ„ ط¬ظ‡ط§ط² â€” طھط¸ظ‡ط± ظپظٹ ط§ظ„ظ…ظˆط§ط¶ط¹ ط§ظ„ظ…ط´طھط±ظƒط© ط§ظ„ط«ظ„ط§ط«ط©"
              tone="bg-success-soft text-success"
            />
            <OfferEditor offer={ads.offers} onChange={updateOffer} />
          </>
        )}

        {activeTab === 'external' && (
          <>
            <SectionHeading
              icon={Globe2}
              title="ط¥ط¹ظ„ط§ظ†ط§طھ ط®ط§ط±ط¬ظٹط©"
              sub="ط¥ط¹ظ„ط§ظ†ط§طھ طµظˆط± ظ…ظ† ظ…ظ†طµط§طھ ط®ط§ط±ط¬ظٹط© â€” ظ…ظ†ظپطµظ„ط© طھظ…ط§ظ…ظ‹ط§ ط¹ظ† ط£ط¯ط³ظ†ط³ ظˆط¹ط±ظˆط¶ ط§ظ„ظ…ظ†طµط©"
              tone="bg-info-soft text-info"
            />
            <div className="space-y-4">
              {EXTERNAL_SLOTS.map((slot) => (
                <ExternalSlotEditor
                  key={slot.id}
                  slot={slot}
                  data={ads.external[slot.id] ?? emptySlot()}
                  onChange={(patch) => updateExternalSlot(slot.id, patch)}
                />
              ))}
            </div>
          </>
        )}

        <div className="rounded-2xl border border-dashed border-border p-4">
          <div className="mx-auto max-w-2xl space-y-1.5 text-center">
            <p className="text-[11px] font-bold leading-relaxed text-muted">
              <ImageIcon size={11} className="me-1 inline" />
              ظپظٹ ط§ظ„ظ…ظˆط§ط¶ط¹ ط§ظ„طµظˆط±ظٹط©: طھط±ظƒ ط§ظ„ظ…ظˆط¶ط¹ ظپط§ط±ط؛ظ‹ط§ ظٹط®ظپظٹ
              ط¥ط·ط§ط±ظ‡ طھظ„ظ‚ط§ط¦ظٹظ‹ط§ â€” ظˆط±ط§ط¨ط· طµظˆط±ط© ظˆط§ط­ط¯ (ظƒظ…ط¨ظٹظˆطھط± ط£ظˆ
              ظ‡ط§طھظپ) ظٹظڈط³طھط®ط¯ظ… ظ„ظ„ط¬ظ‡ط§ط²ظٹظ†.
            </p>
            <p className="text-[11px] font-bold leading-relaxed text-muted">
              <ExternalLink size={11} className="me-1 inline" />
              ظپظٹ ط£ط¯ط³ظ†ط³: ظ…ظƒطھط¨ط© ط¬ظˆط¬ظ„ طھظڈط­ظ…ظژظ‘ظ„ طھظ„ظ‚ط§ط¦ظٹظ‹ط§ ط¨ظ…ط¹ط±ظ‘ظپ
              ظ†ط§ط´ط±ظƒ ظ…ظ† ط£ظˆظ„ ظƒظˆط¯ طھظ„طµظ‚ظ‡ â€” طھط£ظƒط¯ ظ…ظ† ط£ظ† ط§ظ„ظ†ط·ط§ظ‚
              ظ…ظڈط¹طھظ…ط¯ ظپظٹ ط­ط³ط§ط¨ ط£ط¯ط³ظ†ط³.
            </p>
          </div>
        </div>
      </div>

      {/* ===== ط´ط±ظٹط· ط§ظ„ط­ظپط¸ ط§ظ„ط¹ط§ط¦ظ… â€” ظ‡ط§طھظپ ظپظ‚ط·طŒ ظپظˆظ‚ ط´ط±ظٹط· ط§ظ„طھظ†ظ‚ظ„ ط§ظ„ط³ظپظ„ظٹ ===== */}
      <div
        className="fixed inset-x-3 z-40 md:hidden"
        style={{ bottom: 'calc(84px + env(safe-area-inset-bottom))' }}
      >
        <div className="rounded-2xl border border-border bg-card p-2 shadow-elevation-3">
          <SaveButton className="w-full" />
        </div>
      </div>
    </div>
  )
}

export default Advertisers
