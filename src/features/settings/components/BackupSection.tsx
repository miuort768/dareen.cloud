import { useState, useEffect } from 'react'
import { Shield, Download, Upload, History, RotateCcw, Clock } from 'lucide-react'
import { SectionCard, SectionTitle, PrimaryBtn, SecondaryBtn, DangerBtn } from './SettingsUI'
import { settingsService } from '../services/settingsService'
import { safeArray } from '../../../lib/api'
import { cn } from '../../../lib/utils'
import { useShowNotification } from '../../../context/AppContext'

export const BackupSection = ({
  handleExportBackup,
  handleImportBackup,
  triggerReset,
  isSaving,
  triggerArchive,
}: {
  handleExportBackup: () => void
  handleImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void
  triggerReset: () => void
  isSaving: boolean
  triggerArchive: () => void
}) => {
  const [backupHistory, setBackupHistory] = useState<
    { id: number; type: string; status: string; size: number; createdAt: string }[]
  >([])
  const [loading, setLoading] = useState(true)
  const showNotify = useShowNotification()

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      try {
        const res = await settingsService.getBackupHistory()
        setBackupHistory(
          safeArray<{ id: number; type: string; status: string; size: number; createdAt: string }>(
            res.data,
          ),
        )
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const res = await settingsService.getBackupHistory()
      setBackupHistory(
        safeArray<{ id: number; type: string; status: string; size: number; createdAt: string }>(
          res.data,
        ),
      )
    } catch (e) {
      console.error(e)
    }
  }

  const createBackup = async () => {
    try {
      await settingsService.createBackup()
      fetchHistory()
    } catch (e: unknown) {
      showNotify(e instanceof Error ? e.message : 'خطأ غير متوقع')
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <SectionCard>
      <SectionTitle
        icon={Shield}
        label="النسخ الاحتياطي"
        sub="إدارة النسخ الاحتياطية واستعادة البيانات"
      />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <PrimaryBtn onClick={handleExportBackup} className="w-full justify-center">
          <Download size={16} /> تصدير نسخة احتياطية
        </PrimaryBtn>

        <SecondaryBtn
          onClick={() => document.getElementById('import-backup-input')?.click()}
          className="w-full justify-center"
        >
          <Upload size={16} /> استيراد نسخة
        </SecondaryBtn>
        <input
          id="import-backup-input"
          type="file"
          accept=".json"
          onChange={handleImportBackup}
          className="hidden"
        />

        <PrimaryBtn onClick={createBackup} loading={isSaving} className="w-full justify-center">
          <RotateCcw size={16} /> إنشاء نسخة الآن
        </PrimaryBtn>
      </div>

      <div className="mb-6">
        <h4 className="mb-3 flex items-center gap-2 text-xs font-bold text-muted">
          <History size={14} /> سجل النسخ الاحتياطي
        </h4>
        {loading ? (
          <p className="text-xs text-muted">جاري التحميل...</p>
        ) : backupHistory.length === 0 ? (
          <div className="py-8 text-center text-muted">
            <p className="text-sm font-bold">لا توجد نسخ احتياطية سابقة</p>
            <p className="mt-1 text-xs">قم بإنشاء أول نسخة احتياطية الآن</p>
          </div>
        ) : (
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {backupHistory.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-xl border border-divider bg-background px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <Clock size={12} className="shrink-0 text-muted" />
                  <span className="text-xs text-muted">
                    {new Date(b.createdAt).toLocaleString('ar')}
                  </span>
                  <span
                    className={cn(
                      'rounded-lg px-2 py-0.5 text-[11px] font-bold',
                      b.status === 'completed'
                        ? 'bg-success-soft text-success'
                        : 'bg-warning-soft text-warning-dark',
                    )}
                  >
                    {b.status}
                  </span>
                </div>
                <span className="text-[11px] text-muted">{formatSize(b.size)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-divider pt-5">
        <div>
          <p className="text-xs font-bold text-error">منطقة خطرة</p>
          <p className="text-[11px] text-muted">أرشفة الموسم الحالي أو إعادة تعيين النظام</p>
        </div>
        <div className="flex gap-2">
          <SecondaryBtn onClick={triggerArchive}>أرشفة الموسم</SecondaryBtn>
          <DangerBtn onClick={triggerReset}>إعادة تعيين النظام</DangerBtn>
        </div>
      </div>
    </SectionCard>
  )
}
