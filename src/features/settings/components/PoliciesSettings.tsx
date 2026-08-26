import { Lock, AlertCircle, Wallet, CheckCircle2, Snowflake, Archive } from 'lucide-react'
import { SectionCard, SectionTitle, Toggle, InputField, PrimaryBtn, DangerBtn } from './SettingsUI'
import { cn } from '../../../lib/utils'
import { settingsService } from '../services/settingsService'

interface PoliciesSettingsProps {
  backdateLockEnabled: boolean
  setBackdateLockEnabled: (v: boolean) => Promise<void> | void
  showNotify: (msg: string) => void
  teacherCommissionType: string
  setTeacherCommissionType: (v: string) => Promise<void> | void
  autoFreezeThreshold: number
  setAutoFreezeThreshold: (v: number) => Promise<void> | void
  setSecureAction: (
    action: {
      type: 'reset' | 'archive'
      title: string
      description: string
      confirmWord: string
      actionFn: () => void
    } | null,
  ) => void
}

export const PoliciesSettings = ({
  backdateLockEnabled,
  setBackdateLockEnabled,
  showNotify,
  teacherCommissionType,
  setTeacherCommissionType,
  autoFreezeThreshold,
  setAutoFreezeThreshold,
  setSecureAction,
}: PoliciesSettingsProps) => (
  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
    <SectionCard>
      <SectionTitle icon={Lock} label="حماية السجلات والقيود" sub="ضمانات النظام" />
      <div className="space-y-4">
        <div className="rounded-xl border border-divider bg-background p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="flex items-center gap-1.5 text-xs font-bold text-error">
                <AlertCircle size={13} /> قفل التعديل بأثر رجعي
              </p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-error">
                يمنع الموظفين من إضافة أو تعديل حصص في تواريخ قديمة لضمان دقة السجلات المالية.
              </p>
            </div>
            <Toggle
              checked={backdateLockEnabled}
              onChange={() =>
                Promise.resolve(setBackdateLockEnabled(!backdateLockEnabled)).then(() =>
                  showNotify('تم تحديث خيار الحماية'),
                )
              }
            />
          </div>
        </div>

        <div className="border-t border-divider pt-3">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-bold text-primary">
            <Wallet size={13} /> سياسة حساب العمولات
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'fixed', label: 'مبلغ ثابت', sub: 'Fixed Amount' },
              { id: 'percentage', label: 'نسبة مئوية', sub: 'Percentage %' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setTeacherCommissionType(opt.id)
                  showNotify(`الحساب: ${opt.label}`)
                }}
                className={cn(
                  'rounded-xl border p-3.5 text-start transition-all',
                  teacherCommissionType === opt.id
                    ? 'border-primary bg-primary text-on-primary shadow-sm'
                    : 'border-divider bg-background text-muted hover:border-primary/50',
                )}
              >
                <p className="text-xs font-bold">{opt.label}</p>
                <p
                  className={cn(
                    'mt-0.5 text-[11px]',
                    teacherCommissionType === opt.id ? 'text-white/60' : 'text-muted',
                  )}
                >
                  {opt.sub}
                </p>
                {teacherCommissionType === opt.id && (
                  <CheckCircle2 size={12} className="mt-1.5 text-white/70" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>

    <SectionCard>
      <SectionTitle icon={Snowflake} label="سياسة الحضور والغياب" sub="آلية التجميد التلقائي" />
      <div className="space-y-4">
        <div className="rounded-xl border border-divider bg-background p-4">
          <p className="mb-1 text-xs font-bold text-info">حد الغياب المسموح</p>
          <p className="mb-3 text-[11px] leading-relaxed text-info">
            إذا تجاوز الطالب هذا العدد من مرات الغياب المتعاقبة، يتم تجميد اشتراكه تلقائياً.
          </p>
          <div className="flex items-center gap-3">
            <InputField
              type="number"
              value={autoFreezeThreshold}
              onChange={(e) => setAutoFreezeThreshold(Number(e.target.value))}
              min={1}
              max={15}
              className="w-20 text-center text-lg font-bold"
            />
            <PrimaryBtn
              onClick={() =>
                Promise.resolve(setAutoFreezeThreshold(autoFreezeThreshold)).then(() =>
                  showNotify('تم حفظ السياسة'),
                )
              }
              className="flex-1"
            >
              <CheckCircle2 size={13} /> تفعيل
            </PrimaryBtn>
          </div>
        </div>

        <div className="rounded-xl border border-error-soft bg-background p-4">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-error-soft">
              <Archive size={14} className="text-error" />
            </div>
            <div>
              <p className="text-xs font-bold text-error">إقفال الشهر المالي</p>
              <p className="text-[11px] text-error">منطقة الخطر</p>
            </div>
          </div>
          <p className="mb-3 text-[11px] leading-relaxed text-muted">
            أرشفة كافة الحصص الحالية وتصفير الإحصائيات الشهرية. لا تستخدم هذا إلا بنهاية الشهر
            الفعلي.
          </p>
          <DangerBtn
            className="w-full"
            onClick={() =>
              setSecureAction({
                type: 'archive',
                title: 'إقفال الشهر المالي',
                description:
                  'سيتم أرشفة الإحصائيات الحالية لبدء فترة مالية جديدة. لا يمكن التراجع بسهولة.',
                confirmWord: 'إقفال الشهر',
                actionFn: () =>
                  settingsService
                    .archiveMonth()
                    .then(() => {
                      showNotify('تم تجميد وأرشفة بيانات الشهر المالي!')
                      setTimeout(() => window.location.reload(), 2000)
                    })
                    .catch((e) => {
                      console.error('Archive month error:', e)
                      showNotify('حدث خطأ أثناء إقفال الشهر!')
                    }),
              })
            }
          >
            <Lock size={13} /> إقفال الفترة الحالية
          </DangerBtn>
        </div>
      </div>
    </SectionCard>
  </div>
)
