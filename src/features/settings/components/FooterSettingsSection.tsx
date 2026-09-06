import { Info } from 'lucide-react'
import { FieldLabel, InputField, TextAreaField } from './SettingsUI'

interface FooterSettingsSectionProps {
  localFooterDescription: string
  setLocalFooterDescription: (v: string) => void
  localFooterAddress: string
  setLocalFooterAddress: (v: string) => void
  localFooterInstagram: string
  setLocalFooterInstagram: (v: string) => void
}

export const FooterSettingsSection = ({
  localFooterDescription,
  setLocalFooterDescription,
  localFooterAddress,
  setLocalFooterAddress,
  localFooterInstagram,
  setLocalFooterInstagram,
}: FooterSettingsSectionProps) => (
  <div className="mt-6 border-t border-divider pt-5">
    <h4 className="mb-4 flex items-center gap-2 text-sm font-black text-main">
      <Info size={14} className="text-primary" /> تعديل الفوتر (الموقع العام)
    </h4>
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div className="md:col-span-2">
        <FieldLabel>وصف الفوتر</FieldLabel>
        <TextAreaField
          aria-label="وصف الفوتر"
          value={localFooterDescription}
          onChange={(e) => setLocalFooterDescription(e.target.value)}
          rows={2}
          placeholder="نبذة قصيرة تظهر أسفل الموقع"
        />
      </div>
      <div>
        <FieldLabel>عنوان الفوتر</FieldLabel>
        <InputField
          aria-label="عنوان الفوتر"
          value={localFooterAddress}
          onChange={(e) => setLocalFooterAddress(e.target.value)}
          placeholder="مثال: بني سويف - مصر"
        />
      </div>
      <div>
        <FieldLabel>حساب انستجرام</FieldLabel>
        <InputField
          aria-label="حساب انستجرام"
          value={localFooterInstagram}
          onChange={(e) => setLocalFooterInstagram(e.target.value)}
          placeholder="daren_school"
          dir="ltr"
          className="font-mono"
        />
      </div>
    </div>
  </div>
)
