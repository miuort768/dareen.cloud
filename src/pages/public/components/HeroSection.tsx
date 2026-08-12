import { Link } from 'react-router-dom';
import { Play, ArrowLeft, Star, MessageCircle, Users } from 'lucide-react';
import { Image } from '../../../shared/components/ui';

interface HeroSectionProps {
    typewriterText: string;
    signupNowNumber: string;
    requestFreeNumber: string;
    academyName: string;
    bannersArray: string[];
}

export const HeroSection = ({ typewriterText, signupNowNumber, requestFreeNumber, academyName, bannersArray }: HeroSectionProps) => {
    return (
        <section className="relative pt-20 md:pt-28 pb-4 md:pb-4 overflow-hidden bg-surface dark:bg-background transition-colors duration-500">
            <div className="absolute top-0 end-0 w-64 h-64 bg-accent/5 dark:bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 start-0 w-48 h-48 bg-primary/5 dark:bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto bg-gradient-to-br from-primary-soft via-primary-soft to-card dark:from-card dark:via-surface dark:to-card rounded-2xl shadow-sm border border-primary/30 dark:border-primary/30 overflow-hidden">
                    <div className="flex flex-col-reverse lg:flex-row items-center gap-2 lg:gap-6 p-6 md:p-10">
                        <div className="lg:w-[60%] text-center z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-primary/10 border border-primary/50 dark:border-primary/40 rounded-full mb-4 mx-auto mt-4 lg:mt-0">
                                <span className="w-2 h-2 rounded-full bg-primary dark:bg-primary animate-pulse"></span>
                                <span className="text-primary dark:text-primary font-bold text-micro sm:text-xs">منصة تعليم عن بعد رائدة في الكويت والخليج</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-heading font-black text-main dark:text-main leading-none mb-0 relative">
                                <span className="sr-only">دارين السابعة للتعليم والتدريب عن بعد - المنصة رقم 1 للدروس الخصوصية وتحفيظ القرآن في الكويت، الكويت، الإمارات، قطر وسلطنة عمان ومملكة البحرين - دروس خصوصية في الدوحة والرياض ومسقط وصلالة ومنامة ومملكة البحرين</span>
                                <span className="block mb-0 min-h-[1.1em] aria-hidden">{typewriterText || '\u00A0'}<span className="inline-block animate-pulse border-s-4 border-primary dark:border-primary me-1 h-[0.9em] align-middle"></span></span>
                                <span className="text-xl sm:text-2xl lg:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent dark:from-warning dark:to-primary block -mt-1 py-1 aria-hidden">
                                    للتعليم والتدريب عن بعد
                                </span>
                            </h1>
                            <p className="text-xs sm:text-xs text-muted dark:text-soft leading-normal mb-5 max-w-[320px] sm:max-w-full mx-auto px-0 font-medium">
                                أفضل منصة تعليم عن بعد في الكويت، الكويت، الإمارات، قطر وعمان والبحرين.<br />دروس خصوصية، قدرات وتحصيلي، تحفيظ القرآن، وتأسيس للمناهج الخليجية مع نخبة المعلمين.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                                <Link
                                    to="/courses"
                                    onClick={() => window.scrollTo(0, 0)}
                                    className="px-6 py-3 sm:px-10 sm:py-4 bg-gradient-to-r from-primary to-primary dark:from-primary dark:to-warning text-on-primary dark:text-on-primary font-extrabold text-base sm:text-lg shadow-lg dark:shadow-primary/20 hover:brightness-90 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group rounded-xl"
                                    aria-label="تصفح الدورات التعليمية"
                                >
                                    <span>تصفح الدورات</span>
                                    <ArrowLeft className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />
                                </Link>
                                <a
                                    href={`https://wa.me/${requestFreeNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في حجز حصة مجانية في ' + academyName)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-3 sm:px-10 sm:py-4 bg-success hover:bg-success-dark dark:bg-gradient-to-r dark:from-primary dark:to-warning text-on-success dark:text-on-primary font-extrabold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 group rounded-xl active:scale-[0.97]"
                                    aria-label="حجز حصة مجانية عبر واتساب"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    <span>حجز حصة مجانية</span>
                                    <ArrowLeft className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />
                                </a>
                            </div>
                            <div className="mt-4 pt-4 border-t border-border dark:border-white/10 flex items-center justify-center gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary-soft dark:bg-primary/20 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-primary dark:text-primary" />
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-success-light dark:bg-primary/20 flex items-center justify-center -ms-4 border-2 border-surface dark:border-background">
                                        <span className="text-xs font-black text-success dark:text-primary">+2k</span>
                                    </div>
                                </div>
                                <div className="text-start">
                                    <div className="font-bold text-main dark:text-main flex items-center gap-1">
                                        4.9/5
                                        <Star className="w-4 h-4 text-warning dark:text-primary fill-warning dark:fill-primary" />
                                    </div>
                                    <p className="text-xs text-muted dark:text-muted font-medium">تقييم الطلاب وأولياء الأمور</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex lg:w-[40%] justify-center z-10 relative lg:mb-0">
                            <div className="relative w-full max-w-[220px] lg:max-w-[375px] aspect-auto lg:aspect-[4/5] flex items-center justify-center">
                                <div className="absolute inset-[2%] border-[1px] border-dashed border-primary/40 dark:border-primary/40 rounded-full animate-spin-slow pointer-events-none"></div>
                                <div className="absolute inset-[4%] border-[1px] border-dashed border-accent/20 dark:border-warning/30 rounded-full animate-reverse-spin-slow pointer-events-none"></div>

                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 dark:from-primary/20 dark:to-warning/10 rounded-[3rem] blur-2xl animate-pulse"></div>
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
                        <div key={idx} className="bg-surface dark:bg-card rounded-2xl p-2 shadow-sm border border-border dark:border-primary/20 flex items-center justify-between gap-1 group hover:shadow-md transition-all">
                            <p className="text-micro lg:text-xs font-black text-main dark:text-soft leading-tight flex-1">
                                {text}
                            </p>
                            <a
                                href={`https://wa.me/${signupNowNumber}?text=${encodeURIComponent('السلام عليكم، ' + text)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`سجل الآن: ${text}`}
                                className="shrink-0 px-2.5 py-1 bg-primary dark:bg-gradient-to-r dark:from-primary dark:to-warning text-on-primary dark:text-on-primary font-extrabold text-micro lg:text-micro rounded-xl hover:brightness-90 transition-all shadow-sm whitespace-nowrap"
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
