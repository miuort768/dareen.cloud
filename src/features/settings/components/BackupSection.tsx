import { useState, useEffect } from 'react';
import { Shield, Download, Upload, History, RotateCcw, Clock } from 'lucide-react';
import { SectionCard, SectionTitle, PrimaryBtn, SecondaryBtn, DangerBtn } from './SettingsUI';
import { settingsService } from '../services/settingsService';

export const BackupSection = ({
    handleExportBackup, handleImportBackup, triggerReset, isSaving, triggerArchive,
}: {
    handleExportBackup: () => void; handleImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
    triggerReset: () => void; isSaving: boolean; triggerArchive: () => void;
}) => {
    const [backupHistory, setBackupHistory] = useState<{ id: number; type: string; status: string; size: number; createdAt: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const res = await settingsService.getBackupHistory();
                setBackupHistory(res.data as { id: number; type: string; status: string; size: number; createdAt: string }[]);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchHistory();
    }, []);

    const createBackup = async () => {
        try {
            await settingsService.createBackup();
            fetchHistory();
        } catch (e: unknown) { alert(e instanceof Error ? e.message : 'خطأ غير متوقع'); }
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <SectionCard>
            <SectionTitle icon={Shield} label="النسخ الاحتياطي" sub="إدارة النسخ الاحتياطية واستعادة البيانات" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <PrimaryBtn onClick={handleExportBackup} className="w-full justify-center">
                    <Download size={16} /> تصدير نسخة احتياطية
                </PrimaryBtn>

                <SecondaryBtn onClick={() => document.getElementById('import-backup-input')?.click()} className="w-full justify-center">
                    <Upload size={16} /> استيراد نسخة
                </SecondaryBtn>
                <input id="import-backup-input" type="file" accept=".json" onChange={handleImportBackup} className="hidden" />

                <PrimaryBtn onClick={createBackup} loading={isSaving} className="w-full justify-center">
                    <RotateCcw size={16} /> إنشاء نسخة الآن
                </PrimaryBtn>
            </div>

            <div className="mb-6">
                <h4 className="text-xs font-bold text-muted mb-3 flex items-center gap-2">
                    <History size={14} /> سجل النسخ الاحتياطي
                </h4>
                {loading ? (
                    <p className="text-xs text-dim">جاري التحميل...</p>
                ) : backupHistory.length === 0 ? (
                    <p className="text-xs text-dim">لا توجد نسخ احتياطية سابقة</p>
                ) : (
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                        {backupHistory.map(b => (
                            <div key={b.id} className="flex items-center justify-between py-2 px-3 bg-surface rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Clock size={12} className="text-dim" />
                                    <span className="text-xs text-muted">{new Date(b.createdAt).toLocaleString('ar')}</span>
                                    <span className={`text-micro px-1.5 py-0.5 rounded font-bold ${b.status === 'completed' ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning-dark'}`}>
                                        {b.status}
                                    </span>
                                </div>
                                <span className="text-micro text-dim">{formatSize(b.size)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-error">منطقة خطرة</p>
                    <p className="text-micro text-dim">أرشفة الموسم الحالي أو إعادة تعيين النظام</p>
                </div>
                <div className="flex gap-2">
                    <SecondaryBtn onClick={triggerArchive}>أرشفة الموسم</SecondaryBtn>
                    <DangerBtn onClick={triggerReset}>إعادة تعيين النظام</DangerBtn>
                </div>
            </div>
        </SectionCard>
    );
};
