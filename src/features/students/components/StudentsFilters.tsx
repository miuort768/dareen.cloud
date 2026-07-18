import { GraduationCap, BookOpen } from 'lucide-react';

interface StudentsFiltersProps {
    filterGrade: string;
    uniqueGrades: string[];
    onGradeChange: (val: string) => void;
    filterCurriculum: string;
    uniqueCurriculums: string[];
    onCurriculumChange: (val: string) => void;
}

export const StudentsFilters = ({ filterGrade, uniqueGrades, onGradeChange, filterCurriculum, uniqueCurriculums, onCurriculumChange }: StudentsFiltersProps) => (
    <div className="flex flex-wrap items-center gap-3 p-3 md:p-4 bg-card border border-border shadow-sm rounded-2xl">
        <div className="flex items-center gap-1.5">
            <GraduationCap size={14} className="text-dim" />
            <select
                value={filterGrade}
                aria-label="تصفية حسب المرحلة الدراسية"
                onChange={e => onGradeChange(e.target.value)}
                className="border border-border bg-card dark:bg-hover text-main text-xs font-bold px-2 py-1.5 outline-none focus:border-primary rounded-2xl"
            >
                <option value="">المرحلة الدراسية (الكل)</option>
                {uniqueGrades.map(g => (
                    <option key={g} value={g}>{g}</option>
                ))}
            </select>
        </div>
        <div className="flex items-center gap-1.5">
            <BookOpen size={14} className="text-dim" />
            <select
                value={filterCurriculum}
                aria-label="تصفية حسب المنهج"
                onChange={e => onCurriculumChange(e.target.value)}
                className="border border-border bg-card dark:bg-hover text-main text-xs font-bold px-2 py-1.5 outline-none focus:border-primary rounded-2xl"
            >
                <option value="">المنهج (الكل)</option>
                {uniqueCurriculums.map(c => (
                    <option key={c} value={c}>{c}</option>
                ))}
            </select>
        </div>
    </div>
);
