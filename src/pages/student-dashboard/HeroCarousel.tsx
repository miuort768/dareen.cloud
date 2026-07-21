import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const heroSlides = [
    {
        id: 0, title: 'منصة دارين', subtitle: 'للتعليم والتدريب عن بعد',
        desc: 'منصة متكاملة تجمع بين أفضل المعلمين وأحدث تقنيات التعليم الإلكتروني لضمان تفوق أبنائكم دائماً.',
        emoji: '🎓', gradient: 'bg-primary-soft', textColor: 'text-primary',
    },
    {
        id: 1, title: 'تعلّم بلا حدود', subtitle: 'من أي مكان في العالم',
        desc: 'حصص تفاعلية مباشرة مع أفضل المعلمين، متابعة دورية، وتقارير مفصلة لأولياء الأمور.',
        emoji: '🌍', gradient: 'bg-info-soft', textColor: 'text-info-dark',
    },
    {
        id: 2, title: 'تحدّ نفسك', subtitle: 'واكسب النقاط والشارات',
        desc: 'نظام مكافآت متميز يشجع الطلاب على التفوق والمثابرة مع شارات وألقاب حصرية.',
        emoji: '🏆', gradient: 'bg-warning-soft', textColor: 'text-warning-dark',
    },
];

export const HeroCarousel = () => {
    const navigate = useNavigate();
    const [heroIndex, setHeroIndex] = useState(0);
    const heroTimer = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        heroTimer.current = setInterval(() => setHeroIndex(i => (i + 1) % heroSlides.length), 4000);
        return () => { if (heroTimer.current) clearInterval(heroTimer.current); };
    }, []);

    const slide = heroSlides[heroIndex];

    return (
        <div className="relative rounded-3xl overflow-hidden min-h-[200px]">
            <AnimatePresence mode="wait">
                <motion.div key={heroIndex}
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -60 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className={`${slide.gradient} p-5 rounded-card flex items-center justify-between gap-4 min-h-[200px]`}>
                    <div className="flex-1 space-y-2">
                        <h2 className={`text-2xl font-bold leading-tight ${slide.textColor}`}>
                            {slide.title}{' '}
                            <span className="inline-block border-s-4 border-current ps-0.5 animate-pulse">|</span>
                        </h2>
                        <p className={`text-sm font-bold ${slide.textColor} opacity-80`}>{slide.subtitle}</p>
                        <p className={`text-xs leading-relaxed ${slide.textColor} opacity-70 max-w-[180px]`}>{slide.desc}</p>
                        <div className="flex gap-2 pt-2 flex-wrap">
                            <button onClick={() => navigate('/chat')}
                                className="flex items-center gap-1.5 bg-primary text-on-primary text-xs font-bold px-4 py-2 rounded-card shadow-sm active:scale-95 transition-transform">
                                <Play size={12} fill="currentColor" /> ابدأ الآن
                            </button>
                            <button onClick={() => navigate('/schedule')}
                                className="flex items-center gap-1.5 bg-card text-primary text-xs font-bold px-4 py-2 rounded-card border border-border active:scale-95 transition-transform">
                                استكشف الدورات <ChevronLeft size={12} />
                            </button>
                        </div>
                    </div>
                    <div className="shrink-0 relative z-10">
                        <div className="w-[110px] h-[120px] relative">
                            <div className="w-full h-full rounded-card overflow-hidden bg-card flex items-center justify-center text-6xl shadow-soft">
                                {slide.emoji}
                            </div>
                            <div className="absolute -bottom-2 -start-2 bg-card rounded-card px-2 py-1 shadow-soft flex items-center gap-1">
                                <span className="text-micro font-bold text-main">🇰🇼</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-center gap-1.5 mt-3">
                {heroSlides.map((_, i) => (
                    <button key={`hero-${i}`} onClick={() => setHeroIndex(i)}
                        aria-label={`الشريحة ${i + 1} من ${heroSlides.length}`}
                        aria-current={i === heroIndex ? 'true' : undefined}
                        className={`rounded-full transition-all duration-300 ${i === heroIndex ? 'w-5 h-2 bg-primary' : 'w-2 h-2 bg-border'}`} />
                ))}
            </div>
        </div>
    );
};
