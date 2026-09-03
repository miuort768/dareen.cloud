import { useEffect, useState } from 'react'
import {
  Megaphone,
  Monitor,
  Smartphone,
  Link2,
  Save,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { Image } from '../shared/components/ui'
import { useAcademyName } from '../context/AppContext'
import { useSettingsStore } from '../store/settingsStore'
import {
  parseLibraryAds,
  normalizeAdUrl,
  type LibraryAdSlot,
  type LibraryAds,
  type LibraryAdSlotId,
} from '../components/blog/AdBanner'
import { cn } from '../lib/utils'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

interface SlotConfig {
  id: LibraryAdSlotId
  title: string
  desc: string
  withMobile: boolean
  desktopHint: string
  mobileHint?: string
}

const SLOTS: SlotConfig[] = [
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

const emptySlot = (): LibraryAdSlot => ({ desktop: '', mobile: '', link: '' })

const SlotField = ({
  label,
  icon: Icon,
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
    <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-black text-main">
      <Icon size={12} className="text-primary" />
      {label}
    </span>
    <input
      type="url"
      dir="ltr"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-xs text-main outline-none transition-all placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-focus"
    />
  </label>
)

const SlotPreview = ({ url, tall }: { url: string; tall?: boolean }) => {
  const normalized = normalizeAdUrl(url)
  if (!normalized) return null
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-card shadow-sm',
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

export const Advertisers = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `المعلنون | ${academyName}`
  }, [academyName])

  const libraryAds = useSettingsStore((s) => s.libraryAds)
  const setSetting = useSettingsStore((s) => s.setSetting)

  const [ads, setAds] = useState<LibraryAds>(() => parseLibraryAds(libraryAds))
  const [saveState, setSaveState] = useState<SaveState>('idle')

  // مزامنة مع الـ store — إذا وصلت الإعدادات بعد فتح الصفحة أو أُعيد جلبها
  useEffect(() => {
    setAds(parseLibraryAds(libraryAds))
  }, [libraryAds])

  const updateSlot = (id: LibraryAdSlotId, patch: Partial<LibraryAdSlot>) => {
    setAds((prev) => ({ ...prev, [id]: { ...emptySlot(), ...prev[id], ...patch } }))
    if (saveState === 'saved') setSaveState('idle')
  }

  const handleSave = async () => {
    setSaveState('saving')
    try {
      const clean: LibraryAds = {}
      ;(Object.keys(ads) as LibraryAdSlotId[]).forEach((key) => {
        const slot = ads[key]
        if (!slot) return
        const trimmed: LibraryAdSlot = {
          desktop: normalizeAdUrl(slot.desktop) || undefined,
          mobile: normalizeAdUrl(slot.mobile) || undefined,
          link: normalizeAdUrl(slot.link) || undefined,
        }
        if (trimmed.desktop || trimmed.mobile) clean[key] = trimmed
      })
      await setSetting('libraryAds', JSON.stringify(clean))
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2500)
    } catch {
      setSaveState('error')
      setTimeout(() => setSaveState('idle'), 3500)
    }
  }

  return (
    <div
      className="from-primary-soft/40 relative min-h-full overflow-x-hidden bg-gradient-to-b via-background to-background font-sans"
      dir="rtl"
    >
      <div className="mx-auto max-w-page space-y-4 px-2.5 pt-3 sm:px-4 md:px-6 md:pt-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border border-divider bg-card p-5 shadow-elevation-1 md:p-6">
          <div
            className="pointer-events-none absolute -end-16 -top-16 h-40 w-40 rounded-full bg-primary-soft blur-3xl"
            aria-hidden="true"
          />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-on-primary">
                <Megaphone size={22} />
              </div>
              <div>
                <h1 className="text-lg font-black text-main md:text-xl">المعلنون</h1>
                <p className="text-[11px] font-bold text-muted">
                  إدارة المساحات الإعلانية في صفحة المكتبة — الصق رابط الصورة فقط وستظهر مباشرة
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saveState === 'saving'}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]',
                saveState === 'saved'
                  ? 'bg-success text-on-success'
                  : saveState === 'error'
                    ? 'bg-error text-on-error'
                    : 'bg-primary text-on-primary hover:bg-primary-hover',
              )}
            >
              {saveState === 'saved' ? (
                <>
                  <CheckCircle2 size={14} /> تم الحفظ
                </>
              ) : saveState === 'error' ? (
                <>
                  <AlertTriangle size={14} /> فشل الحفظ — أعد المحاولة
                </>
              ) : (
                <>
                  <Save size={14} /> {saveState === 'saving' ? 'جاري الحفظ...' : 'حفظ كل الإعلانات'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Slots */}
        <div className="space-y-4">
          {SLOTS.map((slot) => {
            const data = ads[slot.id] ?? emptySlot()
            return (
              <section
                key={slot.id}
                aria-label={slot.title}
                className="rounded-2xl border border-border bg-card p-5 shadow-elevation-1 md:p-6"
              >
                <div className="mb-4 flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
                    <Megaphone size={15} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-main">{slot.title}</h2>
                    <p className="text-[11px] font-bold text-muted">{slot.desc}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <SlotField
                      label="رابط صورة الكمبيوتر"
                      icon={Monitor}
                      value={data.desktop ?? ''}
                      onChange={(v) => updateSlot(slot.id, { desktop: v })}
                      placeholder="https://example.com/ad-desktop.jpg"
                    />
                    {slot.withMobile && (
                      <SlotField
                        label="رابط صورة الهاتف"
                        icon={Smartphone}
                        value={data.mobile ?? ''}
                        onChange={(v) => updateSlot(slot.id, { mobile: v })}
                        placeholder="https://example.com/ad-mobile.jpg"
                      />
                    )}
                    <SlotField
                      label="رابط الإعلان عند النقر (اختياري)"
                      icon={Link2}
                      value={data.link ?? ''}
                      onChange={(v) => updateSlot(slot.id, { link: v })}
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
              </section>
            )
          })}
        </div>

        <div className="rounded-2xl border border-dashed border-border p-4">
          <p className="text-center text-[11px] font-bold leading-relaxed text-muted">
            في حال ترك أي موضع فارغاً سيختفي إطاره من صفحة المكتبة تلقائياً — وإذا أُدخل رابط واحد
            فقط (كمبيوتر أو هاتف) سيُستخدم للجهازين.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Advertisers
