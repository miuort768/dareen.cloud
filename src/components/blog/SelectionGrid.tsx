import { cn } from '../../lib/utils';
import { ArrowLeft, GraduationCap, BookOpen } from 'lucide-react';
import { gradeNames } from './LibraryConfig';
import type { ViewType } from './LibraryConfig';

interface SelectionGridProps {
    view: ViewType;
    currentClassrooms: string[];
    currentSubjects: { id: string; name: string; gradient: string }[];
    selectedGrade: string;
    termLabel: string;
    currentCurriculumName: string;
    currentLevelName: string;
    filteredCount: number;
    goBack: () => void;
    onSelectGrade: (id: string) => void;
    onSelectTerm: (term: string) => void;
    onSelectSubject: (id: string) => void;
    isMobile?: boolean;
}

export const SelectionGrid = ({
    view, currentClassrooms, currentSubjects,
    selectedGrade, termLabel,
    currentCurriculumName, currentLevelName,
    filteredCount, goBack, onSelectGrade, onSelectTerm, onSelectSubject,
    isMobile
}: SelectionGridProps) => {

    const headerLabel = view === 'classrooms'
        ? `${currentCurriculumName} — ${currentLevelName}`
        : view === 'terms' ? `الصف ${gradeNames[selectedGrade]}`
        : `المواد — ${termLabel}`;

    const headerTitle = view === 'classrooms' ? 'الصف الدراسي'
        : view === 'terms' ? 'الترم'
        : 'المادة';

    const headerSubtitle = view === 'classrooms' ? 'اختر الصف للوصول للمحتوى'
        : view === 'terms' ? 'اختر الترم الدراسي'
        : `${filteredCount} نتيجة متاحة`;

    const headerIcon = view === 'classrooms' ? GraduationCap : BookOpen;

    if (isMobile && (view === 'classrooms' || view === 'terms' || view === 'subjects')) {
        return (
            <div className="pb-6">
                {/* Header Card */}
                <div className="bg-card rounded-[1.5rem] p-5 mb-5 border border-border shadow-elevation-1 mt-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-soft border border-primary/15 rounded-xl mb-3">
                        {(() => { const Icon = headerIcon; return <Icon size={12} className="text-primary" />; })()}
                        <span className="text-[11px] font-extrabold text-primary">{headerLabel}</span>
                    </div>
                    <h2 className="text-base font-black text-main">
                        اختر <span className="text-primary">{headerTitle}</span>
                    </h2>
                    <p className="text-[11px] text-muted font-medium mt-1">{headerSubtitle}</p>
                </div>

                {/* Book Image */}
                <div className="mb-4">
                    <picture>
                        <source srcSet="/bbook.webp" type="image/webp" />
                        <source srcSet="/bbook.avif" type="image/avif" />
                        <img src="/bbook.webp" alt="بوابة دارين التعليمية" loading="lazy" className="w-full max-w-[160px] mx-auto h-auto block opacity-80" />
                    </picture>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                    {view === 'classrooms' && currentClassrooms.map((cls) => (
                        <button key={cls} onClick={() => onSelectGrade(cls)}
                            className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl bg-card border border-border text-main active:scale-[0.97] transition-all duration-200 hover:shadow-elevation-1 hover:border-primary/20">
                            <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
                                <GraduationCap size={18} className="text-primary" />
                            </div>
                            <span className="text-xs font-extrabold text-center">الصف {gradeNames[cls] || cls}</span>
                        </button>
                    ))}

                    {view === 'terms' && (
                        <>
                            <button onClick={() => onSelectTerm('1')}
                                className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl bg-card border border-border text-main active:scale-[0.97] transition-all duration-200 hover:shadow-elevation-1 hover:border-primary/20">
                                <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
                                    <BookOpen size={18} className="text-primary" />
                                </div>
                                <span className="text-xs font-extrabold">ترم أول</span>
                            </button>
                            <button onClick={() => onSelectTerm('2')}
                                className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl bg-card border border-border text-main active:scale-[0.97] transition-all duration-200 hover:shadow-elevation-1 hover:border-primary/20">
                                <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
                                    <BookOpen size={18} className="text-primary" />
                                </div>
                                <span className="text-xs font-extrabold">ترم ثاني</span>
                            </button>
                        </>
                    )}

                    {view === 'subjects' && currentSubjects.map((subj) => (
                        <button key={subj.id} onClick={() => { onSelectSubject(subj.id); window.scrollTo(0, 0); }}
                            className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl bg-card border border-border text-main active:scale-[0.97] transition-all duration-200 hover:shadow-elevation-1 hover:border-primary/20">
                            <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
                                <BookOpen size={18} className="text-primary" />
                            </div>
                            <span className="text-xs font-extrabold text-center">{subj.name}</span>
                        </button>
                    ))}

                    <button onClick={goBack}
                        className="flex flex-row items-center justify-center gap-2 p-3 rounded-2xl bg-surface border border-border text-muted hover:text-main hover:border-primary/20 active:scale-[0.97] transition-all duration-200">
                        <ArrowLeft size={14} />
                        <span className="text-xs font-extrabold">العودة</span>
                    </button>
                </div>
            </div>
        );
    }

    if (!isMobile && (view === 'classrooms' || view === 'terms' || view === 'subjects')) {
        return (
            <>
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-soft border border-primary/15 rounded-xl mb-4">
                        {(() => { const Icon = headerIcon; return <Icon size={13} className="text-primary" />; })()}
                        <span className="text-xs font-extrabold text-primary">{headerLabel}</span>
                    </div>
                    <h2 className="text-2xl font-heading font-black text-main mb-3">
                        اختر <span className="text-primary">{headerTitle}</span>
                    </h2>
                    <p className="text-sm text-muted font-medium">{headerSubtitle}</p>
                </div>

                {/* Book Image */}
                <div className="mb-6">
                    <picture>
                        <source srcSet="/bbook.webp" type="image/webp" />
                        <source srcSet="/bbook.avif" type="image/avif" />
                        <img src="/bbook.webp" alt="بوابة دارين التعليمية" loading="lazy" className="w-auto mx-auto h-auto block max-w-[240px] opacity-80" />
                    </picture>
                </div>

                {/* Grid */}
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                        {view === 'classrooms' && currentClassrooms.map((cls) => (
                            <button key={cls} onClick={() => onSelectGrade(cls)}
                                className="w-full py-6 px-3 flex flex-col items-center justify-center gap-3 rounded-2xl bg-card border border-border text-main hover:shadow-elevation-1 hover:border-primary/20 active:scale-[0.97] transition-all duration-200">
                                <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center">
                                    <GraduationCap size={22} className="text-primary" />
                                </div>
                                <span className="text-sm font-extrabold text-center">الصف {gradeNames[cls] || cls}</span>
                            </button>
                        ))}

                        {view === 'terms' && (
                            <>
                                <button onClick={() => onSelectTerm('1')}
                                    className="w-full py-6 px-3 flex flex-col items-center justify-center gap-3 rounded-2xl bg-card border border-border text-main hover:shadow-elevation-1 hover:border-primary/20 active:scale-[0.97] transition-all duration-200">
                                    <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center">
                                        <BookOpen size={22} className="text-primary" />
                                    </div>
                                    <span className="text-sm font-extrabold">ترم أول</span>
                                </button>
                                <button onClick={() => onSelectTerm('2')}
                                    className="w-full py-6 px-3 flex flex-col items-center justify-center gap-3 rounded-2xl bg-card border border-border text-main hover:shadow-elevation-1 hover:border-primary/20 active:scale-[0.97] transition-all duration-200">
                                    <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center">
                                        <BookOpen size={22} className="text-primary" />
                                    </div>
                                    <span className="text-sm font-extrabold">ترم ثاني</span>
                                </button>
                            </>
                        )}

                        {view === 'subjects' && currentSubjects.map((subj) => (
                            <button key={subj.id} onClick={() => { onSelectSubject(subj.id); window.scrollTo(0, 0); }}
                                className="w-full py-6 px-3 flex flex-col items-center justify-center gap-3 rounded-2xl bg-card border border-border text-main hover:shadow-elevation-1 hover:border-primary/20 active:scale-[0.97] transition-all duration-200">
                                <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center">
                                    <BookOpen size={22} className="text-primary" />
                                </div>
                                <span className="text-sm font-extrabold text-center">{subj.name}</span>
                            </button>
                        ))}

                        <button onClick={goBack}
                            className="w-full py-5 px-3 flex flex-row items-center justify-center gap-3 rounded-2xl bg-surface border border-border text-muted hover:text-main hover:border-primary/20 active:scale-[0.97] transition-all duration-200">
                            <ArrowLeft size={16} />
                            <span className="text-sm font-extrabold">العودة</span>
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return null;
};
