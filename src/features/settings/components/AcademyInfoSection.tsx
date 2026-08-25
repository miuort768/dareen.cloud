import { Phone, Hash, Globe, Apple } from 'lucide-react'
import { useSettingsStore } from '../../../store/settingsStore'
import { SectionCard, SectionTitle, FieldLabel, InputField, PrimaryBtn } from './SettingsUI'
import { FooterSettingsSection } from './FooterSettingsSection'

export const AcademyInfoSection = ({
  localAcademyName,
  setLocalAcademyName,
  localAdminPhone,
  setLocalAdminPhone,
  localTelegramHandle,
  setLocalTelegramHandle,
  localLibraryTelegram,
  setLocalLibraryTelegram,
  localFooterDescription,
  setLocalFooterDescription,
  localFooterAddress,
  setLocalFooterAddress,
  localFooterInstagram,
  setLocalFooterInstagram,
  handleSaveGeneral,
  isSaving,
}: {
  localAcademyName: string
  setLocalAcademyName: (v: string) => void
  localAdminPhone: string
  setLocalAdminPhone: (v: string) => void
  localTelegramHandle: string
  setLocalTelegramHandle: (v: string) => void
  localLibraryTelegram: string
  setLocalLibraryTelegram: (v: string) => void
  localFooterDescription: string
  setLocalFooterDescription: (v: string) => void
  localFooterAddress: string
  setLocalFooterAddress: (v: string) => void
  localFooterInstagram: string
  setLocalFooterInstagram: (v: string) => void
  handleSaveGeneral: () => void
  isSaving: boolean
}) => {
  const googlePlayUrl = useSettingsStore((s) => s.googlePlayUrl)
  const appStoreUrl = useSettingsStore((s) => s.appStoreUrl)
  const setSetting = useSettingsStore((s) => s.setSetting)

  return (
    <SectionCard>
      <SectionTitle
        icon={Hash}
        label="معلومات المعهد"
        sub="البيانات الأساسية للمعهد وروابط التواصل"
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <FieldLabel>اسم المعهد</FieldLabel>
            <InputField
              value={localAcademyName}
              onChange={(e) => setLocalAcademyName(e.target.value)}
              placeholder="مثال: دارين السابعة للتعليم والتدريب"
            />
          </div>
          <div>
            <FieldLabel>رقم الهاتف (واتساب)</FieldLabel>
            <div className="relative">
              <Phone size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
              <InputField
                value={localAdminPhone}
                onChange={(e) => setLocalAdminPhone(e.target.value)}
                className="ps-9"
                dir="ltr"
                placeholder="مثال: 201015098836"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <FieldLabel>قناة تليجرام</FieldLabel>
            <div className="relative">
              <Hash size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
              <InputField
                value={localTelegramHandle}
                onChange={(e) => setLocalTelegramHandle(e.target.value)}
                className="ps-9"
                placeholder="dareen_app"
              />
            </div>
          </div>
          <div>
            <FieldLabel>قناة تليجرام المكتبة</FieldLabel>
            <div className="relative">
              <Hash size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
              <InputField
                value={localLibraryTelegram}
                onChange={(e) => setLocalLibraryTelegram(e.target.value)}
                className="ps-9"
                placeholder="https://t.me/..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-border/20 mt-6 border-t pt-5">
        <h4 className="mb-4 text-sm font-bold text-main">روابط التطبيقات</h4>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <FieldLabel>رابط Google Play</FieldLabel>
            <div className="relative">
              <Globe size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
              <InputField
                value={googlePlayUrl}
                onChange={(e) => setSetting('googlePlayUrl', e.target.value)}
                className="ps-9"
                placeholder="https://play.google.com/store/apps/..."
              />
            </div>
          </div>
          <div>
            <FieldLabel>رابط App Store</FieldLabel>
            <div className="relative">
              <Apple size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
              <InputField
                value={appStoreUrl}
                onChange={(e) => setSetting('appStoreUrl', e.target.value)}
                className="ps-9"
                placeholder="https://apps.apple.com/app/..."
              />
            </div>
          </div>
        </div>
      </div>

      <FooterSettingsSection
        localFooterDescription={localFooterDescription}
        setLocalFooterDescription={setLocalFooterDescription}
        localFooterAddress={localFooterAddress}
        setLocalFooterAddress={setLocalFooterAddress}
        localFooterInstagram={localFooterInstagram}
        setLocalFooterInstagram={setLocalFooterInstagram}
      />

      <div className="border-border/20 mt-6 flex justify-end border-t pt-5">
        <PrimaryBtn onClick={handleSaveGeneral} loading={isSaving}>
          حفظ معلومات المعهد
        </PrimaryBtn>
      </div>
    </SectionCard>
  )
}
