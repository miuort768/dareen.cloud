import { useRef } from 'react';
import { Upload, FileSpreadsheet, FileText, Trash2 } from 'lucide-react';
import { api } from '../../../lib/api';
import { downloadExport } from '../../../lib/download';
import { useShowNotification } from '../../../context/AppContext';
import { useQueryClient } from '@tanstack/react-query';

interface StudentsToolbarProps {
    filteredCount: number;
    totalCount: number;
    onDeleteAll: () => void;
}

export const StudentsToolbar = ({ filteredCount, totalCount, onDeleteAll }: StudentsToolbarProps) => {
    const queryClient = useQueryClient();
    const showNotification = useShowNotification();
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="bg-card border border-border shadow-sm rounded-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3">
                <div className="flex items-center gap-2 text-micro font-bold text-dim">
                    <span>{filteredCount} / {totalCount} طالب</span>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept=".csv,.xlsx"
                        className="hidden"
                        onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                                const text = await file.text();
                                const lines = text.split('\n').filter(Boolean);
                                for (let i = 1; i < lines.length; i++) {
                                    const cols = lines[i].split(',');
                                    if (cols.length >= 2) {
                                        await api.post('/students', {
                                            name: cols[0].trim(),
                                            grade: cols[1].trim(),
                                            parentPhone: cols[2]?.trim() || '',
                                        });
                                    }
                                }
                                queryClient.invalidateQueries({ queryKey: ['students'] });
                                showNotification('تم استيراد الطلاب بنجاح', 'success');
                            } catch {
                                showNotification('فشل استيراد الملف', 'error');
                            }
                            e.target.value = '';
                        }}
                    />
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 bg-card dark:bg-hover hover:bg-surface text-muted text-micro font-bold px-2.5 py-1.5 border border-border transition-all shadow-sm active:scale-[0.97] rounded-2xl"><Upload size={12} /> استيراد</button>
                    <button onClick={() => downloadExport('students', 'xlsx').then(() => showNotification('تم تصدير Excel', 'success')).catch(e => showNotification(e.message, 'error'))} className="flex items-center gap-1.5 bg-success-soft text-success text-micro font-bold px-2.5 py-1.5 border border-success-soft transition-all shadow-sm active:scale-[0.97] rounded-2xl"><FileSpreadsheet size={12} /> Excel</button>
                    <button onClick={() => downloadExport('students', 'pdf').then(() => showNotification('تم تصدير PDF', 'success')).catch(e => showNotification(e.message, 'error'))} className="flex items-center gap-1.5 bg-error-soft text-error text-micro font-bold px-2.5 py-1.5 border border-error-soft transition-all shadow-sm active:scale-[0.97] rounded-2xl"><FileText size={12} /> PDF</button>
                    <button onClick={onDeleteAll} className="flex items-center gap-1.5 bg-card dark:bg-hover border border-border hover:bg-error hover:border-error hover:text-on-error text-error text-micro font-bold px-2.5 py-1.5 transition-all shadow-sm active:scale-[0.97] rounded-2xl"><Trash2 size={12} /></button>
                </div>
            </div>
        </div>
    );
};
