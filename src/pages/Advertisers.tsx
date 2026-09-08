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
  { value: 'adsense', label: 'جوجل أدسنس', icon: <Code2 size={15} /> },
  { value: 'offers', label: 'عروض المنصة', icon: <BadgePercent size={15} /> },
  { value: 'external', label: 'خارجية', icon: <Globe2 size={15} /> },
]

/* ================= الحقول الأساسية ================= */

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
        alt="معاينة الإعلان"
        className="h-full w-full"
        imgClassName="object-cover"
        withSkeleton
      />
    </div>
  )
}

/* ================= رأس بطاقة موضع ================= */

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

/* ================= تصنيف 1: جوجل أدسنس ================= */

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
            <FieldLabel icon={Monitor}>كود إعلان الكمبيوتر</FieldLabel>
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
              <FieldLabel icon={Smartphone}>كود إعلان الجوال</FieldLabel>
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
              الصق كود وحدة أدسنس كاملًا كما نسخته من لوحة تحكم جوجل.
              {meta.desktopOnly
                ? ' هذا الموضع يظهر على الكمبيوتر فقط.'
                : ' أضف كودًا منفصلًا للجوال — أحجام الإعلانات تختلف بين الأجهزة.'}
            </p>
          </div>
          {showWarning && (
            <div className="border-warning/30 flex items-start gap-2 rounded-xl border bg-warning-soft p-3">
              <AlertTriangle size={14} className="mt-0.5 shrink-0 text-warning" />
              <p className="text-[10px] font-bold leading-relaxed text-warning">
                النص الملصوق لا يبدو ككود أدسنس (ينقصه &lt;ins&gt; أو adsbygoogle) — تأكد قبل الحفظ.
              </p>
            </div>
          )}
          {(desktopCode.trim() || mobileCode.trim()) && (
            <p className="text-[10px] font-bold text-muted">
              {(desktopCode + mobileCode).length} حرف
            </p>
          )}
        </div>
      </div>
    </SlotCard>
  )
}

/* ================= تصنيف 2: عروض المنصة ================= */

const OfferEditor = ({
  offer,
  onChange,
}: {
  offer: PlatformOffer
  onChange: (patch: Partial<PlatformOffer>) => void
}) => (
  <SlotCard
    title="صورة العرض والروابط"
    desc="تظهر في 3 مواضع: تحت الملفات الأكثر قراءة · تحت اختيار الفصل الدراسي · تحت اختيار المادة"
    tone="bg-success-soft"
    icon={<BadgePercent size={15} className="text-success" />}
  >
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-3">
        <UrlField
          label="رابط صورة الكمبيوتر والتابلت"
          icon={Monitor}
          value={offer.imageDesktop ?? ''}
          onChange={(v) => onChange({ imageDesktop: v })}
          placeholder="https://example.com/offer-desktop.jpg"
        />
        <UrlField
          label="رابط صورة الهاتف (اختياري)"
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
          label="رابط الكمبيوتر"
          icon={Link2}
          value={offer.linkDesktop ?? ''}
          onChange={(v) => onChange({ linkDesktop: v })}
          placeholder="https://example.com/offer"
        />
        <UrlField
          label="رابط التابلت"
          icon={Tablet}
          value={offer.linkTablet ?? ''}
          onChange={(v) => onChange({ linkTablet: v })}
          placeholder="https://example.com/offer-tablet"
        />
        <UrlField
          label="رابط الهاتف"
          icon={Smartphone}
          value={offer.linkMobile ?? ''}
          onChange={(v) => onChange({ linkMobile: v })}
          placeholder="https://example.com/offer-mobile"
        />
        <p className="text-[10px] font-bold leading-relaxed text-muted">
          عند الضغط على صورة العرض يُفتح رابط الجهاز المناسب — التابلت يرجع لرابط الكمبيوتر تلقائيًا
          إن تُرك فارغًا.
        </p>
      </div>
    </div>
  </SlotCard>
)

/* ================= تصنيف 3: الإعلانات الخارجية ================= */

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
    title: 'تحت حقل البحث',
    desc: 'شريط إعلاني عريض أسفل حقل البحث في الصفحة الرئيسية للمكتبة',
    withMobile: false,
    desktopHint: 'الأبعاد المقترحة: ١٦٠٠×٣٦٠ (عريض)',
  },
  {
    id: 'belowTypesHero',
    title: 'تحت هيرو المكتبة الرئيسي',
    desc: 'أسفل العنوان الرئيسي على الكمبيوتر وأسفل بانر الترحيب على الهاتف',
    withMobile: true,
    desktopHint: 'الأبعاد المقترحة: ١٦٠٠×٣٦٠ (عريض)',
    mobileHint: 'الأبعاد المقترحة: ٨٠٠×٥٠٠ (عمودي)',
  },
  {
    id: 'belowSelectionHero',
    title: 'تحت بانر «اختر المنهج / المرحلة»',
    desc: 'أسفل شاشات اختيار المنهج والمرحلة واللغة على الهاتف والكمبيوتر',
    withMobile: true,
    desktopHint: 'الأبعاد المقترحة: ١٦٠٠×٣٦٠ (عريض)',
    mobileHint: 'الأبعاد المقترحة: ٨٠٠×٥٠٠ (عمودي)',
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-3">
        <UrlField
          label="رابط صورة الكمبيوتر"
          icon={Monitor}
          value={data.desktop ?? ''}
          onChange={(v) => onChange({ desktop: v })}
          placeholder="https://example.com/ad-desktop.jpg"
        />
        {slot.withMobile && (
          <UrlField
            label="رابط صورة الهاتف"
            icon={Smartphone}
            value={data.mobile ?? ''}
            onChange={(v) => onChange({ mobile: v })}
            placeholder="https://example.com/ad-mobile.jpg"
          />
        )}
        <UrlField
          label="رابط الإعلان عند النقر (اختياري)"
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
          {slot.mobileHint ? ` · ${slot.mobileHint}` : ''}
        </p>
      </div>
    </div>
  </SlotCard>
)

/* ================= رأس التصنيف ================= */

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

/* ================= الصفحة ================= */

export const Advertisers = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `المعلنون | ${academyName}`
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

  // عدد المواضع المعبأة لكل تصنيف — شارة على التبويب
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

  // مزامنة مع الـ store — إذا وصلت الإعدادات بعد فتح الصفحة أو أُعيد جلبها
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
      // الإعلانات الخارجية
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

      // أدسنس — الأكواد تُحفظ كما هي بعد تنظيف الفراغات الطرفية
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

      // عرض المنصة
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
          <CheckCircle2 size={15} /> تم الحفظ
        </>
      ) : saveState === 'error' ? (
        <>
          <AlertTriangle size={15} /> فشل الحفظ
        </>
      ) : (
        <>
          <Save size={15} /> {saveState === 'saving' ? 'جاري الحفظ...' : 'حفظ كل الإعلانات'}
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
          title="المعلنون"
          subtitle="إدارة مساحات الإعلانات في صفحة المكتبة — أدسنس، عروض المنصة، والإعلانات الخارجية"
          icon={<Megaphone size={22} />}
          meta={
            filledCount > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 text-[10px] font-extrabold text-success">
                <CheckCircle2 size={10} />
                {filledCount} موضع معبأ
              </span>
            ) : null
          }
          action={<SaveButton className="hidden md:inline-flex" />}
        />

        {/* ===== تبويبات التصنيفات ===== */}
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

        {/* ===== محتوى التبويب النشط ===== */}
        {activeTab === 'adsense' && (
          <>
            <SectionHeading
              icon={Code2}
              title="إعلانات جوجل أدسنس"
              sub="الصق كود الوحدة الإعلانية في الموضع المطلوب — يظهر تلقائيًا في صفحة المكتبة"
              tone="bg-primary-soft text-primary"
            />
            <div className="space-y-3 md:space-y-4">
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
              title="عروض المنصة"
              sub="صورة عرض مع رابط مخصص لكل جهاز — تظهر في المواضع المشتركة الثلاثة"
              tone="bg-success-soft text-success"
            />
            <OfferEditor offer={ads.offers} onChange={updateOffer} />
          </>
        )}

        {activeTab === 'external' && (
          <>
            <SectionHeading
              icon={Globe2}
              title="إعلانات خارجية"
              sub="إعلانات صور من منصات خارجية — منفصلة تمامًا عن أدسنس وعروض المنصة"
              tone="bg-info-soft text-info"
            />
            <div className="space-y-3 md:space-y-4">
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
              في المواضع الصورية: ترك الموضع فارغًا يخفي إطاره تلقائيًا — ورابط صورة واحد (كمبيوتر
              أو هاتف) يُستخدم للجهازين.
            </p>
            <p className="text-[11px] font-bold leading-relaxed text-muted">
              <ExternalLink size={11} className="me-1 inline" />
              في أدسنس: مكتبة جوجل تُحمَّل تلقائيًا بمعرّف ناشرك من أول كود تلصقه — تأكد من أن
              النطاق مُعتمد في حساب أدسنس.
            </p>
          </div>
        </div>
      </div>

      {/* ===== شريط الحفظ العائم — هاتف فقط، فوق شريط التنقل السفلي ===== */}
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
