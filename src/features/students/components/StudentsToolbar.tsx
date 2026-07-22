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
        <div className="bg-card border border-border/50 rounded-xl p-3">
            <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-dim">{filteredCount} / {totalCount} طالب</span>
                <div className="flex items-center gap-1.5">
                    <input type="file" ref={fileInputRef} accept=".csv,.xlsx" className="hidden"
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
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 bg-background border border-border text-dim text-[10px] font-bold px-2 py-1.5 rounded-lg active:scale-[0.97] transition-transform" title="استيراد">
                        <Upload size={11} /> <span className="hidden sm:inline">استيراد</span>
                    </button>
                    <button onClick={() => downloadExport('students', 'xlsx').then(() => showNotification('تم تصدير Excel', 'success')).catch(e => showNotification(e.message, 'error'))} className="flex items-center gap-1 bg-success-soft border border-success/20 text-success text-[10px] font-bold px-2 py-1.5 rounded-lg active:scale-[0.97] transition-transform" title="تصدير Excel">
                        <FileSpreadsheet size={11} /> <span className="hidden sm:inline">Excel</span>
                    </button>
                    <button onClick={() => downloadExport('students', 'pdf').then(() => showNotification('تم تصدير PDF', 'success')).catch(e => showNotification(e.message, 'error'))} className="flex items-center gap-1 bg-error-soft border border-error/20 text-error text-[10px] font-bold px-2 py-1.5 rounded-lg active:scale-[0.97] transition-transform" title="تصدير PDF">
                        <FileText size={11} /> <span className="hidden sm:inline">PDF</span>
                    </button>
                    <button onClick={onDeleteAll} className="flex items-center gap-1 bg-error-soft border border-error/20 text-error text-[10px] font-bold px-2 py-1.5 rounded-lg active:scale-[0.97] transition-transform" title="حذف الكل">
                        <Trash2 size={11} />
                    </button>
                </div>
            </div>
        </div>
    );
};
