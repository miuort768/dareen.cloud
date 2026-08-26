import { Building2, Wallet, Monitor, Lock, Snowflake, CheckCircle2 } from 'lucide-react'
import {
  SectionCard,
  SectionTitle,
  FieldLabel,
  InputField,
  PrimaryBtn,
  ToggleRow,
  ALLOWED_CURRENCIES,
} from './SettingsUI'
import { cn } from '../../../lib/utils'

interface GeneralSettingsProps {
  localAcademyName: string
  setLocalAcademyName: (v: string) => void
  localAdminPhone: string
  setLocalAdminPhone: (v: string) => void
  localTelegramHandle: string
  setLocalTelegramHandle: (v: string) => void
  localLibraryTelegram: string
  setLocalLibraryTelegram: (v: string) => void
  maintenanceMode: boolean
  setMaintenanceTarget: (v: boolean) => void
  setShowMaintenanceModal: (v: boolean) => void
  localSemesterName: string
  setLocalSemesterName: (v: string) => void
  localPrice: number
  setLocalPrice: (v: number) => void
  localTeacherPrice: number
  setLocalTeacherPrice: (v: number) => void
  localCurrency: string
  setLocalCurrency: (v: string) => void
  localThreshold: number
  setLocalThreshold: (v: number) => void
  localAutoFreeze: number
  setLocalAutoFreeze: (v: number) => void
  localBackdateLock: boolean
  setBackdateTarget: (v: boolean) => void
  setShowBackdateModal: (v: boolean) => void
  handleSaveGeneral: () => void
  isSaving: boolean
  showNotify: (msg: string) => void
}

export const GeneralSettings = ({
  localAcademyName,
  setLocalAcademyName,
  localAdminPhone,
  setLocalAdminPhone,
  localTelegramHandle,
  setLocalTelegramHandle,
  localLibraryTelegram,
  setLocalLibraryTelegram,
  maintenanceMode,
  setMaintenanceTarget,
  setShowMaintenanceModal,
  localSemesterName,
  setLocalSemesterName,
  localPrice,
  setLocalPrice,
  localTeacherPrice,
  setLocalTeacherPrice,
  localCurrency,
  setLocalCurrency,
  localThreshold,
  setLocalThreshold,
  localAutoFreeze,
  setLocalAutoFreeze,
  localBackdateLock,
  setBackdateTarget,
  setShowBackdateModal,
  handleSaveGeneral,
  isSaving,
}: GeneralSettingsProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard>
          <SectionTitle icon={Building2} label="الهوية الأساسية" sub="بيانات الأكاديمية الأساسية" />
          <div className="space-y-3">
            <div>
              <FieldLabel>اسم الأكاديمية</FieldLabel>
              <InputField
                value={localAcademyName}
                onChange={(e) => setLocalAcademyName(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>رقم هاتف المسؤول</FieldLabel>
              <InputField
                value={localAdminPhone}
                onChange={(e) => setLocalAdminPhone(e.target.value)}
                dir="ltr"
                className="font-mono tracking-wider"
              />
            </div>
            <div>
              <FieldLabel>قناة تليجرام</FieldLabel>
              <InputField
                value={localTelegramHandle}
                onChange={(e) => setLocalTelegramHandle(e.target.value)}
                placeholder="تطبيق دارين السابعة"
                dir="ltr"
                className="font-mono"
              />
            </div>
            <div>
              <FieldLabel>قناة تليجرام المكتبة</FieldLabel>
              <InputField
                value={localLibraryTelegram}
                onChange={(e) => setLocalLibraryTelegram(e.target.value)}
                placeholder="https://t.me/..."
                dir="ltr"
                className="font-mono"
              />
            </div>
            <ToggleRow
              icon={Monitor}
              label="وضع الصيانة"
              sub="تعطيل وصول المستخدمين العاديين"
              checked={maintenanceMode}
              onChange={() => {
                setMaintenanceTarget(!maintenanceMode)
                setShowMaintenanceModal(true)
              }}
            />
          </div>
        </SectionCard>

        <SectionCard>
          <SectionTitle
            icon={Wallet}
            label="الإعدادات المالية والأكاديمية"
            sub="أسعار وفصول وقواعد"
          />
          <div className="space-y-3">
            <div>
              <FieldLabel>تسمية الفصل الدراسي</FieldLabel>
              <InputField
                value={localSemesterName}
                onChange={(e) => setLocalSemesterName(e.target.value)}
                placeholder="الفصل الأول 2024"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>سعر الطالب</FieldLabel>
                <InputField
                  type="number"
                  value={localPrice}
                  onChange={(e) => setLocalPrice(Number(e.target.value))}
                />
              </div>
              <div>
                <FieldLabel>سعر المعلم</FieldLabel>
                <InputField
                  type="number"
                  value={localTeacherPrice}
                  onChange={(e) => setLocalTeacherPrice(Number(e.target.value))}
                />
              </div>
              <div>
                <FieldLabel>العملة</FieldLabel>
                <select
                  value={localCurrency}
                  onChange={(e) => setLocalCurrency(e.target.value)}
                  className="w-full rounded-xl border border-divider bg-background px-3 py-3 text-sm font-bold text-main transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                >
                  {ALLOWED_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>تنبيه الرصيد</FieldLabel>
                <InputField
                  type="number"
                  value={localThreshold}
                  onChange={(e) => setLocalThreshold(Number(e.target.value))}
                  className="text-center text-error"
                />
              </div>
            </div>

            <div className="rounded-xl border border-divider bg-background p-4">
              <ToggleRow
                icon={Lock}
                label="قفل التاريخ القديم"
                sub="منع تسجيل حصص بتواريخ سابقة"
                checked={localBackdateLock}
                onChange={() => {
                  setBackdateTarget(!localBackdateLock)
                  setShowBackdateModal(true)
                }}
              />
            </div>

            <div className="flex items-center gap-2 rounded-lg border-s-2 border-warning bg-warning-soft px-4 py-3 text-[11px] font-bold text-warning-dark">
              القيم تُطبَّق تلقائياً عند تسجيل طالب أو معلم جديد.
            </div>

            <PrimaryBtn onClick={handleSaveGeneral} loading={isSaving} className="mt-2 w-full">
              <CheckCircle2 size={14} /> حفظ الإعدادات الأساسية
            </PrimaryBtn>
          </div>
        </SectionCard>
      </div>

      <SectionCard>
        <SectionTitle
          icon={Snowflake}
          label="أيام التجميد"
          sub="تجميد حساب الطالب تلقائياً عند الغياب المتواصل"
        />
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="max-w-xs">
            <FieldLabel>عدد أيام التجميد</FieldLabel>
            <InputField
              type="number"
              value={localAutoFreeze}
              onChange={(e) => setLocalAutoFreeze(Number(e.target.value))}
              className="text-center"
            />
          </div>
          <p className={cn('flex-1 text-[11px] font-bold text-muted')}>
            يتم تجميد حساب الطالب تلقائياً بعد غياب متواصل عن الحصص لمدة هذا العدد من الأيام، ويُرسل
            تنبيه لولي الأمر قبل التجميد.
          </p>
          <PrimaryBtn onClick={handleSaveGeneral} loading={isSaving}>
            <CheckCircle2 size={14} /> حفظ
          </PrimaryBtn>
        </div>
      </SectionCard>
    </div>
  )
}
