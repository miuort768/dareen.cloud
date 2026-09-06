import { useState, useEffect } from 'react'
import { Clock, Sun, Moon } from 'lucide-react'
import { SectionCard, SectionTitle, FieldLabel, InputField, PrimaryBtn } from './SettingsUI'
import { settingsService } from '../services/settingsService'
import { safeGet } from '../../../lib/api'

const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

export const WorkingHoursSection = ({ showNotify }: { showNotify: (msg: string) => void }) => {
  const [schedule, setSchedule] = useState<
    { day: number; enabled: boolean; start: string; end: string }[]
  >(DAYS.map((_, i) => ({ day: i, enabled: i < 5, start: '09:00', end: '17:00' })))
  const [sessionDuration, setSessionDuration] = useState('60')
  const [breakStart, setBreakStart] = useState('12:00')
  const [breakEnd, setBreakEnd] = useState('13:00')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    settingsService
      .getSettingsBatch()
      .then((data) => {
        const sys = safeGet<Record<string, string>>(data, 'system') || {}
        try {
          const saved = JSON.parse(sys.working_hours || '[]')
          if (Array.isArray(saved) && saved.length === DAYS.length) {
            setSchedule(
              saved.map(
                (d: { day: number; enabled: boolean; start: string; end: string }, i: number) => ({
                  day: i,
                  enabled: !!d.enabled,
                  start: d.start || '09:00',
                  end: d.end || '17:00',
                }),
              ),
            )
          }
        } catch {
          /* keep defaults */
        }
        if (sys.session_duration) setSessionDuration(sys.session_duration)
        try {
          const br = JSON.parse(sys.break_time || '{}')
          if (br.start) setBreakStart(br.start)
          if (br.end) setBreakEnd(br.end)
        } catch {
          /* keep defaults */
        }
      })
      .catch((e) => console.warn(e))
  }, [])

  const toggleDay = (day: number) => {
    setSchedule((prev) => prev.map((d) => (d.day === day ? { ...d, enabled: !d.enabled } : d)))
  }

  const updateTime = (day: number, field: 'start' | 'end', value: string) => {
    setSchedule((prev) => prev.map((d) => (d.day === day ? { ...d, [field]: value } : d)))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await settingsService.saveSettingsBatch([
        { key: 'working_hours', value: JSON.stringify(schedule) },
        { key: 'session_duration', value: sessionDuration },
        { key: 'break_time', value: JSON.stringify({ start: breakStart, end: breakEnd }) },
      ])
      showNotify('تم حفظ أوقات العمل')
    } catch (e) {
      console.error(e)
      showNotify('خطأ في الحفظ')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <SectionCard>
      <SectionTitle icon={Clock} label="أوقات العمل" sub="تحديد ساعات العمل وفترات الراحة" />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-divider bg-background p-4">
          <FieldLabel>مدة الجلسة (دقيقة)</FieldLabel>
          <InputField
            type="number"
            aria-label="مدة الجلسة (دقيقة)"
            value={sessionDuration}
            onChange={(e) => setSessionDuration(e.target.value)}
          />
        </div>
        <div className="rounded-xl border border-divider bg-background p-4">
          <FieldLabel>بداية الاستراحة</FieldLabel>
          <InputField
            type="time"
            aria-label="بداية الاستراحة"
            value={breakStart}
            onChange={(e) => setBreakStart(e.target.value)}
          />
        </div>
        <div className="rounded-xl border border-divider bg-background p-4">
          <FieldLabel>نهاية الاستراحة</FieldLabel>
          <InputField
            type="time"
            aria-label="نهاية الاستراحة"
            value={breakEnd}
            onChange={(e) => setBreakEnd(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        {schedule.map((d) => (
          <div
            key={d.day}
            className="flex items-center gap-3 rounded-xl border border-divider bg-background p-3 transition-colors hover:border-divider"
          >
            <button
              onClick={() => toggleDay(d.day)}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl outline-none transition-all focus-visible:ring-2 focus-visible:ring-focus ${
                d.enabled
                  ? 'bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-elevation-1'
                  : 'bg-hover text-muted'
              }`}
            >
              {d.day < 5 ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <span
              className={`w-16 text-sm font-bold md:w-20 ${d.enabled ? 'text-main' : 'text-muted'}`}
            >
              {DAYS[d.day]}
            </span>
            {d.enabled ? (
              <>
                <InputField
                  type="time"
                  aria-label="وقت البداية"
                  value={d.start}
                  onChange={(e) => updateTime(d.day, 'start', e.target.value)}
                  className="w-24 md:w-28"
                />
                <span className="shrink-0 text-muted">—</span>
                <InputField
                  type="time"
                  aria-label="وقت النهاية"
                  value={d.end}
                  onChange={(e) => updateTime(d.day, 'end', e.target.value)}
                  className="w-24 md:w-28"
                />
              </>
            ) : (
              <span className="rounded-lg bg-hover px-2 py-1.5 text-xs text-muted">إجازة</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end border-t border-divider pt-5">
        <PrimaryBtn onClick={handleSave} loading={isSaving}>
          حفظ أوقات العمل
        </PrimaryBtn>
      </div>
    </SectionCard>
  )
}
