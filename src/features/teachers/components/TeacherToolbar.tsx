import { Search, Plus, X, Upload, Trash2, FileSpreadsheet, FileText } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface TeacherToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showAddForm: boolean;
  onToggleAddForm: () => void;
  onImport: () => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
  onDeleteAll: () => void;
  subjects: string[];
  filterSubject: string;
  onFilterSubjectChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  totalTeachers: number;
  filteredCount: number;
}

const subjectColorMap: Record<string, string> = {
  رياضيات: 'text-primary bg-primary/10 ring-primary/20',
  عربي: 'text-success bg-success/10 ring-success/20',
  'اللغة العربية': 'text-success bg-success/10 ring-success/20',
  علوم: 'text-info bg-info-soft ring-info/20',
  إنجليزي: 'text-warning bg-warning/10 ring-warning/20',
  'اللغة الانجليزية': 'text-warning bg-warning/10 ring-warning/20',
  فيزياء: 'text-accent bg-accent/10 ring-accent/20',
  كيمياء: 'text-error bg-error/10 ring-error/20',
  لغات: 'text-accent bg-accent/10 ring-accent/20',
  'اللغة الفرنسية': 'text-accent bg-accent/10 ring-accent/20',
  'اللغة الاسبانية': 'text-info bg-info-soft ring-info/20',
  أدبي: 'text-warning bg-warning/10 ring-warning/20',
  دراسات: 'text-success bg-success/10 ring-success/20',
  قرآن: 'text-primary bg-primary/10 ring-primary/20',
  قران: 'text-primary bg-primary/10 ring-primary/20',
  شرعية: 'text-success bg-success/10 ring-success/20',
  اجتماعيات: 'text-warning bg-warning/10 ring-warning/20',
};

const getSubjectStyle = (subject?: string) => {
  if (!subject) return 'text-muted bg-surface ring-border';
  const key = Object.keys(subjectColorMap).find(k => subject.includes(k) || k.includes(subject));
  return key ? subjectColorMap[key] : 'text-info bg-info-soft ring-info/20';
};

export const TeacherToolbar = ({
  searchTerm, onSearchChange, showAddForm, onToggleAddForm, onImport,
  onExportExcel, onExportPDF, onDeleteAll,
  subjects, filterSubject, onFilterSubjectChange, filterStatus, onFilterStatusChange,
  totalTeachers, filteredCount,
}: TeacherToolbarProps) => {
  const showFilters = subjects.length > 0 || totalTeachers > 0;
  return (
    <div className="bg-card border border-border rounded-2xl p-3 space-y-3 shadow-elevation-1">
      {/* Search + Actions Row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
          <input
            type="text"
            aria-label="بحث عن معلمة"
            placeholder="بحث بالاسم أو التخصص..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-surface border border-border text-main text-xs font-bold ps-9 pe-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl transition-all placeholder:text-muted"
          />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onImport} className="w-8 h-8 flex items-center justify-center bg-surface border border-border text-muted rounded-lg active:scale-95 transition-transform hover:bg-hover" aria-label="استيراد">
            <Upload size={12} />
          </button>
          <button onClick={onExportExcel} className="w-8 h-8 flex items-center justify-center bg-success-soft border border-success/20 text-success rounded-lg active:scale-95 transition-transform hover:bg-success/20" aria-label="تصدير Excel">
            <FileSpreadsheet size={12} />
          </button>
          <button onClick={onExportPDF} className="w-8 h-8 flex items-center justify-center bg-error-soft border border-error/20 text-error rounded-lg active:scale-95 transition-transform hover:bg-error/20" aria-label="تصدير PDF">
            <FileText size={12} />
          </button>
          <button onClick={onDeleteAll} className="w-8 h-8 flex items-center justify-center bg-error-soft border border-error/20 text-error rounded-lg active:scale-95 transition-transform hover:bg-error/20" aria-label="حذف الكل">
            <Trash2 size={12} />
          </button>
          <button
            onClick={onToggleAddForm}
            className={cn(
              "h-8 px-3 flex items-center gap-1.5 text-[11px] font-bold rounded-lg transition-all active:scale-95",
              showAddForm ? "bg-error text-on-error" : "bg-primary text-on-primary"
            )}
          >
            {showAddForm ? <X size={12} /> : <Plus size={12} />}
            {showAddForm ? 'إلغاء' : 'إضافة'}
          </button>
        </div>
      </div>

      {/* Chips Filters */}
      {showFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          {/* نتائج */}
          <span className="text-[10px] font-bold text-muted bg-surface px-2 py-1 rounded-lg border border-border">
            {filteredCount} / {totalTeachers}
          </span>

          {/* تخصص */}
          {subjects.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <button
                onClick={() => onFilterSubjectChange('')}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[9px] font-bold ring-1 transition-all",
                  !filterSubject
                    ? 'bg-primary text-on-primary ring-primary/30'
                    : 'text-muted bg-surface ring-border hover:bg-hover'
                )}
              >
                الكل
              </button>
              {subjects.map(subj => (
                <button
                  key={subj}
                  onClick={() => onFilterSubjectChange(filterSubject === subj ? '' : subj)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[9px] font-bold ring-1 transition-all",
                    filterSubject === subj
                      ? getSubjectStyle(subj)
                      : 'text-muted bg-surface ring-border hover:bg-hover'
                  )}
                >
                  {subj}
                </button>
              ))}
            </div>
          )}

          {/* الحالة */}
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-muted">|</span>
            {['', 'active', 'inactive'].map(status => {
              const label = status === '' ? 'الكل' : status === 'active' ? 'نشطة' : 'متوقفة';
              const isActive = filterStatus === status;
              const dot = status === 'active' ? 'bg-success' : status === 'inactive' ? 'bg-error' : '';
              return (
                <button
                  key={status}
                  onClick={() => onFilterStatusChange(isActive ? '' : status)}
                  className={cn(
                    "px-2 py-1 rounded-lg text-[9px] font-bold ring-1 transition-all inline-flex items-center gap-1",
                    isActive ? 'bg-primary text-on-primary ring-primary/30' : 'text-muted bg-surface ring-border hover:bg-hover'
                  )}
                >
                  {dot && <span className={cn("w-1.5 h-1.5 rounded-full", dot)} />}
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};