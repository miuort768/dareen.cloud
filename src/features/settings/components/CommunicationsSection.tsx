import { MessageSquare } from 'lucide-react'
import {
  SectionCard,
  SectionTitle,
  FieldLabel,
  TextAreaField,
  ToggleRow,
  PrimaryBtn,
} from './SettingsUI'

export const CommunicationsSection = ({
  whatsappAutoNotify,
  setWhatsappAutoNotify,
  localWhatsappTemplate,
  setLocalWhatsappTemplate,
  setWhatsappTemplate,
  showNotify,
}: {
  whatsappAutoNotify: boolean
  setWhatsappAutoNotify: (v: boolean) => void
  localWhatsappTemplate: string
  setLocalWhatsappTemplate: (v: string) => void
  setWhatsappTemplate: (v: string) => void
  showNotify: (msg: string) => void
}) => {
  const handleSaveWhatsappTemplate = () => {
    if (!localWhatsappTemplate.trim()) {
      showNotify('أدخل قالب الرسالة أولاً')
      return
    }
    if (!localWhatsappTemplate.includes('{student}')) {
      showNotify('يجب أن يحتوي القالب على المتغير {student}')
      return
    }
    setWhatsappTemplate(localWhatsappTemplate)
    showNotify('تم حفظ قالب واتساب')
  }

  return (
    <div className="space-y-5">
      <SectionCard>
        <SectionTitle
          icon={MessageSquare}
          label="واتساب"
          sub="إعدادات الإشعارات التلقائية وقوالب الرسائل"
        />
        <div className="space-y-4">
          <ToggleRow
            icon={MessageSquare}
            label="الإشعار التلقائي عبر واتساب"
            sub="إرسال إشعار لولي الأمر عند تسجيل حضور الطالب"
            checked={whatsappAutoNotify}
            onChange={() => setWhatsappAutoNotify(!whatsappAutoNotify)}
          />
          <div>
            <FieldLabel>قالب رسالة واتساب</FieldLabel>
            <TextAreaField
              value={localWhatsappTemplate}
              onChange={(e) => setLocalWhatsappTemplate(e.target.value)}
              rows={4}
              placeholder="أهلاً {student}، تذكير بحصة {subject} غداً الساعة {time}"
            />
            <p className="mt-2 text-[11px] font-bold text-muted">
              المتغيرات المتاحة: <span className="font-mono text-primary">{'{student}'}</span> اسم
              الطالب · <span className="font-mono text-primary">{'{subject}'}</span> المادة ·{' '}
              <span className="font-mono text-primary">{'{teacher}'}</span> المعلمة ·{' '}
              <span className="font-mono text-primary">{'{date}'}</span> التاريخ ·{' '}
              <span className="font-mono text-primary">{'{price}'}</span> السعر
            </p>
          </div>
          <div className="flex justify-end">
            <PrimaryBtn onClick={handleSaveWhatsappTemplate}>حفظ قالب واتساب</PrimaryBtn>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
