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
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-card border border-border rounded-2xl">
        <div className="flex items-center gap-2 flex-1">
            <GraduationCap size={14} className="text-muted shrink-0" />
            <select
                value={filterGrade}
                aria-label="تصفية حسب المرحلة الدراسية"
                onChange={e => onGradeChange(e.target.value)}
                className="flex-1 bg-surface border border-border text-main text-xs font-bold px-2.5 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl"
            >
                <option value="">المرحلة (الكل)</option>
                {uniqueGrades.map(g => (
                    <option key={g} value={g}>{g}</option>
                ))}
            </select>
        </div>
        <div className="flex items-center gap-2 flex-1">
            <BookOpen size={14} className="text-muted shrink-0" />
            <select
                value={filterCurriculum}
                aria-label="تصفية حسب المنهج"
                onChange={e => onCurriculumChange(e.target.value)}
                className="flex-1 bg-surface border border-border text-main text-xs font-bold px-2.5 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl"
            >
                <option value="">المنهج (الكل)</option>
                {uniqueCurriculums.map(c => (
                    <option key={c} value={c}>{c}</option>
                ))}
            </select>
        </div>
    </div>
);