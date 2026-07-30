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
  أول: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 ring-purple-500/20',
  ثاني: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 ring-emerald-500/20',
  ثالث: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 ring-blue-500/20',
  رابع: 'text-orange-600 dark:text-orange-400 bg-orange-500/10 ring-orange-500/20',
  خامس: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 ring-cyan-500/20',
  سادس: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 ring-rose-500/20',
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