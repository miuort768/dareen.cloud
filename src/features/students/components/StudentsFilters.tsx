import { GraduationCap, BookOpen } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface StudentsFiltersProps {
  filterGrade: string;
  uniqueGrades: string[];
  onGradeChange: (val: string) => void;
  filterCurriculum: string;
  uniqueCurriculums: string[];
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

export const StudentsFilters = ({ filterGrade, uniqueGrades, onGradeChange, filterCurriculum, uniqueCurriculums, onCurriculumChange }: StudentsFiltersProps) => (
  <div className="bg-card border border-border rounded-2xl p-3 shadow-elevation-1">
    <div className="flex items-center gap-2 flex-wrap">
      {/* Filter icon */}
      <span className="text-[9px] font-bold text-muted bg-surface px-2 py-1 rounded-lg border border-border shrink-0">
        تصفية:
      </span>

      {/* Grade Pills */}
      {uniqueGrades.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => onGradeChange('')}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[9px] font-bold ring-1 transition-all",
              !filterGrade
                ? 'bg-primary text-on-primary ring-primary/30'
                : 'text-muted bg-surface ring-border hover:bg-hover'
            )}
          >
            <GraduationCap size={10} className="inline me-1" />
            الكل
          </button>
          {uniqueGrades.map(g => (
            <button
              key={g}
              onClick={() => onGradeChange(filterGrade === g ? '' : g)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[9px] font-bold ring-1 transition-all",
                filterGrade === g
                  ? getGradeStyle(g)
                  : 'text-muted bg-surface ring-border hover:bg-hover'
              )}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {/* Separator */}
      {uniqueGrades.length > 0 && uniqueCurriculums.length > 0 && (
        <span className="text-border mx-1">|</span>
      )}

      {/* Curriculum Pills */}
      {uniqueCurriculums.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => onCurriculumChange('')}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[9px] font-bold ring-1 transition-all",
              !filterCurriculum
                ? 'bg-primary text-on-primary ring-primary/30'
                : 'text-muted bg-surface ring-border hover:bg-hover'
            )}
          >
            <BookOpen size={10} className="inline me-1" />
            الكل
          </button>
          {uniqueCurriculums.map(c => (
            <button
              key={c}
              onClick={() => onCurriculumChange(filterCurriculum === c ? '' : c)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[9px] font-bold ring-1 transition-all",
                filterCurriculum === c
                  ? 'text-info bg-info-soft ring-info/20'
                  : 'text-muted bg-surface ring-border hover:bg-hover'
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  </div>
);