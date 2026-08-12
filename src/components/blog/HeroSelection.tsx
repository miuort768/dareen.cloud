import { BookOpen } from 'lucide-react';
import { cn } from '../../lib/utils';
import { directTypes } from './LibraryConfig';
import type { ViewType, GridItem } from './LibraryConfig';

interface HeroSelectionProps {
    view: ViewType;
    gridItems: GridItem[];
    currentTypeName: string;
    currentCurriculumName: string;
    setSearchParams: (fn: (prev: URLSearchParams) => URLSearchParams) => void;
    isMobile?: boolean;
}

export const MobileHero = ({ view, gridItems, currentTypeName, currentCurriculumName, setSearchParams }: HeroSelectionProps) => (
    <div className="pb-6">
        {/* Hero Card */}
        <div className="bg-card rounded-[1.5rem] px-5 pt-5 pb-4 mb-4 border border-border shadow-elevation-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-soft dark:bg-primary/15 border border-primary/15 rounded-xl mb-3">
                <BookOpen size={12} className="text-primary" />
                <span className="text-[11px] font-extrabold text-primary">
                    {view === 'types' ? 'المعرفة بين يديك' : view === 'curriculums' ? currentTypeName : currentCurriculumName}
                </span>
            </div>
            <h2 className="text-xl font-black text-main leading-tight mb-1.5">
                {view === 'types' ? (
                    <>تحميل مجاني <span className="text-primary">بدون إعلانات</span></>
                ) : view === 'curriculums' ? (
                    <>اختر <span className="text-primary">المنهج</span></>
                ) : (
                    <>اختر <span className="text-primary">المرحلة</span></>
                )}
            </h2>
            <p className="text-xs text-muted dark:text-white/70 font-medium leading-relaxed">
                {view === 'types'
                    ? 'اختر ما تريد من كتب أو مذكرات مجاناً'
                    : view === 'curriculums'
                    ? `تصفح وتحميل ${currentTypeName} لأفضل المناهج`
                    : `جميع ملفات ${currentCurriculumName} مرتبة ومصنفة`}
            </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
            {gridItems.map((item: GridItem) => (
                <button key={item.id} onClick={() => {
                    setSearchParams(prev => {
                        const next = new URLSearchParams(prev);
                        if (view === 'types') {
                            if (directTypes.includes(item.id)) {
                                next.set('type', item.id); next.set('view', 'results'); ['curriculum','level','grade','term','subject'].forEach(k => next.delete(k));
                            } else {
                                next.set('type', item.id); next.set('view', 'curriculums'); ['level','grade','term','subject'].forEach(k => next.delete(k));
                            }
                        } else if (view === 'curriculums') { next.set('curriculum', item.id); next.set('view', 'grades'); ['grade','term','subject'].forEach(k => next.delete(k)); }
                        else { next.set('level', item.id); next.set('view', 'classrooms'); ['term','subject'].forEach(k => next.delete(k)); }
                        return next;
                    });
                }}
                    className="relative flex flex-col items-center justify-center gap-2.5 p-5 rounded-2xl bg-card border border-border text-main overflow-hidden shadow-sm active:scale-[0.97] transition-all duration-200 hover:shadow-elevation-1 hover:border-primary/20">
                    <div className="w-11 h-11 rounded-xl bg-primary-soft flex items-center justify-center">
                        <item.icon size={20} className="text-primary" />
                    </div>
                    <span className="text-sm font-extrabold text-center leading-tight">{item.name}</span>
                    {item.sub && <span className="text-[10px] text-muted dark:text-white/60 font-bold">{item.sub}</span>}
                </button>
            ))}
        </div>
    </div>
);

export const DesktopHero = ({ view, gridItems, currentTypeName, currentCurriculumName, setSearchParams }: HeroSelectionProps) => (
    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 max-w-5xl mx-auto">
        <div className="w-full lg:w-[55%] text-center lg:text-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary-soft dark:bg-primary/15 border border-primary/15 rounded-xl mb-5">
                <BookOpen size={12} className="text-primary" />
                <span className="text-[11px] font-extrabold text-primary">
                    {view === 'types' ? 'المعرفة بين يديك' : view === 'curriculums' ? `تحميل ${currentTypeName}` : currentCurriculumName}
                </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-main mb-4 leading-tight">
                {view === 'types' ? (
                    <>مكتبة <span className="text-primary">دارين</span> التعليمية</>
                ) : view === 'curriculums' ? (
                    <>اختر <span className="text-primary">المنهج</span></>
                ) : (
                    <>اختر <span className="text-primary">المرحلة</span></>
                )}
            </h1>
            <p className="text-sm sm:text-base text-muted dark:text-white/70 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0 font-medium">
                {view === 'types'
                    ? 'دليلك الشامل للتفوق الدراسي — أحدث المناهج، ملخصات، وحلول الكتب لجميع المراحل في مناهج الكويت وقطر والإمارات والسعودية'
                    : view === 'curriculums'
                    ? `تصفح وتحميل ${currentTypeName} لأفضل المناهج التعليمية في الخليج`
                    : `جميع ملفات ${currentCurriculumName} مرتبة ومصنفة لتسهيل الوصول`}
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto lg:mx-0">
                {gridItems.map((item: GridItem) => (
                    <div key={item.id}>
                        <button onClick={() => {
                            setSearchParams(prev => {
                                const next = new URLSearchParams(prev);
                                if (view === 'types') {
                                    if (directTypes.includes(item.id)) {
                                        next.set('type', item.id); next.set('view', 'results'); ['curriculum','level','grade','term','subject'].forEach(k => next.delete(k));
                                    } else {
                                        next.set('type', item.id); next.set('view', 'curriculums'); ['level','grade','term','subject'].forEach(k => next.delete(k));
                                    }
                                } else if (view === 'curriculums') { next.set('curriculum', item.id); next.set('view', 'grades'); ['grade','term','subject'].forEach(k => next.delete(k)); }
                                else { next.set('level', item.id); next.set('view', 'classrooms'); ['term','subject'].forEach(k => next.delete(k)); }
                                return next;
                            });
                        }}
                            className="relative w-full py-5 px-4 flex flex-col items-center justify-center gap-2 rounded-2xl bg-card border border-border text-main overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm hover:border-primary/30 active:scale-[0.97]">
                            <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
                                <item.icon size={18} className="text-primary" />
                            </div>
                            <span className="text-sm font-extrabold text-center leading-tight">{item.name}</span>
                            {item.sub && <span className="text-[11px] text-muted dark:text-white/60 font-medium">{item.sub}</span>}
                        </button>
                    </div>
                ))}
            </div>
        </div>
        <div className="hidden lg:flex w-full lg:w-[45%] justify-center">
            <div className="relative w-full max-w-[420px] aspect-[3/4] flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/3 rounded-full pointer-events-none" />
                <picture className="w-full h-full flex items-center justify-center">
                    <source srcSet="/book3.webp" type="image/webp" />
                    <source srcSet="/book3.avif" type="image/avif" />
                    <img src="/book3.png" alt="بوابة دارين التعليمية" width="380" height="380" loading="lazy"
                        className="relative z-10 w-4/5 h-4/5 object-contain" />
                </picture>
            </div>
        </div>
    </div>
);
