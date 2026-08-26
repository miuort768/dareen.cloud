import { useState, useEffect } from 'react'
import { UserCheck, AlarmClock, Snowflake } from 'lucide-react'
import {
  SectionCard,
  SectionTitle,
  FieldLabel,
  InputField,
  ToggleRow,
  PrimaryBtn,
} from './SettingsUI'
import { settingsService } from '../services/settingsService'
import { safeGet } from '../../../lib/api'

export const AttendanceSettingsSection = ({
  localBackdateLock,
  setLocalBackdateLock,
  localAutoFreeze,
  setLocalAutoFreeze,
  showNotify,
}: {
  localBackdateLock: boolean
  setLocalBackdateLock: (v: boolean) => void
  localAutoFreeze: number
  setLocalAutoFreeze: (v: number) => void
  showNotify: (msg: string) => void
}) => {
  const [lateThreshold, setLateThreshold] = useState('15')
  const [absenceAlertThreshold, setAbsenceAlertThreshold] = useState('3')
  const [autoRemind, setAutoRemind] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    settingsService
      .getSettingsBatch()
      .then((data) => {
        const sys = safeGet<Record<string, string>>(data, 'system') || {}
        setLateThreshold(sys.late_threshold_minutes || '15')
        setAbsenceAlertThreshold(sys.absence_alert_threshold || '3')
        setAutoRemind(sys.auto_remind !== 'false')
      })
      .catch((e) => console.warn(e))
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await settingsService.saveSettingsBatch([
        { key: 'late_threshold_minutes', value: lateThreshold },
        { key: 'absence_alert_threshold', value: absenceAlertThreshold },
        { key: 'auto_remind', value: String(autoRemind) },
        { key: 'auto_freeze_threshold', value: String(localAutoFreeze) },
        { key: 'backdate_lock_enabled', value: String(localBackdateLock) },
      ])
      showNotify('تم حفظ إعدادات الحضور')
    } catch (e) {
      console.error(e)
      showNotify('خطأ في الحفظ')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <SectionCard>
      <SectionTitle
        icon={UserCheck}
        label="إعدادات الحضور"
        sub="التحكم بسياسات الحضور والغياب والتذكيرات"
      />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-divider bg-background p-4">
          <FieldLabel>حد التأخير (دقائق)</FieldLabel>
          <InputField
            type="number"
            value={lateThreshold}
            onChange={(e) => setLateThreshold(e.target.value)}
          />
        </div>
        <div className="rounded-xl border border-divider bg-background p-4">
          <FieldLabel>حد الغياب للتنبيه</FieldLabel>
          <InputField
            type="number"
            value={absenceAlertThreshold}
            onChange={(e) => setAbsenceAlertThreshold(e.target.value)}
          />
        </div>
        <div className="rounded-xl border border-divider bg-background p-4">
          <FieldLabel>التجميد التلقائي (غيابات)</FieldLabel>
          <InputField
            type="number"
            value={localAutoFreeze}
            onChange={(e) => setLocalAutoFreeze(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-3">
        <ToggleRow
          icon={AlarmClock}
          label="التذكير التلقائي بالحضور"
          sub="إرسال تذكير قبل الحصة"
          checked={autoRemind}
          onChange={() => setAutoRemind(!autoRemind)}
        />
        <ToggleRow
          icon={Snowflake}
          label="قفل إدخال الحضور السابق"
          sub="منع تعديل الحضور لأيام سابقة"
          checked={localBackdateLock}
          onChange={() => setLocalBackdateLock(!localBackdateLock)}
        />
      </div>

      <div className="mt-6 flex justify-end border-t border-divider pt-5">
        <PrimaryBtn onClick={handleSave} loading={isSaving}>
          حفظ إعدادات الحضور
        </PrimaryBtn>
      </div>
    </SectionCard>
  )
}
