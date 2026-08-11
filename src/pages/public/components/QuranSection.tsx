import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, ClipboardCheck, Mic, Sparkles, Star } from 'lucide-react';
import { Image } from '../../../shared/components/ui';

interface QuranSectionProps {
    whatsappNumber: string;
}

const LeafDecoration = () => (
    <div className="absolute top-0 start-0 w-48 h-48 md:w-64 md:h-64 pointer-events-none overflow-hidden opacity-60">
        <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
                <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.15" />
                </linearGradient>
            </defs>
            <path d="M180 20 Q140 40 120 80 Q100 120 130 150 Q160 130 170 90 Q180 50 180 20Z" fill="url(#leafGrad)" transform="rotate(15, 100, 100)" />
            <path d="M160 60 Q120 70 100 100 Q80 130 110 155 Q140 140 150 110 Q160 80 160 60Z" fill="url(#leafGrad)" transform="rotate(30, 100, 100)" />
            <path d="M200 40 Q170 50 150 80 Q130 110 150 135 Q170 120 180 90 Q190 60 200 40Z" fill="url(#leafGrad)" transform="rotate(-10, 100, 100)" />
            <circle cx="170" cy="30" r="8" fill="var(--color-success)" opacity="0.15" />
            <circle cx="150" cy="70" r="5" fill="var(--color-primary)" opacity="0.1" />
            <circle cx="190" cy="60" r="6" fill="var(--color-success)" opacity="0.12" />
        </svg>
    </div>
);

export const QuranSection = ({ whatsappNumber }: QuranSectionProps) => {
    return (
        <>
            {/* Desktop version */}
            <section className="hidden md:block pt-4 md:pt-6 pb-6 relative overflow-hidden bg-surface dark:bg-background transition-colors duration-500">
                <div className="absolute top-0 end-0 w-64 h-64 bg-accent/5 dark:bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 start-0 w-48 h-48 bg-primary/5 dark:bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="container mx-auto px-4 md:px-8 relative z-10">
                    <div className="max-w-6xl mx-auto bg-success-soft dark:bg-card border border-success dark:border-primary/40 rounded-2xl shadow-sm overflow-hidden">
                        <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-16 justify-center p-6 md:p-10">
                            <div className="w-full lg:w-1/2 text-center">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 dark:bg-primary/15 border border-success/50 dark:border-primary/40 rounded-full mb-4 mx-auto">
                                    <span className="w-2 h-2 rounded-full bg-success dark:bg-primary animate-pulse"></span>
                                    <span className="text-success-dark dark:text-primary font-bold text-xs">برامج تحفيظ متميزة</span>
                                </div>
                                <h2 className="text-lg sm:text-2xl lg:text-3xl font-black mb-4 text-main dark:text-main leading-tight font-heading">
                                    رحلتك مع <span className="text-success dark:text-primary relative inline-block">
                                        كتاب الله
                                        <svg className="absolute -bottom-2 end-0 w-full h-3" viewBox="0 0 100 10" preserveAspectRatio="none">
                                            <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" className="text-success dark:text-primary opacity-40" />
                                        </svg>
                                    </span> تبدأ بخطوة
                                </h2>
                                <p className="text-muted dark:text-soft text-xs lg:text-sm leading-relaxed mb-6 max-w-xl mx-auto font-medium">
                                    منهجية فريدة تجمع بين أصالة التلقي وتقنيات التعليم الحديثة. نقدم حلقات فردية ومجموعات صغيرة مع نخبة من المقرئين المجازين.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-5">
                                    <a
                                        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في البدء بحفظ القرآن الكريم في دارين السابعة')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-8 py-3.5 bg-success dark:bg-gradient-to-r dark:from-primary dark:to-warning text-on-success dark:text-on-primary font-extrabold text-sm shadow-lg hover:brightness-90 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group rounded-xl"
                                    >
                                        <span>ابدأ الحفظ الآن</span>
                                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                                    </a>
                                    <Link
                                        to="/courses"
                                        onClick={() => window.scrollTo(0, 0)}
                                        className="px-8 py-3.5 bg-card dark:bg-white/5 text-muted dark:text-main border border-border dark:border-primary/30 font-bold text-sm hover:border-success hover:text-success transition-all flex items-center justify-center rounded-xl"
                                    >
                                        <Sparkles size={16} className="me-2 dark:text-primary" />
                                        تصفح المزيد
                                    </Link>
                                </div>
                                <div className="items-center justify-center gap-4 inline-flex">
                                    <div className="flex -space-x-3 space-x-reverse">
                                        {[1, 2, 3].map(i => (
                                            <div key={`avatar-${i}`} className="w-10 h-10 rounded-full border-2 border-card dark:border-primary/40 bg-success-soft dark:bg-background overflow-hidden shadow-sm">
                                                <Image src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="" className="w-10 h-10" />
                                            </div>
                                        ))}
                                        <div className="w-10 h-10 rounded-full border-2 border-card dark:border-primary/40 bg-surface dark:bg-background flex items-center justify-center text-xs font-bold text-muted dark:text-soft shadow-sm">+5k</div>
                                    </div>
                                    <div className="h-8 w-px bg-success dark:bg-primary opacity-40"></div>
                                    <div className="text-start">
                                        <div className="text-sm font-bold text-main dark:text-main flex items-center gap-1">
                                            4.9/5
                                            <Star className="w-4 h-4 text-warning dark:text-primary fill-warning dark:fill-primary" />
                                        </div>
                                        <div className="text-xs text-muted dark:text-muted font-medium">من قبل آلاف الطلاب</div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full lg:w-1/2 flex justify-center py-4 lg:py-0">
                                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-2 gap-3 w-full max-w-[400px]">
                                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="p-4 bg-card dark:bg-surface border border-border dark:border-primary/25 rounded-2xl shadow-sm flex flex-col items-center text-center">
                                        <div className="w-11 h-11 bg-surface dark:bg-primary/15 text-primary dark:text-primary flex items-center justify-center mb-3 rounded-xl">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-black text-main dark:text-main text-xs mb-1">أوقات مرنة</h3>
                                        <p className="text-micro text-muted dark:text-muted leading-tight font-medium">اختر مواعيدك المفضلة</p>
                                    </motion.div>
                                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="p-4 bg-card dark:bg-surface border border-border dark:border-primary/25 rounded-2xl shadow-sm flex flex-col items-center text-center">
                                        <div className="w-11 h-11 bg-warning-soft dark:bg-primary/15 text-warning dark:text-primary flex items-center justify-center mb-3 rounded-xl">
                                            <ClipboardCheck className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-black text-main dark:text-main text-xs mb-1">متابعة دقيقة</h3>
                                        <p className="text-micro text-muted dark:text-muted leading-tight font-medium">تقارير إنجاز أسبوعية</p>
                                    </motion.div>
                                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="p-4 bg-card dark:bg-surface border border-border dark:border-primary/25 rounded-2xl shadow-sm flex flex-col items-center text-center">
                                        <div className="w-11 h-11 bg-success-soft dark:bg-primary/15 text-success dark:text-primary flex items-center justify-center mb-3 rounded-xl">
                                            <Mic className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-black text-main dark:text-main text-xs mb-1">معلمون مجازون</h3>
                                        <p className="text-micro text-muted dark:text-muted leading-tight font-medium">نخبة الحفاظ المبدعون</p>
                                    </motion.div>
                                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }}>
                                        <Link to="/contact" className="p-4 bg-primary dark:bg-gradient-to-r dark:from-primary dark:to-warning rounded-2xl shadow-lg text-on-primary dark:text-on-primary flex flex-col items-center text-center transition-all hover:brightness-90 cursor-pointer">
                                            <div className="w-11 h-11 bg-white/20 dark:bg-black/20 text-on-primary dark:text-on-primary flex items-center justify-center mb-3 backdrop-blur-sm rounded-xl">
                                                <Sparkles className="w-5 h-5" />
                                            </div>
                                            <h3 className="font-black text-on-primary dark:text-on-primary text-xs mb-1">جرب مجاناً</h3>
                                            <p className="text-on-primary dark:text-on-primary opacity-80 text-micro leading-tight font-extrabold">حصة تجريبية للمشتركين</p>
                                        </Link>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mobile version */}
            <section className="block md:hidden relative overflow-hidden bg-surface dark:bg-background transition-colors duration-500 pt-2 pb-4">
                <LeafDecoration />

                <div className="absolute top-40 -end-20 w-64 h-64 bg-accent/10 dark:bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-40 -start-20 w-80 h-80 bg-primary/10 dark:bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="relative z-10 px-5">
                    <div className="flex items-center justify-center mb-5 mt-2">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 dark:bg-primary/15 border border-success dark:border-primary/40 rounded-full shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-success dark:bg-primary animate-pulse"></span>
                            <span className="text-success-dark dark:text-primary font-bold text-xs tracking-wide">برامج حفظ متميزة</span>
                        </div>
                    </div>

                    <div className="text-center mb-5">
                        <h2 className="text-2xl leading-tight font-black text-main dark:text-main font-heading">
                            رحلتك مع{" "}
                            <span className="text-success dark:text-primary relative inline-block">
                                كتاب الله
                                <svg className="absolute -bottom-1.5 end-0 w-full h-3" viewBox="0 0 120 12" preserveAspectRatio="none">
                                    <path d="M2 8 Q 30 0 60 8 Q 90 12 118 4" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" className="text-success dark:text-primary opacity-40" />
                                </svg>
                            </span>
                            <br />
                            تبدأ بخطوة
                        </h2>
                    </div>

                    <p className="text-muted dark:text-soft text-xs leading-relaxed text-center max-w-xs mx-auto mb-6 font-medium">
                        منهجية فريدة تجمع بين أصالة التلقي وتقنيات التعليم الحديثة. نقدم حلقات فردية ومجموعات صغيرة مع نخبة من المقرئين المجازين.
                    </p>

                    <div className="flex flex-col gap-3 items-center mb-7">
                        <a
                            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في البدء بحفظ القرآن الكريم في دارين السابعة')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full max-w-[320px] py-4 bg-success dark:bg-gradient-to-r dark:from-primary dark:to-warning text-on-success dark:text-on-primary font-extrabold text-base shadow-lg hover:brightness-90 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group rounded-2xl"
                        >
                            <span>ابدأ الحفظ الآن</span>
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </a>
                        <Link
                            to="/courses"
                            onClick={() => window.scrollTo(0, 0)}
                            className="w-full max-w-[320px] py-3.5 bg-card dark:bg-white/5 text-success dark:text-main border border-border dark:border-primary/30 font-bold text-sm transition-all flex items-center justify-center gap-2 rounded-2xl shadow-sm"
                        >
                            <Sparkles size={16} className="dark:text-primary" />
                            تصفح المزيد
                        </Link>
                    </div>

                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="text-end">
                            <div className="flex items-center gap-1.5">
                                <span className="text-lg font-black text-main dark:text-main">4.9</span>
                                <span className="text-sm font-bold text-muted dark:text-muted">/5</span>
                                <Star size={14} className="text-warning dark:text-primary fill-warning dark:fill-primary" />
                            </div>
                            <div className="text-xs text-muted dark:text-muted font-medium mt-0.5">من قبل آلاف الطلاب</div>
                        </div>
                        <div className="h-10 w-px bg-success dark:bg-primary opacity-40"></div>
                        <div className="flex -space-x-2.5 space-x-reverse">
                            {[1, 2, 3].map(i => (
                                <div key={`avatar-${i}`} className="w-9 h-9 rounded-full border-2 border-card dark:border-primary/40 bg-surface dark:bg-background overflow-hidden shadow-sm">
                                    <Image src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="" className="w-full h-full" />
                                </div>
                            ))}
                            <div className="w-9 h-9 rounded-full border-2 border-card dark:border-primary/40 bg-success dark:bg-primary flex items-center justify-center text-micro font-black text-on-success dark:text-on-primary shadow-sm">5K+</div>
                        </div>
                    </div>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={{ visible: { transition: { staggerChildren: 0.08 } } }} className="grid grid-cols-2 gap-3 mb-8 max-w-[360px] mx-auto">
                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="bg-card dark:bg-surface border border-border dark:border-primary/25 rounded-2xl p-4 shadow-sm flex flex-col items-center text-center">
                            <div className="w-11 h-11 bg-warning-soft dark:bg-primary/15 rounded-2xl flex items-center justify-center mb-3">
                                <ClipboardCheck size={22} className="text-warning dark:text-primary" />
                            </div>
                            <h3 className="font-black text-main dark:text-main text-sm mb-1">متابعة دقيقة</h3>
                            <p className="text-muted dark:text-muted text-micro leading-relaxed">تقارير إنجاز أسبوعية</p>
                        </motion.div>
                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="bg-card dark:bg-surface border border-border dark:border-primary/25 rounded-2xl p-4 shadow-sm flex flex-col items-center text-center">
                            <div className="w-11 h-11 bg-primary-soft dark:bg-primary/15 rounded-2xl flex items-center justify-center mb-3">
                                <Clock size={22} className="text-primary dark:text-primary" />
                            </div>
                            <h3 className="font-black text-main dark:text-main text-sm mb-1">أوقات مرنة</h3>
                            <p className="text-muted dark:text-muted text-micro leading-relaxed">اختر مواعيدك المفضلة</p>
                        </motion.div>
                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="bg-primary dark:bg-gradient-to-r dark:from-primary dark:to-warning border-0 rounded-2xl p-4 shadow-lg flex flex-col items-center text-center">
                            <div className="w-11 h-11 bg-white/20 dark:bg-black/20 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-sm">
                                <Sparkles size={22} className="text-on-primary dark:text-on-primary" />
                            </div>
                            <h3 className="font-black text-on-primary dark:text-on-primary text-sm mb-1">جرب مجانًا</h3>
                            <p className="text-on-primary dark:text-on-primary opacity-80 text-micro leading-relaxed font-bold">حصة تجريبية للمشتركين</p>
                        </motion.div>
                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="bg-card dark:bg-surface border border-border dark:border-primary/25 rounded-2xl p-4 shadow-sm flex flex-col items-center text-center">
                            <div className="w-11 h-11 bg-success-soft dark:bg-primary/15 rounded-2xl flex items-center justify-center mb-3">
                                <Mic size={22} className="text-success dark:text-primary" />
                            </div>
                            <h3 className="font-black text-main dark:text-main text-sm mb-1">معلمون مجازون</h3>
                            <p className="text-muted dark:text-muted text-micro leading-relaxed">نخبة الحفاظ المبدعون</p>
                        </motion.div>
                    </motion.div>

                </div>
            </section>

        </>
    );
};
