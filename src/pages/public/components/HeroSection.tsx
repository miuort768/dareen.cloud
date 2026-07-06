import { Link } from 'react-router-dom';
import { Play, ArrowLeft, Star } from 'lucide-react';

interface HeroSectionProps {
    typewriterText: string;
    whatsappNumber: string;
    bannersArray: string[];
}

export const HeroSection = ({ typewriterText, whatsappNumber, bannersArray }: HeroSectionProps) => {
    return (
        <section className="relative pt-20 md:pt-28 pb-4 md:pb-4 overflow-hidden bg-white dark:bg-card">
            <div className="absolute top-0 start-0 w-64 h-64 bg-accent/5 dark:bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 end-0 w-48 h-48 bg-primary/5 dark:bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto bg-gradient-to-br from-primary-soft via-primary-soft to-card dark:from-card dark:via-card dark:to-card rounded-2xl shadow-sm border border-primary/30 dark:border-border overflow-hidden">
                    <div className="flex flex-col-reverse lg:flex-row items-center gap-2 lg:gap-6 p-6 md:p-10">
                        <div className="lg:w-[60%] text-center z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-primary-soft border border-primary/50 dark:border-primary rounded-full mb-4 mx-auto mt-4 lg:mt-0">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                <span className="text-primary font-bold text-micro sm:text-xs">منصة تعليم عن بعد رائدة في السعودية والكويت والخليج</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-heading font-black text-main leading-none mb-0 relative">
                                <span className="sr-only">دارين السابعة للتعليم والتدريب عن بعد - المنصة رقم واحد للدروس الخصوصية وتحفيظ القرآن في السعودية، الكويت، الامارات، قطر، وسلطنة عمان ومملكة البحرين - دروس خصوصية في الدوحة والريان ومسقط وصلالة والمنامة والمحرق</span>
                                <span className="block mb-0 min-h-[1.1em] aria-hidden">{typewriterText || '\u00A0'}<span className="inline-block animate-pulse border-e-4 border-primary dark:border-white me-1 h-[0.9em] align-middle"></span></span>
                                <span className="text-xl sm:text-2xl lg:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent block -mt-1 py-1 aria-hidden">
                                    للتعليم والتدريب عن بعد
                                </span>
                            </h1>
                            <p className="text-xs sm:text-xs text-muted leading-normal mb-5 max-w-[320px] sm:max-w-full mx-auto px-0 font-medium">
                                أفضل منصة تعليم عن بعد في السعودية، الكويت، الإمارات، قطر وعمان والبحرين.<br />دروس خصوصية، قدرات وتحصيلي، تحفيظ قرآن، وتأسيس للمناهج الخليجية مع نخبة المعلمين.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                                <Link
                                    to="/courses"
                                    onClick={() => window.scrollTo(0, 0)}
                                    className="px-6 py-3 sm:px-10 sm:py-4 bg-gradient-to-r from-[var(--bg-primary)] to-[var(--bg-primary)] text-on-primary font-bold text-base sm:text-lg shadow-lg dark:shadow-primary/20 hover:brightness-90 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group rounded-xl"
                                    aria-label="تصفح الدورات التعليمية"
                                >
                                    <span>تصفح الدورات</span>
                                    <ArrowLeft className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />
                                </Link>
                                <button
                                    onClick={() => {
                                        const el = document.getElementById('how-it-works');
                                        if (el) {
                                            el.scrollIntoView({ behavior: 'smooth' });
                                        } else {
                                            // Fallback if element not yet in DOM
                                            setTimeout(() => {
                                                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                                            }, 300);
                                        }
                                    }}
                                    className="px-6 py-3 sm:px-10 sm:py-4 bg-surface text-main border border-border font-bold text-base sm:text-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 group rounded-xl"
                                    aria-label="شاهد دليل الاستخدام"
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center group-hover:scale-110 transition">
                                        <Play className="w-4 h-4 text-primary fill-primary" />
                                    </div>
                                    <span>دليل الاستخدام؟</span>
                                </button>
                            </div>
                            <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-6">
                                <div className="flex -space-x-3 space-x-reverse">
                                    {[1, 2, 3].map((i) => (
                                        <img
                                            key={i}
                                            src={`https://i.pravatar.cc/100?img=${i + 10}`}
                                            width="40"
                                            height="40"
                                            alt=""
                                            loading="lazy"
                                            className="w-10 h-10 rounded-full border-2 border-border shadow-sm"
                                        />
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-2 border-border bg-surface dark:bg-card flex items-center justify-center text-xs font-bold text-muted">
                                        +2k
                                    </div>
                                </div>
                                <div className="text-end">
                                    <div className="font-bold text-main flex items-center gap-1">
                                        4.9/5
                                        <Star className="w-4 h-4 text-warning fill-warning" />
                                    </div>
                                    <p className="text-xs text-muted font-medium">تقييم الطلاب وأولياء الأمور</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex lg:w-[40%] justify-center z-10 relative lg:mb-0">
                            <div className="relative w-full max-w-[220px] lg:max-w-[375px] aspect-auto lg:aspect-[4/5] flex items-center justify-center">
                                <div className="absolute inset-[2%] border-[1px] border-dashed border-primary/40 rounded-full animate-spin-slow pointer-events-none"></div>
                                <div className="absolute inset-[4%] border-[1px] border-dashed border-accent/20 rounded-full animate-reverse-spin-slow pointer-events-none"></div>

                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-[3rem] blur-2xl animate-pulse"></div>
                                    <picture>
                                        <source srcSet="/hero-child.webp" type="image/webp" />
                                        <source srcSet="/hero-child.avif" type="image/avif" />
                                        <img
                                            src="/hero-child.png"
                                            alt="طفل يدرس على منصة دارين السابعة"
                                            width="490"
                                            height="490"
                                            className="relative w-full h-auto lg:h-full object-contain filter drop-shadow-2xl z-20"
                                            fetchPriority="high"
                                            decoding="async"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000&auto=format&fit=crop';
                                            }}
                                        />
                                    </picture>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hidden md:grid grid-cols-4 gap-2 mt-3 max-w-6xl mx-auto">
                    {bannersArray.slice(0, 4).map((text, idx) => text ? (
                        <div key={idx} className="bg-surface rounded-2xl p-2 shadow-sm border border-border flex items-center justify-between gap-1 group hover:shadow-md transition-all">
                            <p className="text-micro lg:text-xs font-black text-main leading-tight flex-1">
                                {text}
                            </p>
                            <a
                                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، ' + text)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`سجل الآن: ${text}`}
                                className="shrink-0 px-2.5 py-1 bg-primary text-on-primary font-bold text-micro lg:text-micro rounded-xl hover:brightness-90 transition-all shadow-sm whitespace-nowrap"
                            >
                                سجل الآن
                            </a>
                        </div>
                    ) : null)}
                </div>
            </div>
        </section>
    );
};
