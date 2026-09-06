import { Phone, Bell, CheckCircle2, RefreshCw, Calendar, Trash2 } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'
import {
  SectionCard,
  SectionTitle,
  ToggleRow,
  FieldLabel,
  InputField,
  TextAreaField,
  PrimaryBtn,
  DangerBtn,
} from './SettingsUI'
import { settingsService } from '../services/settingsService'

interface AdvancedSettingsProps {
  whatsappAutoNotify: boolean
  setWhatsappAutoNotify: (v: boolean) => Promise<void> | void
  localWhatsappTemplate: string
  setLocalWhatsappTemplate: Dispatch<SetStateAction<string>>
  setWhatsappTemplate: (v: string) => Promise<void> | void
  showNotify: (msg: string) => void
  reminderMinutesBefore: number
  setReminderMinutesBefore: (v: number) => void
  localSemesterName: string
  setLocalSemesterName: (v: string) => void
  localSemesters: string
  setLocalSemesters: (v: string) => void
  setSemesterName: (v: string) => Promise<void> | void
  setSemesters: (v: string) => Promise<void> | void
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

export const AdvancedSettings = ({
  whatsappAutoNotify,
  setWhatsappAutoNotify,
  localWhatsappTemplate,
  setLocalWhatsappTemplate,
  setWhatsappTemplate,
  showNotify,
  reminderMinutesBefore,
  setReminderMinutesBefore,
  localSemesterName,
  setLocalSemesterName,
  localSemesters,
  setLocalSemesters,
  setSemesterName,
  setSemesters,
  setSecureAction,
}: AdvancedSettingsProps) => (
  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
    <SectionCard>
      <SectionTitle
        icon={Phone}
        label="أتمتة الواتساب والرسائل"
        sub="إعدادات الإشعارات التلقائية"
      />
      <div className="space-y-3">
        <ToggleRow
          icon={Bell}
          label="إرسال الفواتير تلقائياً"
          sub="الإشعارات التلقائية للحصص والاشتراكات"
          checked={whatsappAutoNotify}
          onChange={() => setWhatsappAutoNotify(!whatsappAutoNotify)}
        />
        <div>
          <FieldLabel>قالب رسالة الحضور</FieldLabel>
          <TextAreaField
            aria-label="قالب رسالة الحضور"
            value={localWhatsappTemplate}
            onChange={(e) => setLocalWhatsappTemplate(e.target.value)}
            rows={5}
            placeholder="اكتب رسالتك هنا..."
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['{Student}', '{Subject}', '{Date}', '{Teacher}', '{Price}'].map((tag) => (
            <button
              key={tag}
              onClick={() => setLocalWhatsappTemplate((prev) => prev + ' ' + tag)}
              className="rounded-lg border border-divider bg-background px-3 py-1.5 font-mono text-[11px] font-bold text-muted transition-all hover:bg-info-soft hover:text-info"
            >
              {tag}
            </button>
          ))}
        </div>
        <PrimaryBtn
          className="w-full"
          onClick={() =>
            Promise.resolve(setWhatsappTemplate(localWhatsappTemplate)).then(() =>
              showNotify('تم حفظ القالب'),
            )
          }
        >
          <CheckCircle2 size={13} /> حفظ وتفعيل القالب
        </PrimaryBtn>
      </div>
    </SectionCard>

    <SectionCard>
      <SectionTitle
        icon={Bell}
        label="تذكير أولياء الأمور بالحصص"
        sub="إعدادات التذكير قبل الحصة"
      />
      <div className="space-y-3">
        <div className="rounded-xl border border-divider bg-background p-4">
          <FieldLabel>إرسال تذكير قبل الحصة بـ (دقائق)</FieldLabel>
          <InputField
            type="number"
            aria-label="إرسال تذكير قبل الحصة بـ (دقائق)"
            value={reminderMinutesBefore}
            onChange={(e) => setReminderMinutesBefore(Math.max(1, Number(e.target.value)))}
            placeholder="30"
          />
          <p className="mt-1.5 text-[11px] text-muted">
            سيتم إرسال إشعار لولي الأمر قبل الحصة بهذا العدد من الدقائق
          </p>
        </div>
      </div>
    </SectionCard>

    <SectionCard>
      <SectionTitle icon={Calendar} label="إدارة الفصول والأرشيف" sub="السجل الأكاديمي والتاريخي" />
      <div className="space-y-3">
        <div>
          <FieldLabel>الفصل الحالي</FieldLabel>
          <InputField
            aria-label="الفصل الحالي"
            value={localSemesterName}
            onChange={(e) => setLocalSemesterName(e.target.value)}
            placeholder="الفصل الأول 2024"
          />
        </div>
        <div>
          <FieldLabel>الأرشيف التاريخي</FieldLabel>
          <TextAreaField
            aria-label="الأرشيف التاريخي"
            value={localSemesters}
            onChange={(e) => setLocalSemesters(e.target.value)}
            rows={4}
            placeholder="الأرشيف التاريخي..."
          />
        </div>
        <PrimaryBtn
          className="w-full"
          onClick={() =>
            Promise.all([setSemesterName(localSemesterName), setSemesters(localSemesters)]).then(
              () => showNotify('تم تحديث الأرشيف'),
            )
          }
        >
          <RefreshCw size={13} /> مزامنة الفصول
        </PrimaryBtn>
      </div>

      <div className="mt-4 border-t border-divider pt-4">
        <DangerBtn
          className="w-full"
          onClick={() =>
            setSecureAction({
              type: 'reset',
              title: 'تصفير النظام بالكامل',
              description:
                'سيتم مسح جميع البيانات المتعلقة بالطلاب والمعلمين والإيرادات للبدء من جديد. هذا الإجراء نهائي.',
              confirmWord: 'إعادة ضبط المنصة',
              actionFn: () =>
                settingsService.systemReset().then(() => {
                  localStorage.clear()
                  window.location.reload()
                }),
            })
          }
        >
          <Trash2 size={13} /> إعادة ضبط المصنع
        </DangerBtn>
      </div>
    </SectionCard>
  </div>
)
