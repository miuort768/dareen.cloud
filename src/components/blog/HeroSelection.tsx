import { BookOpen, MessageCircle, Send, CheckCircle, Languages, ArrowLeft } from 'lucide-react';
import { directTypes, languages } from './LibraryConfig';
import type { ViewType, GridItem } from './LibraryConfig';
import { useAcademyName } from '../../context/AppContext';
import { useSettingsStore } from '../../store/settingsStore';
import { Image } from '../../shared/components/ui';

interface HeroSelectionProps {
    view: ViewType;
    gridItems: GridItem[];
    currentTypeName: string;
    currentCurriculumName: string;
    setSearchParams: (fn: (prev: URLSearchParams) => URLSearchParams) => void;
    isMobile?: boolean;
}

export const MobileHero = ({ view, gridItems, currentTypeName, currentCurriculumName, setSearchParams }: HeroSelectionProps) => {
    const academyName = useAcademyName();
    const adminPhone = useSettingsStore(s => s.adminPhone);
    const libraryWhatsapp = useSettingsStore(s => s.libraryWhatsapp);
    const libraryTelegram = useSettingsStore(s => s.libraryTelegram);
    const whatsappNumber = adminPhone.replace(/\D/g, '');

    if (view === 'types') {
        return (
            <div className="pb-6">
                {/* Hero Banner */}
                <div className="relative rounded-[1.75rem] overflow-hidden mb-4 bg-primary-deep dark:bg-card border border-border/20">
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-[-50%] start-[-30%] w-[80%] h-[120%] bg-gradient-to-br from-white/[0.04] to-transparent rounded-full blur-[60px]" />
                        <div className="absolute bottom-[-30%] end-[-20%] w-[70%] h-[100%] bg-gradient-to-tl from-accent/8 to-transparent rounded-full blur-[50px]" />
                    </div>

                    <div className="relative p-5">
                        {/* Sponsored badge */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
                                </span>
                                <span className="text-[10px] font-extrabold text-white/90">برعاية {academyName}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <a href={`https://wa.me/${libraryWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('السلام عليكم، أرغب في الاستفسار عن المكتبة التعليمية')}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center transition-all active:scale-95"
                                    aria-label="واتساب">
                                    <MessageCircle size={13} className="text-white/70" />
                                </a>
                                <a href={libraryTelegram.startsWith('http') ? libraryTelegram : `https://t.me/${libraryTelegram}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center transition-all active:scale-95"
                                    aria-label="تيليجرام">
                                    <Send size={13} className="text-white/70" />
                                </a>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="min-w-0">
                            <h1 className="text-xl font-black text-on-primary leading-tight mb-1.5 font-heading">
                                مكتبة <span className="text-accent">{academyName}</span>
                            </h1>
                            <p className="text-[11px] text-white/50 leading-relaxed mb-4 font-medium">
                                دليلك الشامل للتفوق الدراسي — أحدث المناهج، مذكرات، ملخصات، وحلول الكتب لجميع المراحل في الكويت وقطر والإمارات والسعودية.
                            </p>
                            <div className="flex items-center gap-2">
                                <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في حجز حصة تجريبية مجانية')}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="flex-1 inline-flex items-center justify-center gap-2 bg-accent text-on-accent text-[11px] font-extrabold px-5 py-2.5 rounded-xl hover:bg-accent-hover transition-all active:scale-[0.97] shadow-[0_4px_20px_rgba(212,175,55,0.3)]">
                                    طلب حصة مجانية فردية
                                </a>
                                <a href="#mobile-categories"
                                    className="flex-1 inline-flex items-center justify-center gap-2 bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/10 text-white text-[11px] font-extrabold px-5 py-2.5 rounded-xl hover:bg-white/15 transition-all active:scale-[0.97]">
                                    تصفح الدورات
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Free download card */}
                <div className="rounded-2xl bg-card border border-border p-4 mb-3 shadow-elevation-1">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-success-soft flex items-center justify-center">
                            <CheckCircle size={15} className="text-success" />
                        </div>
                        <div>
                            <h3 className="text-sm font-extrabold text-main">تحميل مجاني بدون إعلانات</h3>
                            <p className="text-[10px] text-muted font-medium">اختر ما تريد من كتب أو مذكرات مجاناً</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <a href={`https://wa.me/${libraryWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('السلام عليكم، أريد الاستفسار عن المكتبة')}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-success-soft text-success text-[11px] font-extrabold py-2.5 rounded-xl hover:bg-success-light transition-all active:scale-[0.97]">
                            <MessageCircle size={13} />
                            واتساب
                        </a>
                        <a href={libraryTelegram.startsWith('http') ? libraryTelegram : `https://t.me/${libraryTelegram}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-info-soft text-info text-[11px] font-extrabold py-2.5 rounded-xl hover:bg-info-light transition-all active:scale-[0.97]">
                            <Send size={13} />
                            تيليجرام
                        </a>
                    </div>
                </div>

                {/* Category buttons */}
                <div id="mobile-categories" className="grid grid-cols-2 gap-2.5 mb-3">
                    {gridItems.map((item: GridItem) => (
                        <button type="button" key={item.id} onClick={() => {
                            setSearchParams(prev => {
                                const next = new URLSearchParams(prev);
                                if (view === 'types') {
                                    if (item.id === 'foundation') {
                                        next.set('type', item.id); next.set('view', 'languages'); ['curriculum','level','grade','term','subject'].forEach(k => next.delete(k));
                                    } else if (directTypes.includes(item.id)) {
                                        next.set('type', item.id); next.set('view', 'results'); ['curriculum','level','grade','term','subject'].forEach(k => next.delete(k));
                                    } else {
                                        next.set('type', item.id); next.set('view', 'curriculums'); ['level','grade','term','subject'].forEach(k => next.delete(k));
                                    }
                                }
                                return next;
                            });
                        }}
                            className="relative flex flex-col items-center justify-center gap-2.5 p-5 rounded-2xl bg-card border border-border text-main overflow-hidden shadow-sm active:scale-[0.97] transition-all duration-200 hover:shadow-md hover:border-primary/30">
                            <div className="w-11 h-11 rounded-xl bg-primary-soft flex items-center justify-center">
                                <item.icon size={20} className="text-primary" />
                            </div>
                            <span className="text-sm font-extrabold text-center leading-tight">{item.name}</span>
                            {item.sub && <span className="text-[10px] text-muted font-bold">{item.sub}</span>}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // For other views (curriculums, grades, languages), show selection grid
    return (
        <div className="pb-6">
            <div className="bg-gradient-to-br from-primary via-primary-deep to-primary dark:from-card dark:via-card dark:to-card rounded-3xl px-5 pt-5 pb-4 mb-4 border border-primary/30 dark:border-border shadow-lg shadow-primary/10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full mb-3">
                    <BookOpen size={10} className="text-on-primary" />
                    <span className="text-[10px] font-extrabold text-on-primary">
                        {view === 'curriculums' ? currentTypeName : view === 'languages' ? 'تعلم اللغة' : currentCurriculumName}
                    </span>
                </div>
                <h2 className="text-xl font-black text-on-primary leading-tight mb-1">
                    {view === 'curriculums' ? (
                        <>اختر <span className="text-on-primary/80">المنهج</span></>
                    ) : view === 'languages' ? (
                        <>اختر <span className="text-on-primary/80">اللغة</span></>
                    ) : (
                        <>اختر <span className="text-on-primary/80">المرحلة</span></>
                    )}
                </h2>
                <p className="text-xs text-on-primary/70 font-medium leading-relaxed">
                    {view === 'curriculums'
                        ? `تصفح وتحميل ${currentTypeName} لأفضل المناهج`
                        : view === 'languages'
                        ? 'اختر اللغة التي تريد تعلمها'
                        : `جميع ملفات ${currentCurriculumName} مرتبة ومصنفة`}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-5">
                {(view === 'languages' ? languages.map(l => ({ ...l, icon: l.icon })) : gridItems).map((item: GridItem) => (
                    <button type="button" key={item.id} onClick={() => {
                        setSearchParams(prev => {
                            const next = new URLSearchParams(prev);
                            if (view === 'curriculums') { next.set('curriculum', item.id); next.set('view', 'grades'); ['grade','term','subject'].forEach(k => next.delete(k)); }
                            else if (view === 'languages') { next.set('language', item.id); next.set('view', 'language-sections'); ['curriculum','level','grade','term','subject'].forEach(k => next.delete(k)); }
                            else { next.set('level', item.id); next.set('view', 'classrooms'); ['term','subject'].forEach(k => next.delete(k)); }
                            return next;
                        });
                    }}
                        className="relative flex flex-col items-center justify-center gap-2.5 p-5 rounded-2xl bg-card border border-border text-main overflow-hidden shadow-sm active:scale-[0.97] transition-all duration-200 hover:shadow-md hover:border-primary/30">
                        <div className="w-11 h-11 rounded-xl bg-primary-soft flex items-center justify-center">
                            <item.icon size={20} className="text-primary" />
                        </div>
                        <span className="text-sm font-extrabold text-center leading-tight">{item.name}</span>
                        {item.sub && <span className="text-[10px] text-muted font-bold">{item.sub}</span>}
                    </button>
                ))}
            </div>
        </div>
    );
};

export const DesktopHero = ({ view, gridItems, currentTypeName, currentCurriculumName, setSearchParams }: HeroSelectionProps) => {
    const academyName = useAcademyName();
    const adminPhone = useSettingsStore(s => s.adminPhone);
    const whatsappNumber = adminPhone.replace(/\D/g, '');

    if (view === 'types') {
        return (
            <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-10 py-8 lg:py-10">
                {/* Hero Section */}
                <section className="relative overflow-hidden rounded-2xl lg:rounded-none bg-gradient-to-bl from-primary-deep via-primary to-primary-deep dark:from-card dark:via-card dark:to-card min-h-[420px] border border-border/20">
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-[-40%] start-[-15%] w-[70%] h-[120%] bg-gradient-to-br from-white/[0.04] to-transparent rounded-full blur-[100px] animate-[pulse_8s_ease-in-out_infinite]" />
                        <div className="absolute bottom-[-30%] end-[-10%] w-[60%] h-[100%] bg-gradient-to-tl from-accent/10 to-transparent rounded-full blur-[80px] animate-[pulse_6s_ease-in-out_infinite_1s]" />
                        <div className="absolute inset-0 opacity-[0.04]"
                            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                    </div>

                    <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_380px] min-h-[420px]">
                        {/* Left content */}
                        <div className="relative z-10 p-8 lg:p-14 lg:pe-10 flex flex-col justify-center">
                            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full mb-6 w-fit">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                                </span>
                                <span className="text-[11px] font-extrabold text-white/90 tracking-wide">مركز ملفات {academyName}</span>
                            </div>

                            <h1 className="text-4xl xl:text-5xl 2xl:text-[3.5rem] font-heading font-black text-on-primary leading-[1.1] mb-5 max-w-xl">
                                مركز ملفات
                                <span className="relative inline-block mx-3">
                                    <span className="relative z-10 text-accent">{academyName}</span>
                                    <span className="absolute -bottom-1 inset-x-0 h-3 bg-accent/20 rounded-full -z-0 blur-[2px]" />
                                </span>
                                <br />السابعة
                            </h1>

                            <p className="text-base lg:text-lg text-white/60 font-medium leading-relaxed mb-8 max-w-md">
                                دليلك الشامل للتفوق الدراسي — أحدث المناهج، مذكرات، ملخصات، وحلول الكتب لجميع المراحل
                                في الكويت وقطر والإمارات والسعودية.
                            </p>

                            {/* Action buttons */}
                            <div className="flex items-center gap-3 mb-8">
                                <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في حجز حصة تجريبية مجانية')}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 bg-accent text-on-accent text-sm font-extrabold px-6 py-3 rounded-xl hover:bg-accent-hover transition-all active:scale-[0.97] shadow-[0_4px_20px_rgba(212,175,55,0.3)]">
                                    طلب حصة مجانية
                                </a>
                                <a href="#library-categories"
                                    className="inline-flex items-center justify-center gap-2 bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/10 text-white text-sm font-extrabold px-6 py-3 rounded-xl hover:bg-white/15 transition-all active:scale-[0.97]">
                                    تصفح الدورات
                                </a>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-8">
                                {[
                                    { label: 'مادة تعليمية', value: '١٠٠+' },
                                    { label: 'منهج خليجي', value: '٦' },
                                    { label: 'دولة مستهدفة', value: '٦' },
                                ].map((stat, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="text-2xl font-black font-heading text-accent">{stat.value}</span>
                                        <span className="text-[11px] font-bold text-white/40 leading-tight max-w-[60px]">{stat.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right image area */}
                        <div className="relative min-h-[250px] lg:min-h-full overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/[0.03] to-white/[0.06] pointer-events-none" />
                            <div className="absolute top-[15%] end-[10%] w-56 h-56 bg-accent/10 rounded-full blur-[80px] pointer-events-none animate-[pulse_7s_ease-in-out_infinite]" />

                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-[300px] h-[300px] lg:w-[350px] lg:h-[350px] rounded-full border border-dashed border-white/[0.06] animate-[spin_30s_linear_infinite]" />
                                <div className="absolute w-[240px] h-[240px] lg:w-[290px] lg:h-[290px] rounded-full border border-dashed border-accent/[0.08] animate-[spin_22s_linear_infinite_reverse]" />
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center p-8 lg:p-12">
                                <div className="relative w-full h-full max-w-[300px]">
                                    <Image
                                        src="/bbook.webp"
                                        alt={`بوابة ${academyName} التعليمية`}
                                        className="absolute inset-0"
                                        imgClassName="object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                                        withSkeleton
                                    />
                                </div>
                            </div>

                            {/* Floating cards */}
                            <div className="absolute top-[10%] start-[5%] bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.15)] animate-[float_6s_ease-in-out_infinite] pointer-events-none">
                                <div className="flex items-center gap-2.5">
                                    <span className="w-8 h-8 rounded-xl bg-success/20 flex items-center justify-center">
                                        <CheckCircle size={14} className="text-success" />
                                    </span>
                                    <div>
                                        <span className="block text-[11px] font-extrabold text-white">حلول معتمدة</span>
                                        <span className="block text-[9px] text-white/40">١٠٠+ كتاب</span>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute bottom-[15%] end-[3%] bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.15)] animate-[float_7s_ease-in-out_infinite_1s] pointer-events-none">
                                <div className="flex items-center gap-2.5">
                                    <span className="w-8 h-8 rounded-xl bg-info/20 flex items-center justify-center">
                                        <Languages size={14} className="text-info" />
                                    </span>
                                    <div>
                                        <span className="block text-[11px] font-extrabold text-white">تعلم اللغة</span>
                                        <span className="block text-[9px] text-white/40">٤ لغات متاحة</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom text */}
                    <div className="relative border-t border-white/10 px-8 py-4">
                        <p className="text-center text-[11px] text-white/40 font-medium">
                            نقدم تجربة تعليمية متكاملة تناسب المناهج الخليجية المختلفة | يسعدنا انضمامك إلى العائلة
                        </p>
                    </div>
                </section>

                {/* Categories Section */}
                <section id="library-categories" className="mt-14">
                    <div className="flex items-end justify-between gap-4 mb-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-soft border border-primary/10 rounded-full mb-3">
                                <span className="text-[10px] font-extrabold text-primary">تصفح حسب القسم</span>
                            </div>
                            <h2 className="text-2xl lg:text-3xl font-heading font-black text-main">الفئات الأكثر قراءة</h2>
                            <p className="text-sm text-muted font-medium mt-1.5">اختر القسم الذي يناسب احتياجك التعليمي</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        {gridItems.map((item: GridItem) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                    setSearchParams(prev => {
                                        const next = new URLSearchParams(prev);
                                        if (item.id === 'foundation') {
                                            next.set('type', item.id); next.set('view', 'languages'); ['curriculum','level','grade','term','subject'].forEach(k => next.delete(k));
                                        } else if (directTypes.includes(item.id)) {
                                            next.set('type', item.id); next.set('view', 'results'); ['curriculum','level','grade','term','subject'].forEach(k => next.delete(k));
                                        } else {
                                            next.set('type', item.id); next.set('view', 'curriculums'); ['level','grade','term','subject'].forEach(k => next.delete(k));
                                        }
                                        return next;
                                    });
                                }}
                                className="group relative overflow-hidden rounded-2xl lg:rounded-none border border-border bg-card p-5 text-start transition-all duration-300 hover:-translate-y-1 hover:shadow-elevation-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center bg-primary-soft transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                                        <item.icon size={22} className="text-primary" />
                                    </span>
                                </div>
                                <h3 className="text-base font-extrabold text-main group-hover:text-primary transition-colors duration-300 mb-1">{item.name}</h3>
                                {item.sub && <p className="text-[11px] text-muted font-medium leading-relaxed mb-3">{item.sub}</p>}
                                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary transition-all duration-300 group-hover:gap-2.5">
                                    تصفح المحتوى
                                    <ArrowLeft size={12} className="transition-transform duration-300 group-hover:-translate-x-1" />
                                </span>
                            </button>
                        ))}
                    </div>
                </section>
            </div>
        );
    }

    // For other views (curriculums, grades, languages)
    return (
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 max-w-5xl mx-auto">
            <div className="w-full lg:w-[55%] text-center lg:text-start">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-soft border border-primary/20 rounded-2xl mb-5">
                    <BookOpen size={13} className="text-primary" />
                    <span className="text-xs font-extrabold text-primary">
                        {view === 'curriculums' ? `تحميل ${currentTypeName}` : view === 'languages' ? 'تعلم اللغة' : currentCurriculumName}
                    </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-main mb-4 leading-tight">
                    {view === 'curriculums' ? (
                        <>اختر <span className="text-primary">المنهج</span></>
                    ) : view === 'languages' ? (
                        <>اختر <span className="text-primary">اللغة</span></>
                    ) : (
                        <>اختر <span className="text-primary">المرحلة</span></>
                    )}
                </h1>
                <p className="text-sm sm:text-base text-muted leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0 font-medium">
                    {view === 'curriculums'
                        ? `تصفح وتحميل ${currentTypeName} لأفضل المناهج التعليمية في الخليج`
                        : view === 'languages'
                        ? 'اختر اللغة التي تريد تعلمها وتصفح المحتوى المتاح'
                        : `جميع ملفات ${currentCurriculumName} مرتبة ومصنفة لتسهيل الوصول`}
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto lg:mx-0">
                    {(view === 'languages' ? languages.map(l => ({ ...l, icon: l.icon })) : gridItems).map((item: GridItem) => (
                        <div key={item.id}>
                            <button type="button" onClick={() => {
                                setSearchParams(prev => {
                                    const next = new URLSearchParams(prev);
                                    if (view === 'curriculums') { next.set('curriculum', item.id); next.set('view', 'grades'); ['grade','term','subject'].forEach(k => next.delete(k)); }
                                    else if (view === 'languages') { next.set('language', item.id); next.set('view', 'language-sections'); ['curriculum','level','grade','term','subject'].forEach(k => next.delete(k)); }
                                    else { next.set('level', item.id); next.set('view', 'classrooms'); ['term','subject'].forEach(k => next.delete(k)); }
                                    return next;
                                });
                            }}
                                className="relative w-full py-5 px-4 flex flex-col items-center justify-center gap-2 rounded-2xl bg-card border border-border text-main overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevation-2 hover:border-primary/30 active:scale-[0.97]">
                                <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
                                    <item.icon size={18} className="text-primary" />
                                </div>
                                <span className="text-sm font-extrabold text-center leading-tight">{item.name}</span>
                                {item.sub && <span className="text-[11px] text-muted font-medium">{item.sub}</span>}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="hidden lg:flex w-full lg:w-[45%] justify-center">
                <div className="relative w-full max-w-[420px] aspect-[3/4] flex items-center justify-center">
                    <div className="absolute inset-[12%] border-[1.5px] border-dashed border-primary/30 rounded-full animate-spin-slow pointer-events-none"></div>
                    <div className="absolute inset-[17%] border-[1.5px] border-dashed border-accent/20 rounded-full animate-reverse-spin-slow pointer-events-none"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-primary/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
                    <picture className="w-full h-full flex items-center justify-center">
                        <source srcSet="/book3.webp" type="image/webp" />
                        <source srcSet="/book3.avif" type="image/avif" />
                        <img src="/book3.png" alt="بوابة دارين التعليمية" width="380" height="380" loading="lazy"
                            className="relative z-10 w-4/5 h-4/5 object-contain drop-shadow-lg" />
                    </picture>
                </div>
            </div>
        </div>
    );
};
