import { BookOpen, Play } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
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
        <div className="bg-gradient-to-br from-violet-50/80 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 rounded-3xl px-5 pt-4 pb-3 mb-3 shadow-sm border border-violet-100/50 dark:border-slate-800">
            <h2 className="text-xl font-black text-indigo-950 dark:text-indigo-100 leading-tight">
                {view === 'types' ? (
                    <>اختر <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#6C4BFF] to-[#4A2DDB]">الخدمة</span></>
                ) : view === 'curriculums' ? (
                    <>اختر <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#6C4BFF] to-[#4A2DDB]">المنهج</span></>
                ) : (
                    <>اختر <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#6C4BFF] to-[#4A2DDB]">المرحلة</span></>
                )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1.5 leading-relaxed">
                {view === 'types'
                    ? 'اختر ما تريد من كتب او مذكرات مجانا'
                    : view === 'curriculums'
                    ? `تصفح وتحميل ${currentTypeName} لأفضل المناهج التعليمية في الخليج`
                    : `جميع ملفات ${currentCurriculumName} مرتبة ومصنفة لتسهيل الوصول`}
            </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
            {gridItems.map((item: GridItem, i: number) => (
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
                    className={cn("relative flex flex-col items-center justify-center gap-2 p-5 rounded-2xl text-white overflow-hidden shadow-lg active:scale-[0.97] transition-all bg-gradient-to-br", item.gradient)}>
                    <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                        <item.icon size={20} />
                    </div>
                    <span className="text-sm font-black text-center leading-tight">{item.name}</span>
                    {item.sub && <span className="text-[11px] text-white/70 font-bold">{item.sub}</span>}
                </button>
            ))}
        </div>
    </div>
);

export const DesktopHero = ({ view, gridItems, currentTypeName, currentCurriculumName, setSearchParams }: HeroSelectionProps) => (
    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 max-w-5xl mx-auto">
        <div className="w-full lg:w-[55%] text-center lg:text-right">
            <div className="inline-flex animate-in fade-in slide-in-from-top-2 duration-500 items-center gap-2 px-4 py-1.5 bg-indigo-50/60 dark:bg-indigo-500/10 backdrop-blur-sm border border-indigo-100 dark:border-indigo-500/20 rounded-full mb-5">
                <BookOpen size={13} className="text-indigo-600 dark:text-indigo-400" />
                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-300">
                    {view === 'types' ? 'المعرفة بين يديك' : view === 'curriculums' ? `تحميل ${currentTypeName}` : currentCurriculumName}
                </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-slate-900 dark:text-slate-50 mb-4 leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
                {view === 'types' ? (
                    <>مكتبة <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600 dark:from-indigo-400 dark:to-purple-400">دارين</span> التعليمية</>
                ) : view === 'curriculums' ? (
                    <>اختر <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">المنهج</span></>
                ) : (
                    <>اختر <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">المرحلة</span></>
                )}
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0 font-medium animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                {view === 'types'
                    ? 'دليلك الشامل للتفوق الدراسي — أحدث المناهج، ملخصات، وحلول الكتب لجميع المراحل في مناهج الكويت و قطر والامارات والسعودية'
                    : view === 'curriculums'
                    ? `تصفح وتحميل ${currentTypeName} لأفضل المناهج التعليمية في الخليج`
                    : `جميع ملفات ${currentCurriculumName} مرتبة ومصنفة لتسهيل الوصول`}
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto lg:mx-0">
                {gridItems.map((item: GridItem, i: number) => (
                    <div key={item.id} className="animate-in zoom-in-95 duration-500" style={{ animationDelay: `${i * 80}ms` }}>
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
                            className={cn("relative w-full py-4 px-3 flex flex-col items-center justify-center gap-1.5 rounded-2xl text-white overflow-hidden transition-all duration-300 active:scale-[0.97] shadow-lg bg-gradient-to-br", item.gradient)}>
                            <div className="absolute inset-0 bg-white/0 hover:bg-white/10 transition-colors duration-300" />
                            <item.icon size={20} className="relative z-10" />
                            <span className="relative z-10 text-xs sm:text-sm font-black text-center leading-tight">{item.name}</span>
                            {item.sub && <span className="relative z-10 text-[9px] text-white/70 font-bold">{item.sub}</span>}
                        </button>
                    </div>
                ))}
            </div>
        </div>
        <div className="hidden lg:flex w-full lg:w-[45%] justify-center animate-in fade-in slide-in-from-left-8 duration-700 delay-300">
            <div className="relative w-full max-w-[380px] aspect-square flex items-center justify-center">
                <div className="absolute inset-4 border border-dashed border-indigo-500/15 rounded-full" />
                <div className="absolute inset-12 border border-dashed border-purple-500/8 rounded-full" />
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/8 to-purple-600/8 rounded-full blur-3xl" />
                <picture>
                    <source srcSet="/dareen_books_portal_v3.webp" type="image/webp" />
                    <source srcSet="/dareen_books_portal_v3.avif" type="image/avif" />
                    <img src="/dareen_books_portal_v3.png" alt="بوابة دارين التعليمية" width="380" height="380" loading="lazy"
                        className="relative z-10 w-full h-auto object-contain drop-shadow-[0_15px_35px_rgba(79,70,229,0.15)]" />
                </picture>
            </div>
        </div>
    </div>
);
