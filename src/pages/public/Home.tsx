import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { Play, ArrowLeft, Star, Heart, CheckCircle, Lightbulb, Users, Award, Zap, Clock, Mic, ClipboardCheck, Quote, BookOpen } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { SEO } from '../../components/SEO';

import { cn } from '../../lib/utils';

export const Home = () => {
    const { adminPhone, heroBanners } = useSettings();
    const whatsappNumber = adminPhone.replace(/\D/g, '');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [typewriterText, setTypewriterText] = useState("");
    
    let bannersArray = ["", "", "", ""];
    try {
        if (heroBanners) {
            bannersArray = JSON.parse(heroBanners);
        }
    } catch {
        // Fallback to empty banners
    }

    useEffect(() => {
        const fullText = "منصة دارين السابعة";
        let i = 0;
        let isDeleting = false;
        let typingSpeed = 150;

        const type = () => {
            const currentText = isDeleting
                ? fullText.substring(0, i - 1)
                : fullText.substring(0, i + 1);

            setTypewriterText(currentText);

            if (!isDeleting && i === fullText.length) {
                isDeleting = true;
                typingSpeed = 2000;
            } else if (isDeleting && i === 0) {
                isDeleting = false;
                typingSpeed = 500;
            } else {
                i += isDeleting ? -1 : 1;
                typingSpeed = isDeleting ? 75 : 150;
            }

            setTimeout(type, typingSpeed);
        };

        const timer = setTimeout(type, typingSpeed);
        return () => clearTimeout(timer);
    }, []);

    const reviews = [
        {
            name: "أم راشد",
            role: "ولية أمر",
            content: "مشكورين وايد على جهودكم، عيالي وايد تحسن مستواهم من عقب ما سجلوا معاكم. صراحة فرق كبير بالأداء المدرسي.",
            avatar: "/images/avatars/mom1.png"
        },
        {
            name: "أم ناصر",
            role: "ولية أمر",
            content: "المعهد يبيض الويه، والمدرسين ما يقصرون مع الطلبة. ولدي صار يحب يدرس ويشارك بالحصة بكل حماس.",
            avatar: "/images/avatars/mom2.png"
        },
        {
            name: "أم وضحة",
            role: "ولية أمر",
            content: "طريقة التدريس وايد حلوة وتشد الياهل، بنتي كانت تمل من الدراسة بس الحين صارت هي اللي تذكرني بموعد الحصة.",
            avatar: "/images/avatars/mom3.png"
        },
        {
            name: "أبو فهد",
            role: "ولي أمر",
            content: "والله يا جماعة دارين السابعة غير، عيالي استفادوا حيل وصاروا يحبون الحصة. الله يبيض وجيهكم وما قصرتوا صراحة على هالمجهود.",
            avatar: "/images/avatars/dad1.png"
        },
        {
            name: "أم جاسم",
            role: "ولية أمر",
            content: "الله يعطيكم العافية على المتابعة الدورية، صج تهتمون بأدق التفاصيل والتقارير اللي توصلنا تريح البال وتطمنا على عيالنا.",
            avatar: "/images/avatars/mom1.png"
        },
        {
            name: "أم دلال",
            role: "ولية أمر",
            content: "أحسن قرار خذيته إني سجلت عيالي بدارين السابعة. المدرسين قمة في الأخلاق والتعامل، ويوصلون المعلومة بسلاسة.",
            avatar: "/images/avatars/mom2.png"
        },
        {
            name: "أم ريم",
            role: "ولية أمر",
            content: "مشكورة وايد إدارة المعهد على هذا المستوى الراقي. التأسيس عندكم وايد قوي وساعد عيالي يتخطون وايد صعوبات.",
            avatar: "/images/avatars/mom3.png"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % reviews.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [reviews.length]);



    return (
        <div className="min-h-full bg-[rgb(var(--bg-surface))] font-sans text-[rgb(var(--text-main))] relative overflow-x-hidden transition-colors duration-500">
            <SEO
                title="دارين السابعة للتعليم والتدريب | المنصة رقم 1 في الكويت والسعودية وقطر والامارات وعمان"
                description="دارين السابعة للتعليم والتدريب يوفر أفضل دروس خصوصية أونلاين، مراجعات نهائية، تحفيظ قرآن، وتأسيس أكاديمي مع نخبة من المعلمين للمناهج في الكويت، السعودية، قطر، الامارات، وسلطنة عمان."
                keywords="أفضل منصة تعليمية, تعليم عن بعد الكويت, مدرس خصوصي قطر, دروس خصوصية السعودية, معلمين الامارات, دروس اونلاين سلطنة عمان, دارين السابعة, تحفيظ قرآن عن بعد"
                preloadImages={['/hero-child.png']}
            />
            <PublicNavbar />

            {/* Blob Backgrounds */}
            <div className="hero-blob bg-indigo-500/10 w-96 h-96 rounded-full top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none hidden md:block"></div>
            <div className="hero-blob bg-purple-600/10 w-[30rem] h-[30rem] rounded-full bottom-0 right-0 translate-x-1/2 translate-y-1/2 pointer-events-none hidden md:block"></div>

            {/* Hero Section */}
            <section className="relative pt-24 pb-12 md:pt-36 md:pb-16 h-fit overflow-hidden bg-[rgb(var(--bg-surface))]">
                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.2]"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 20% 30%, #6366F1 0%, transparent 45%), radial-gradient(circle at 80% 70%, #8B5CF6 0%, transparent 45%)',
                        filter: 'blur(70px)'
                    }}>
                </div>
                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.1]"
                    style={{
                        backgroundImage: 'url("https://www.transparenttextures.com/patterns/simple-dashed.png")',
                        backgroundSize: '200px 200px'
                    }}>
                </div>
                <div className="container mx-auto px-6 sm:px-8">
                    <div className="max-w-6xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-8 lg:gap-12">
                        <div className="lg:w-[60%] text-center lg:text-right z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 rounded-full mb-6 mx-auto lg:mx-0 mt-4 lg:mt-0">
                                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
                                <span className="text-indigo-900 dark:text-indigo-200 font-bold text-xs sm:text-sm">منصة تعليمية بتصميم عصري</span>
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-slate-900 dark:text-white leading-tight mb-4 relative">
                                <span className="sr-only">دارين السابعة للتعليم والتدريب عن بعد - المنصة رقم واحد للدروس الخصوصية وتحفيظ القرآن في الكويت، قطر، السعودية، الامارات، وسلطنة عمان</span>
                                <span className="block mb-2 min-h-[1.1em] aria-hidden">{typewriterText || '\u00A0'}<span className="inline-block animate-pulse border-r-4 border-indigo-600 dark:border-white ml-1 h-[0.9em] align-middle"></span></span>
                                <span className="text-2xl sm:text-3xl lg:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 block mt-2 py-1 aria-hidden">
                                    للتعليم والتدريب عن بعد
                                </span>
                            </h1>
                            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0 px-2 font-medium">
                                منصة متكاملة تجمع بين أفضل المعلمين وأحدث تقنيات التعليم الإلكتروني لضمان تفوق أبنائكم دائماً.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start">
                                <Link
                                    to="/courses"
                                    onClick={() => window.scrollTo(0, 0)}
                                    className="px-8 py-4 bg-indigo-950 dark:bg-indigo-900 text-white font-bold text-base sm:text-lg shadow-lg hover:bg-black dark:hover:bg-white dark:hover:text-indigo-950 transition-all flex items-center justify-center gap-2 group"
                                >
                                    <span>تصفح الدورات</span>
                                    <ArrowLeft className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />
                                </Link>
                                <button
                                    onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 font-bold text-base sm:text-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center group-hover:scale-110 transition">
                                        <Play className="w-4 h-4 text-indigo-600 dark:text-indigo-400 fill-indigo-600 dark:fill-indigo-400" />
                                    </div>
                                    <span>دليل الاستخدام؟</span>
                                </button>
                            </div>
                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center lg:justify-start gap-6">
                                <div className="flex -space-x-3 space-x-reverse">
                                    {[1, 2, 3].map((i) => (
                                        <img
                                            key={i}
                                            src={`https://i.pravatar.cc/100?img=${i + 10}`}
                                            className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"
                                            alt="User"
                                            loading="lazy"
                                        />
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">
                                        +2k
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-base sm:text-lg">
                                        4.9/5
                                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">تقييم الطلاب وأولياء الأمور</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex lg:w-[40%] justify-center z-10 relative mb-4 lg:mb-0">
                            <div className="relative w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[375px] aspect-auto lg:aspect-[4/5] flex items-center justify-center">
                                {/* Rotating Dashed Circle - Size Reduced */}
                                <div className="absolute inset-[2%] border-[1px] border-dashed border-indigo-600/40 rounded-full animate-spin-slow pointer-events-none"></div>
                                <div className="absolute inset-[4%] border-[1px] border-dashed border-purple-500/20 rounded-full animate-reverse-spin-slow pointer-events-none"></div>
                                
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-[3rem] blur-2xl animate-pulse"></div>
                                    <img
                                        src="/hero-child.png"
                                        alt="Hero"
                                        className="relative w-full h-auto lg:h-full object-contain filter drop-shadow-2xl z-20"
                                        fetchPriority="high"
                                        decoding="sync"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000&auto=format&fit=crop';
                                        }}
                                    />
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Dynamic Hero Banners (Full Width) - Spacing Minimized further */}
                <div className="hidden md:grid w-full mt-0 md:mt-0 bg-indigo-950 dark:bg-indigo-950 border-y border-indigo-800 dark:border-indigo-800 z-20 relative grid-cols-4 divide-x divide-x-reverse divide-indigo-800/50 dark:divide-indigo-800/50">
                    {bannersArray.slice(0, 4).map((text, idx) => text ? (
                        <div key={idx} className="px-3 lg:px-6 py-2 hover:bg-indigo-900 dark:hover:bg-indigo-900 transition-colors flex flex-row justify-between items-center gap-2 group">
                            <p className="text-[10px] lg:text-[11px] font-black text-amber-400 leading-tight flex-1">
                                {text}
                            </p>
                            <a 
                                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، ' + text)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 px-2.5 py-1 bg-amber-500 text-indigo-950 font-bold text-[9px] lg:text-[10px] rounded-none hover:bg-amber-400 transition-colors shadow-sm whitespace-nowrap"
                            >
                                سجل الآن
                            </a>
                        </div>
                    ) : null)}
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-16 sm:py-24 bg-[rgb(var(--bg-card))] relative overflow-hidden transition-colors duration-500">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-10 sm:mb-16 max-w-2xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-slate-900 dark:text-white mb-3 uppercase leading-tight py-1">
                            لماذا <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 py-1 inline-block">تختارنا؟</span>
                        </h2>
                        <div className="h-1.5 w-24 bg-gradient-to-r from-indigo-600 to-transparent mx-auto rounded-full mb-6"></div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base md:text-lg leading-relaxed font-medium px-4">
                            نقدم تجربة تعليمية متكاملة تجمع بين أحدث التقنيات وأفضل الكوادر التعليمية لضمان مستقبل مشرق لأبنائكم.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto pt-4 pb-8 md:pb-12">
                        <div className="md:col-span-2 relative p-6 sm:p-8 bg-gradient-to-br from-indigo-600 to-indigo-950 rounded-none shadow-2xl overflow-hidden flex items-center gap-6">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                            <div className="relative z-10 w-14 h-14 bg-white/20 backdrop-blur-md rounded-none flex items-center justify-center shrink-0 border border-white/30 group-hover:scale-110 transition-transform">
                                <Lightbulb className="w-7 h-7 text-white" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">طرق تعليم مبتكرة</h3>
                                <p className="text-sm text-indigo-55 dark:text-indigo-100/90 leading-relaxed font-medium">
                                    طرق تعليم تفاعلية حديثة تنمي مهارات الفهم والتفكير الإبداعي لدى طفلك.
                                </p>
                            </div>
                        </div>

                        <div className="p-6 sm:p-8 bg-gradient-to-br from-purple-600 to-purple-800 rounded-none shadow-xl text-white relative overflow-hidden flex items-center gap-6">
                            <div className="absolute top-0 left-0 w-16 h-16 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-none flex items-center justify-center shrink-0 border border-white/30 animate-bounce-slow">
                                <Heart className="w-7 h-7 text-white fill-white" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-lg sm:text-xl font-bold mb-2">بيئة آمنة ومحفزة</h3>
                                <p className="text-sm text-white/90 leading-relaxed font-medium">
                                    بيئة تعليمية افتراضية آمنة تشجع الطالب على التفاعل والمشاركة بحرية.
                                </p>
                            </div>
                        </div>

                        <div className="relative p-6 sm:p-8 bg-white dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-none shadow-sm flex items-center gap-6 group/card overflow-hidden">
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-indigo-600 transition-all duration-500 group-hover/card:w-full group-hover/card:h-full group-hover/card:opacity-10 opacity-40"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 bg-indigo-50 dark:bg-indigo-950/30 -rotate-45 translate-x-1/2 -translate-y-1/2"></div>
                            <div className="absolute bottom-2 left-10 opacity-[0.08] dark:opacity-[0.15] rotate-12 transition-transform group-hover/card:-translate-y-2">
                                <img src="/dareen_logo_new.jpg" alt="Logo" className="w-12 h-12 object-contain opacity-20 dark:opacity-30" />
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.06] dark:opacity-[0.1] transition-transform group-hover/card:scale-110">
                                <BookOpen size={64} className="text-black dark:text-white" />
                            </div>
                            <div className="relative z-10 w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-none flex items-center justify-center shrink-0 group-hover/card:scale-110 group-hover/card:rotate-6 transition-transform">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <div className="relative z-10 text-right">
                                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-2">نتائج مضمونة</h3>
                                <p className="text-sm text-gray-550 dark:text-slate-400 leading-relaxed font-medium">
                                    متابعة دقيقة لضمان تحقيق أفضل النتائج التعليمية.
                                </p>
                            </div>
                        </div>

                        <div className="md:col-span-2 p-6 sm:p-8 md:p-10 bg-black rounded-none shadow-2xl text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
                                <div className="flex-1 text-center lg:text-right">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/10 rounded-full mb-3 mx-auto lg:mx-0">
                                        <Award size={16} className="text-amber-500" />
                                        <span className="text-xs font-bold text-gray-300">التميز التعليمي</span>
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-black mb-3 font-heading text-white">بيئة تعليمية متطورة</h3>
                                    <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                                        نخبة من المعلمين المبدعين لضمان تفوق طفلك أكاديمياً وتربوياً بأحدث الوسائل التعليمية.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full lg:w-auto shrink-0">
                                    <div className="p-6 sm:p-8 bg-white/5 border border-white/10 rounded-none text-center group-hover:bg-white/10 transition-all duration-300 hover:border-indigo-400/30">
                                        <Users className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                                        <div className="text-3xl sm:text-4xl font-black text-white">+70</div>
                                        <div className="text-xs sm:text-sm text-gray-400 font-bold">معلم خبير</div>
                                    </div>
                                    <div className="p-6 sm:p-8 bg-white/5 border border-white/10 rounded-none text-center group-hover:bg-white/10 transition-all duration-300 hover:border-purple-600/30">
                                        <Star className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                                        <div className="text-3xl sm:text-4xl font-black text-white">+10</div>
                                        <div className="text-xs sm:text-sm text-gray-400 font-bold">سنوات خبرة</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quran Memorization Section */}
            <section className="py-16 sm:py-24 relative overflow-hidden bg-[rgb(var(--bg-surface))] transition-colors duration-500">
                {/* Dashed green lines at top and bottom */}
                <div className="absolute top-0 left-0 w-full h-px border-t border-dashed border-emerald-500/30 z-20"></div>
                <div className="absolute bottom-0 left-0 w-full h-px border-b border-dashed border-emerald-500/30 z-20"></div>

                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.2]"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 20% 30%, #6366F1 0%, transparent 45%), radial-gradient(circle at 80% 70%, #8B5CF6 0%, transparent 45%)',
                        filter: 'blur(70px)'
                    }}>
                </div>
                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.1]"
                    style={{
                        backgroundImage: 'url("https://www.transparenttextures.com/patterns/simple-dashed.png")',
                        backgroundSize: '200px 200px'
                    }}>
                </div>
                <div className="container mx-auto px-6 sm:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 justify-center max-w-6xl mx-auto">
                        <div className="w-full lg:w-1/2 text-center lg:text-right">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/50 rounded-full mb-6 mx-auto lg:mx-0">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-emerald-900 dark:text-emerald-200 font-bold text-xs sm:text-sm">برامج تحفيظ متميزة</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-6 text-slate-900 dark:text-white leading-tight font-heading">
                                رحلتك مع <span className="text-emerald-600 dark:text-emerald-400 relative inline-block">
                                    كتاب الله
                                    <svg className="absolute -bottom-2 left-0 w-full h-3 text-emerald-200 dark:text-emerald-900/40" viewBox="0 0 100 10" preserveAspectRatio="none">
                                        <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
                                    </svg>
                                </span> تبدأ بخطوة
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base lg:text-lg leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0 font-medium">
                                منهجية فريدة تجمع بين أصالة التلقي وتقنيات التعليم الحديثة. نقدم حلقات فردية ومجموعات صغيرة مع نخبة من المقرئين المجازين.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
                                <a
                                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في البدء بحفظ القرآن الكريم في دارين السابعة')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
                                >
                                    <span>ابدأ الحفظ الآن</span>
                                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                                </a>
                                <Link
                                    to="/courses"
                                    onClick={() => window.scrollTo(0, 0)}
                                    className="px-10 py-4 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 border border-slate-250 dark:border-slate-800 font-bold text-lg hover:border-emerald-250 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all flex items-center justify-center"
                                >
                                    تصفح المزيد
                                </Link>
                            </div>
                            <div className="items-center justify-center lg:justify-start gap-4 inline-flex">
                                <div className="flex -space-x-3 space-x-reverse">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-100 overflow-hidden shadow-sm">
                                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Student" />
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-gray-150 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-450 shadow-sm">+5k</div>
                                </div>
                                <div className="h-8 w-px bg-emerald-200/50 dark:bg-emerald-800/50 mx-2"></div>
                                <div className="text-right">
                                    <div className="text-base font-bold text-slate-900 dark:text-white">4.9/5 تقييم ممتاز</div>
                                    <div className="text-xs sm:text-sm text-slate-555 dark:text-slate-400">من قبل آلاف الطلاب</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 flex justify-center py-6 lg:py-0">
                            <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-[440px]">
                                <div className="relative p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group overflow-hidden">
                                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-indigo-600 transition-all duration-500 group-hover:w-full group-hover:h-full group-hover:opacity-10 opacity-30"></div>
                                    <div className="w-14 h-14 bg-gray-50 dark:bg-slate-800/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-12">
                                        <Clock className="w-7 h-7" />
                                    </div>
                                    <h3 className="font-black text-slate-900 dark:text-white text-sm sm:text-base mb-1">أوقات مرنة</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">اختر مواعيدك المفضلة</p>
                                </div>
                                <div className="relative p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group overflow-hidden">
                                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-amber-500 transition-all duration-500 group-hover:w-full group-hover:h-full group-hover:opacity-10 opacity-30"></div>
                                    <div className="w-14 h-14 bg-gray-50 dark:bg-slate-800/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition-all transform group-hover:-rotate-12">
                                        <ClipboardCheck className="w-7 h-7" />
                                    </div>
                                    <h3 className="font-black text-slate-900 dark:text-white text-sm sm:text-base mb-1">متابعة دقيقة</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">تقارير إنجاز أسبوعية</p>
                                </div>
                                <div className="relative p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group overflow-hidden">
                                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-emerald-600 transition-all duration-500 group-hover:w-full group-hover:h-full group-hover:opacity-10 opacity-30"></div>
                                    <div className="w-14 h-14 bg-gray-50 dark:bg-slate-800/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all transform group-hover:scale-110">
                                        <Mic className="w-7 h-7" />
                                    </div>
                                    <h3 className="font-black text-slate-900 dark:text-white text-sm sm:text-base mb-1">معلمون مجازون</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">نخبة الحفاظ المبدعون</p>
                                </div>
                                <div className="relative p-6 sm:p-8 bg-gradient-to-br from-indigo-600 to-indigo-900 border border-transparent rounded-none shadow-lg text-white flex flex-col items-center text-center group transition-all overflow-hidden cursor-pointer hover:scale-105">
                                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white transition-all duration-500 group-hover:w-full group-hover:h-full group-hover:opacity-20 opacity-40"></div>
                                    <div className="w-14 h-14 bg-white/20 text-white flex items-center justify-center mb-4 backdrop-blur-sm group-hover:rotate-12 transition-transform">
                                        <Zap className="w-7 h-7" />
                                    </div>
                                    <h3 className="font-black text-white text-sm sm:text-base mb-1">جرب مجاناً</h3>
                                    <p className="text-white/80 text-xs leading-tight">حصة تجريبية للمشتركين</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works Section - Spacing Optimized */}
            <section id="how-it-works" className="py-16 sm:py-24 relative overflow-hidden transition-colors duration-500 bg-slate-50 dark:bg-slate-950 scroll-mt-32">
                {/* Modern Mesh Gradient Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-indigo-500/[0.05] dark:bg-indigo-500/[0.08] blur-[100px] rounded-full animate-pulse"></div>
                    <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-emerald-500/[0.03] dark:bg-emerald-500/[0.06] blur-[100px] rounded-full"></div>
                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 dark:bg-slate-800 text-white rounded-full mb-4 mx-auto">
                            <Zap size={14} className="text-amber-400" />
                            <span className="text-xs font-black">ابدأ رحلتك</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 dark:text-white font-heading">
                            كيف تشترك في <span className="text-indigo-600 dark:text-indigo-400">المعهد؟</span>
                        </h2>
                    </div>
                    
                    <div className="max-w-4xl mx-auto relative pt-6">
                        {/* Creative Curved Connectors (Visible on desktop) */}
                        <div className="hidden md:block absolute inset-0 pointer-events-none overflow-visible">
                            {/* Arrow 1 to 2 */}
                            <svg className="absolute top-[40px] left-[25%] w-[25%] h-[60px]" viewBox="0 0 200 60" fill="none">
                                <path 
                                    d="M0 30 C 50 0, 150 0, 200 30" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeDasharray="6 6" 
                                    className="text-slate-200 dark:text-slate-800"
                                />
                                <path d="M195 25 L205 32 L195 39" stroke="currentColor" strokeWidth="2" className="text-slate-200 dark:text-slate-800" />
                            </svg>
                            {/* Arrow 2 to 3 */}
                            <svg className="absolute top-[40px] right-[25%] w-[25%] h-[60px]" viewBox="0 0 200 60" fill="none">
                                <path 
                                    d="M0 30 C 50 60, 150 60, 200 30" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeDasharray="6 6" 
                                    className="text-slate-200 dark:text-slate-800"
                                />
                                <path d="M195 25 L205 32 L195 39" stroke="currentColor" strokeWidth="2" className="text-slate-200 dark:text-slate-800" />
                            </svg>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6 pt-6">
                            {[
                                {
                                    id: '01',
                                    title: 'اختر الخدمة',
                                    desc: 'حدد النظام التعليمي المناسب لطفلك وابدأ رحلة التعلم.',
                                    icon: <Users className="w-7 h-7 sm:w-6 sm:h-6" />,
                                    color: 'from-slate-900 to-slate-800'
                                },
                                {
                                    id: '02',
                                    title: 'حصة مجانية',
                                    desc: 'استمتع بالتجريب المجاني أولاً لتتعرف على طريقتنا المميزة.',
                                    icon: <Star className="w-7 h-7 sm:w-6 sm:h-6" />,
                                    color: 'from-emerald-600 to-emerald-500'
                                },
                                {
                                    id: '03',
                                    title: 'اشترك الآن',
                                    desc: 'تواصل معنا مباشرة لحجز مقعدك والبدء بالجدول المناسب.',
                                    icon: <Zap className="w-7 h-7 sm:w-6 sm:h-6" />,
                                    color: 'from-indigo-600 to-indigo-500'
                                }
                            ].map((step) => (
                                <div key={step.id} className="relative group flex flex-col items-center">
                                    {/* Floating Number Circle */}
                                    <div className={cn(
                                        "w-20 h-20 sm:w-[90px] sm:h-[90px] rounded-[30%] flex items-center justify-center text-white shadow-xl mb-4 sm:mb-6 relative transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 bg-gradient-to-br",
                                        step.color
                                    )}>
                                        <div>
                                            {step.icon}
                                        </div>
                                        <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-7 sm:h-7 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black shadow-lg border border-slate-100 dark:border-slate-850">
                                            {step.id}
                                        </span>
                                    </div>

                                    {/* Content Card */}
                                    <div className="text-center px-4 w-full">
                                        <h3 className="text-lg sm:text-sm md:text-base font-black text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors">
                                            {step.title}
                                        </h3>
                                        <p className="text-xs sm:text-[11px] md:text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-bold max-w-[240px] sm:max-w-none mx-auto">
                                            {step.desc}
                                        </p>
                                    </div>
                                    
                                    {/* Decorative dot for flow */}
                                    <div className="hidden md:block absolute top-[45px] -right-2 w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 group-last:hidden"></div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-14 flex justify-center">
                            <a
                                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في البدء وحجز حصة تجريبية مجانية')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative px-10 py-4 bg-slate-900 dark:bg-slate-800 text-white font-black text-base rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative flex items-center gap-2">
                                    <span>احجز حصتك المجانية الآن</span>
                                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section - Bento Grid Refinement for Premium Royal Aesthetic */}
            <section className="py-16 sm:py-24 bg-[rgb(var(--bg-card))] relative overflow-hidden transition-colors duration-500">
                {/* Neon Indigo Dashed Lines - Section Boundaries */}
                <div className="absolute top-0 left-0 w-full h-px border-t border-dashed border-indigo-500/40 z-20 shadow-[0_0_10px_rgba(99,102,241,0.2)]"></div>
                <div className="absolute bottom-0 left-0 w-full h-px border-b border-dashed border-indigo-500/40 z-20 shadow-[0_0_10px_rgba(99,102,241,0.2)]"></div>

                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-8 md:mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-600/5 border border-indigo-500/10 rounded-full mb-3 mx-auto">
                            <Quote size={14} className="text-indigo-600" />
                            <span className="text-xs font-black text-indigo-700 dark:text-indigo-300">آراء يعتز بها</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3 font-heading leading-tight">
                            ماذا يقول <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-indigo-500">أولياء الأمور؟</span>
                        </h2>
                    </div>

                    <div className="max-w-6xl mx-auto">
                        {/* Mobile View - Compact Slider */}
                        <div className="lg:hidden">
                            <div className="relative group">
                                <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col min-h-[180px]">
                                    <Quote size={40} className="text-indigo-500/10 absolute -top-1 -left-1" />
                                    
                                    <div className="relative z-10 flex flex-col h-full flex-grow">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="bg-[#064E3B] text-white px-4 py-1.5 rounded-full text-xs sm:text-sm font-black">
                                                {reviews[currentIndex].name}
                                            </div>
                                            <div className="flex gap-0.5 text-amber-500">
                                                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="currentColor" />)}
                                            </div>
                                        </div>
                                        
                                        <div className="flex-grow">
                                            <p className="text-slate-700 dark:text-slate-350 text-sm sm:text-base leading-relaxed font-medium italic">
                                                "{reviews[currentIndex].content}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Dots navigation for mobile manual browse */}
                            <div className="flex justify-center gap-2 mt-6">
                                {reviews.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-indigo-650 dark:bg-indigo-400 w-5' : 'bg-slate-300 dark:bg-slate-700'}`}
                                        aria-label={`Slide ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Desktop View - Bento Grid Style */}
                        <div className="hidden lg:grid lg:grid-cols-3 grid-flow-row-dense gap-6 transition-all duration-1000">
                            {reviews.map((review, index) => {
                                // Logic for Dual Merging: Two cards take 2 columns each (2x1)
                                const isFirstDual = index === (currentIndex % reviews.length);
                                const isSecondDual = index === ((currentIndex + 3) % reviews.length);
                                const isLarge = isFirstDual || isSecondDual;
                                
                                return (
                                    <div 
                                        key={index} 
                                        className={`group relative border shadow-sm transition-all duration-700 hover:-translate-y-1 flex flex-col
                                            ${isLarge 
                                                ? 'lg:col-span-2 bg-[#064E3B] border-[#064E3B] text-white p-6'
                                                : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-900 dark:text-white p-4'
                                            }`}
                                        >
                                            <div className="relative z-10 flex flex-col h-full flex-grow">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="bg-[#064E3B] text-white px-4 py-1.5 rounded-full text-xs sm:text-sm font-black">
                                                        {review.name}
                                                    </div>
                                                    <div className="flex gap-0.5 text-amber-500">
                                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="currentColor" />)}
                                                    </div>
                                                </div>
                                                <div className="flex-grow">
                                                    <p className="text-sm sm:text-base leading-relaxed font-medium italic">
                                                        "{review.content}"
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

            <PublicFooter />
        </div>
    );
};
