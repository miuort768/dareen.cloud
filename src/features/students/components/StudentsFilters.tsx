import { GraduationCap, BookOpen, Filter } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface StudentsFiltersProps {
  filterGrade: string;
  uniqueGrades: string[];
  gradeCounts: Record<string, number>;
  onGradeChange: (val: string) => void;
  filterCurriculum: string;
  uniqueCurriculums: string[];
  curriculumCounts: Record<string, number>;
  onCurriculumChange: (val: string) => void;
}

const gradeColors: Record<string, string> = {
  أول: 'text-primary bg-primary/10 ring-primary/20',
  ثاني: 'text-success bg-success/10 ring-success/20',
  ثالث: 'text-info bg-info/10 ring-info/20',
  رابع: 'text-warning bg-warning/10 ring-warning/20',
  خامس: 'text-accent bg-accent/10 ring-accent/20',
  سادس: 'text-error bg-error/10 ring-error/20',
};

const getGradeStyle = (grade?: string) => {
  if (!grade) return 'text-muted bg-surface ring-border';
  const key = Object.keys(gradeColors).find(k => grade.includes(k));
  return key ? gradeColors[key] : 'text-info bg-info-soft ring-info/20';
};

const chipBase = "px-3 py-1.5 rounded-xl text-[11px] font-bold ring-1 transition-all active:scale-95";
const chipIdle = "text-muted bg-surface ring-border hover:bg-hover";
const chipActiveAll = "bg-primary text-on-primary ring-primary/30";

export const StudentsFilters = ({ filterGrade, uniqueGrades, gradeCounts, onGradeChange, filterCurriculum, uniqueCurriculums, curriculumCounts, onCurriculumChange }: StudentsFiltersProps) => {
  const hasFilters = !!filterGrade || !!filterCurriculum;
  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-elevation-1">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-main">
            <span className="p-1.5 bg-primary/10 text-primary rounded-lg"><Filter size={13} /></span>
            تصفية الطلاب
          </span>
          {hasFilters && (
            <button
              onClick={() => { onGradeChange(''); onCurriculumChange(''); }}
              className="text-[10px] font-bold text-error hover:text-error-hover transition-colors"
            >
              مسح الكل
            </button>
          )}
        </div>

        {uniqueGrades.length > 0 && (
          <div className="flex items-start sm:items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted shrink-0 mt-1 sm:mt-0">
              <GraduationCap size={13} />
              المرحلة
            </span>
            <button onClick={() => onGradeChange('')} className={cn(chipBase, !filterGrade ? chipActiveAll : chipIdle)}>الكل</button>
            {uniqueGrades.map(g => (
              <button
                key={g}
                onClick={() => onGradeChange(filterGrade === g ? '' : g)}
                className={cn(chipBase, filterGrade === g ? cn('ring-1', getGradeStyle(g)) : chipIdle)}
              >
                {g}
                {gradeCounts[g] ? <span className={cn('ms-1 text-[9px] tabular-nums', filterGrade === g ? 'opacity-80' : 'text-muted')}>({gradeCounts[g]})</span> : null}
              </button>
            ))}
          </div>
        )}

        {uniqueCurriculums.length > 0 && (
          <div className="flex items-start sm:items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted shrink-0 mt-1 sm:mt-0">
              <BookOpen size={13} />
              المنهج
            </span>
            <button onClick={() => onCurriculumChange('')} className={cn(chipBase, !filterCurriculum ? chipActiveAll : chipIdle)}>الكل</button>
            {uniqueCurriculums.map(c => (
              <button
                key={c}
                onClick={() => onCurriculumChange(filterCurriculum === c ? '' : c)}
                className={cn(chipBase, filterCurriculum === c ? 'text-info bg-info-soft ring-info/20' : chipIdle)}
              >
                {c}
                {curriculumCounts[c] ? <span className={cn('ms-1 text-[9px] tabular-nums', filterCurriculum === c ? 'opacity-80' : 'text-muted')}>({curriculumCounts[c]})</span> : null}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
