import { cn } from '../../lib/utils';
import { ChevronLeft, ArrowLeft, GraduationCap, BookOpen } from 'lucide-react';
import { gradeNames } from './LibraryConfig';
import type { ViewType, GridItem } from './LibraryConfig';
import { useSearchParams } from 'react-router-dom';

interface SelectionGridProps {
    view: ViewType;
    gridItems: GridItem[];
    currentClassrooms: string[];
    currentSubjects: { id: string; name: string; gradient: string }[];
    currentCurriculum: string;
    currentLevel: string;
    selectedGrade: string;
    termLabel: string;
    currentTypeName: string;
    currentCurriculumName: string;
    currentLevelName: string;
    filteredCount: number;
    goBack: () => void;
    onSelectType: (id: string) => void;
    onSelectCurriculum: (id: string) => void;
    onSelectLevel: (id: string) => void;
    onSelectGrade: (id: string) => void;
    onSelectTerm: (term: string) => void;
    onSelectSubject: (id: string) => void;
    isMobile?: boolean;
}

export const SelectionGrid = ({
    view, gridItems, currentClassrooms, currentSubjects,
    currentCurriculum, currentLevel, selectedGrade, termLabel,
    currentTypeName, currentCurriculumName, currentLevelName,
    filteredCount, goBack, onSelectGrade, onSelectTerm, onSelectSubject,
    isMobile
}: SelectionGridProps) => {
    if (isMobile && (view === 'classrooms' || view === 'terms' || view === 'subjects')) {
        return (
            <div className="pb-6">
                <div className="bg-gradient-to-br from-violet-100 via-violet-50 to-white rounded-[32px] p-5 mb-6 shadow-sm border border-violet-100/50 mt-2 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 rounded-full shadow-sm mb-3">
                        <BookOpen size={10} className="text-violet-600" />
                        <span className="text-[9px] font-black text-violet-600">
                            {view === 'classrooms' ? `${currentCurriculumName} — ${currentLevelName}`
                                : view === 'terms' ? `الصف ${gradeNames[selectedGrade]}`
                                : `المواد — ${termLabel}`}
                        </span>
                    </div>
                    <h2 className="text-[17px] font-black text-indigo-950">
                        {view === 'classrooms' ? (<>اختر <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#6C4BFF] to-[#4A2DDB]">الصف الدراسي</span></>)
                            : view === 'terms' ? (<>اختر <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#6C4BFF] to-[#4A2DDB]">الترم</span></>)
                            : (<>اختر <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#6C4BFF] to-[#4A2DDB]">المادة</span></>)}
                    </h2>
                    <p className="text-[10px] text-slate-500 font-medium mt-1">
                        {view === 'classrooms' ? 'اختر الصف للوصول للمحتوى'
                            : view === 'terms' ? 'اختر الترم الدراسي'
                            : `${filteredCount} نتيجة متاحة`}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                    {view === 'classrooms' && currentClassrooms.map((cls, i) => (
                        <button key={cls} onClick={() => onSelectGrade(cls)}
                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-sm active:scale-[0.97] transition-all">
                            <GraduationCap size={18} />
                            <span className="text-[10px] font-black text-center">الصف {gradeNames[cls] || cls}</span>
                        </button>
                    ))}

                    {view === 'terms' && (
                        <>
                            <button onClick={() => onSelectTerm('1')}
                                className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-sm active:scale-[0.97] transition-all">
                                <BookOpen size={18} />
                                <span className="text-[10px] font-black">ترم أول</span>
                            </button>
                            <button onClick={() => onSelectTerm('2')}
                                className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-sm active:scale-[0.97] transition-all">
                                <BookOpen size={18} />
                                <span className="text-[10px] font-black">ترم ثاني</span>
                            </button>
                        </>
                    )}

                    {view === 'subjects' && currentSubjects.map((subj, i) => (
                        <button key={subj.id} onClick={() => { onSelectSubject(subj.id); window.scrollTo(0, 0); }}
                            className={cn("flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gradient-to-br text-white shadow-sm active:scale-[0.97] transition-all", subj.gradient)}>
                            <span className="text-[10px] font-black text-center">{subj.name}</span>
                        </button>
                    ))}

                    <button onClick={goBack}
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white border border-slate-200 text-slate-500 shadow-sm active:scale-[0.97] transition-all">
                        <ArrowLeft size={16} />
                        <span className="text-[10px] font-black">العودة</span>
                    </button>
                </div>
            </div>
        );
    }

    if (!isMobile && (view === 'classrooms' || view === 'terms' || view === 'subjects')) {
        return (
            <>
                <div className="text-center max-w-3xl mx-auto mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50/60 dark:bg-indigo-500/10 backdrop-blur-sm border border-indigo-100 dark:border-indigo-500/20 rounded-2xl mb-4">
                        <BookOpen size={14} className="text-indigo-600 dark:text-indigo-400" />
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-300">
                            {view === 'classrooms' ? `${currentCurriculumName} — ${currentLevelName}`
                                : view === 'terms' ? `الصف ${gradeNames[selectedGrade]}`
                                : `المواد — ${termLabel}`}
                        </span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 mb-3">
                        {view === 'classrooms' ? (<>اختر <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">الصف الدراسي</span></>)
                            : view === 'terms' ? (<>اختر <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">الترم</span></>)
                            : (<>اختر <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">المادة</span></>)}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        {view === 'classrooms' ? 'اختر الصف للوصول للمحتوى'
                            : view === 'terms' ? 'اختر الترم الدراسي'
                            : `${filteredCount} نتيجة متاحة`}
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                        {view === 'classrooms' && currentClassrooms.map((cls, i) => (
                            <div key={cls} className="animate-in zoom-in-95 duration-500" style={{ animationDelay: `${i * 60}ms` }}>
                                <button onClick={() => onSelectGrade(cls)}
                                    className="w-full py-6 px-3 flex flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white border border-white/5 shadow-lg active:scale-[0.97] transition-all">
                                    <GraduationCap size={24} />
                                    <span className="text-sm font-black text-center">الصف {gradeNames[cls] || cls}</span>
                                </button>
                            </div>
                        ))}

                        {view === 'terms' && (
                            <>
                                <div className="animate-in zoom-in-95 duration-500">
                                    <button onClick={() => onSelectTerm('1')}
                                        className="w-full py-6 px-3 flex flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg active:scale-[0.97] transition-all">
                                        <BookOpen size={24} />
                                        <span className="text-sm font-black">ترم أول</span>
                                    </button>
                                </div>
                                <div className="animate-in zoom-in-95 duration-500" style={{ animationDelay: '60ms' }}>
                                    <button onClick={() => onSelectTerm('2')}
                                        className="w-full py-6 px-3 flex flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg active:scale-[0.97] transition-all">
                                        <BookOpen size={24} />
                                        <span className="text-sm font-black">ترم ثاني</span>
                                    </button>
                                </div>
                            </>
                        )}

                        {view === 'subjects' && currentSubjects.map((subj, i) => (
                            <div key={subj.id} className="animate-in zoom-in-95 duration-500" style={{ animationDelay: `${i * 60}ms` }}>
                                <button onClick={() => { onSelectSubject(subj.id); window.scrollTo(0, 0); }}
                                    className={cn("w-full py-6 px-3 flex flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br text-white shadow-lg active:scale-[0.97] transition-all", subj.gradient)}>
                                    <span className="text-sm font-black text-center">{subj.name}</span>
                                </button>
                            </div>
                        ))}

                        <div className="animate-in zoom-in-95 duration-500">
                            <button onClick={goBack}
                                className="w-full py-6 px-3 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 shadow-sm active:scale-[0.97] transition-all">
                                <ArrowLeft size={22} />
                                <span className="text-sm font-black">العودة</span>
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return null;
};
