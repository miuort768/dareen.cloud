import { useRef } from 'react';
import { Upload, FileSpreadsheet, FileText, Trash2 } from 'lucide-react';
import { api } from '../../../lib/api';
import { downloadExport } from '../../../lib/download';
import { useShowNotification } from '../../../context/AppContext';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '../../../lib/utils';

interface StudentsToolbarProps {
  filteredCount: number;
  totalCount: number;
  onDeleteAll: () => void;
}

export const StudentsToolbar = ({ filteredCount, totalCount, onDeleteAll }: StudentsToolbarProps) => {
  const queryClient = useQueryClient();
  const showNotification = useShowNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const btnClass = "h-8 px-3 flex items-center gap-1.5 text-[10px] font-bold rounded-xl active:scale-[0.97] transition-all";

  return (
    <div className="bg-card border border-border rounded-2xl p-3 shadow-elevation-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold text-muted bg-surface px-2.5 py-1.5 rounded-lg border border-border">
          {filteredCount} / {totalCount} طالب
        </span>
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
          <button onClick={() => fileInputRef.current?.click()} className={cn(btnClass, 'bg-surface border border-border text-muted hover:bg-hover')}>
            <Upload size={12} /> <span className="hidden sm:inline">استيراد</span>
          </button>
          <button onClick={() => downloadExport('students', 'xlsx').then(() => showNotification('تم تصدير Excel', 'success')).catch(e => showNotification(e.message, 'error'))} className={cn(btnClass, 'bg-success text-on-success hover:bg-success-hover shadow-sm')}>
            <FileSpreadsheet size={12} /> Excel
          </button>
          <button onClick={() => downloadExport('students', 'pdf').then(() => showNotification('تم تصدير PDF', 'success')).catch(e => showNotification(e.message, 'error'))} className={cn(btnClass, 'bg-error text-on-error hover:bg-error-hover shadow-sm')}>
            <FileText size={12} /> PDF
          </button>
          <button onClick={onDeleteAll} className={cn(btnClass, 'bg-error-soft border border-error/20 text-error hover:bg-error/20')}>
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};