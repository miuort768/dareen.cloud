import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { Play, ArrowLeft, Star, Heart, CheckCircle, Lightbulb, Users, Award, Zap, Clock, Mic, ClipboardCheck, BookOpen, ChevronRight, ChevronLeft as LucideChevronLeft, Quote, ChevronDown, HelpCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { SEO } from '../../components/SEO';
import { MasarSection } from '../../components/public/MasarSection';
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
                isDeleting ? i-- : i++;
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

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % reviews.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);

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
            <section className="relative pt-28 pb-0 md:pt-32 md:pb-0 h-fit overflow-hidden bg-[rgb(var(--bg-surface))]">
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
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-6">
                        <div className="lg:w-[60%] text-center z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full mb-4 mx-auto mt-4 lg:mt-0">
                                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                                <span className="text-indigo-900 font-bold text-[10px] sm:text-xs tracking-wide">منصة تعليمية بتصميم عصري</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-heading font-black text-slate-900 dark:text-white leading-none mb-0 relative">
                                <span className="sr-only">دارين السابعة للتعليم والتدريب عن بعد - المنصة رقم واحد للدروس الخصوصية وتحفيظ القرآن في الكويت، قطر، السعودية، الامارات، وسلطنة عمان</span>
                                <span className="block mb-0 min-h-[1.1em] aria-hidden">{typewriterText || '\u00A0'}<span className="inline-block animate-pulse border-r-4 border-indigo-600 dark:border-white ml-1 h-[0.9em] align-middle"></span></span>
                                <span className="text-xl sm:text-2xl lg:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 block -mt-1 py-1 aria-hidden">
                                    للتعليم والتدريب عن بعد
                                </span>
                            </h1>
                            <p className="text-[11px] sm:text-xs md:text-xs lg:text-sm text-slate-600 dark:text-slate-400 leading-normal mb-5 max-w-[320px] sm:max-w-full mx-auto px-0 tracking-tighter font-medium">
                                منصة متكاملة تجمع بين أفضل المعلمين وأحدث تقنيات التعليم الإلكتروني لضمان تفوق أبنائكم دائماً.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                                <Link
                                    to="/courses"
                                    onClick={() => window.scrollTo(0, 0)}
                                    className="px-6 py-3 sm:px-10 sm:py-4 bg-indigo-950 text-white font-bold text-base sm:text-lg shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 group"
                                >
                                    <span>تصفح الدورات</span>
                                    <ArrowLeft className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />
                                </Link>
                                <button
                                    onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="px-6 py-3 sm:px-10 sm:py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 font-bold text-base sm:text-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition">
                                        <Play className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                                    </div>
                                    <span>دليل الاستخدام؟</span>
                                </button>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-6">
                                <div className="flex -space-x-3 space-x-reverse">
                                    {[1, 2, 3].map((i) => (
                                        <img
                                            key={i}
                                            src={`https://i.pravatar.cc/100?img=${i + 10}`}
                                            className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                                            alt="User"
                                            loading="lazy"
                                        />
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                        +2k
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                                        4.9/5
                                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">تقييم الطلاب وأولياء الأمور</p>
                                </div>
                            </div>
                        </div>
                        <div className="hidden lg:flex lg:w-[40%] justify-center z-10 relative">
                            <div className="relative w-full max-w-[500px] aspect-[4/5] flex items-center justify-center">
                                {/* Rotating Dashed Circle - Size Reduced */}
                                <div className="absolute inset-[2%] border-[1px] border-dashed border-indigo-600/40 rounded-full animate-spin-slow pointer-events-none"></div>
                                <div className="absolute inset-[4%] border-[1px] border-dashed border-purple-500/20 rounded-full animate-reverse-spin-slow pointer-events-none"></div>
                                
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-[3rem] blur-2xl animate-pulse"></div>
                                <img
                                    src="/hero-child.png"
                                    alt="Hero"
                                    className="relative w-full h-full object-contain filter drop-shadow-2xl z-20"
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
            <section className="pt-8 pb-2 bg-[rgb(var(--bg-card))] relative overflow-hidden transition-colors duration-500">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-2 max-w-5xl mx-auto">
                        <h2 className="text-2xl lg:text-5xl font-heading font-black text-slate-900 dark:text-white mb-0 uppercase leading-[1.4] py-0">
                            لماذا <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 py-1 inline-block">تختارنا؟</span>
                        </h2>
                        <div className="h-1.5 w-24 bg-gradient-to-r from-indigo-600 to-transparent mx-auto rounded-full mb-4"></div>
                        <p className="text-gray-500 text-xs sm:text-sm md:text-base leading-relaxed font-medium">
                            نقدم تجربة تعليمية متكاملة تجمع بين أحدث التقنيات وأفضل الكوادر التعليمية لضمان مستقبل مشرق لأبنائكم.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-x-8 md:gap-y-4 max-w-6xl mx-auto pt-2 pb-8 md:pb-12">
                        <div className="md:col-span-2 relative p-6 bg-gradient-to-br from-indigo-600 to-indigo-950 rounded-none shadow-2xl overflow-hidden flex items-center gap-4">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                            <div className="relative z-10 w-12 h-12 bg-white/20 backdrop-blur-md rounded-none flex items-center justify-center shrink-0 border border-white/30 group-hover:scale-110 transition-transform">
                                <Lightbulb className="w-6 h-6 text-white" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-base font-bold text-white mb-1">طرق تعليم مبتكرة</h3>
                                <p className="text-xs text-indigo-50 leading-relaxed">
                                    طرق تعليم تفاعلية حديثة تنمي مهارات الفهم والتفكير الإبداعي لدى طفلك.
                                </p>
                            </div>
                        </div>

                        <div className="p-6 bg-gradient-to-br from-purple-600 to-purple-800 rounded-none shadow-xl text-white relative overflow-hidden flex items-center gap-4">
                            <div className="absolute top-0 left-0 w-16 h-16 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-none flex items-center justify-center shrink-0 border border-white/30 animate-bounce-slow">
                                <Heart className="w-6 h-6 text-white fill-white" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-base font-bold mb-1">بيئة آمنة ومحفزة</h3>
                                <p className="text-xs text-white/90 leading-relaxed">
                                    بيئة تعليمية افتراضية آمنة تشجع الطالب على التفاعل والمشاركة بحرية.
                                </p>
                            </div>
                        </div>

                        <div className="relative p-7 bg-white dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-none shadow-sm flex items-center gap-5 group/card overflow-hidden">
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-indigo-600 transition-all duration-500 group-hover/card:w-full group-hover/card:h-full group-hover/card:opacity-10 opacity-40"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 bg-indigo-50 dark:bg-indigo-950/30 -rotate-45 translate-x-1/2 -translate-y-1/2"></div>
                            <div className="absolute bottom-2 left-10 opacity-[0.08] dark:opacity-[0.15] rotate-12 transition-transform group-hover/card:-translate-y-2">
                                <img src="/dareen_logo_new.jpg" alt="Logo" className="w-12 h-12 object-contain opacity-20 dark:opacity-30" />
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.06] dark:opacity-[0.1] transition-transform group-hover/card:scale-110">
                                <BookOpen size={64} className="text-black dark:text-white" />
                            </div>
                            <div className="relative z-10 w-14 h-14 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 rounded-none flex items-center justify-center shrink-0 group-hover/card:scale-110 group-hover/card:rotate-6 transition-transform">
                                <CheckCircle className="w-7 h-7" />
                            </div>
                            <div className="relative z-10 text-right">
                                <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">نتائج مضمونة</h3>
                                <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed font-medium">
                                    متابعة دقيقة لضمان تحقيق أفضل النتائج التعليمية.
                                </p>
                            </div>
                        </div>

                        <div className="md:col-span-2 p-6 md:p-8 bg-black rounded-none shadow-2xl text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6">
                                <div className="flex-1 text-center lg:text-right">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/50 border border-white/10 rounded-full mb-2 mx-auto lg:mx-0">
                                        <Award size={16} className="text-amber-500" />
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-300">التميز التعليمي</span>
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-black mb-2 font-heading text-white">بيئة تعليمية متطورة</h3>
                                    <p className="text-white/80 text-xs md:text-sm leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                                        نخبة من المعلمين المبدعين لضمان تفوق طفلك أكاديمياً وتربوياً بأحدث الوسائل التعليمية.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full lg:w-auto shrink-0">
                                    <div className="p-6 bg-white/5 border border-white/10 rounded-none text-center group-hover:bg-white/10 transition-all duration-300 hover:border-indigo-400/30">
                                        <Users className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                                        <div className="text-3xl font-black text-white">+70</div>
                                        <div className="text-xs text-gray-400 font-bold">معلم خبير</div>
                                    </div>
                                    <div className="p-6 bg-white/5 border border-white/10 rounded-none text-center group-hover:bg-white/10 transition-all duration-300 hover:border-purple-600/30">
                                        <Star className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                                        <div className="text-3xl font-black text-white">+10</div>
                                        <div className="text-xs text-gray-400 font-bold">سنوات خبرة</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quran Memorization Section */}
            <section className="pt-6 pb-6 relative overflow-hidden bg-[rgb(var(--bg-surface))] transition-colors duration-500">
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
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-16 justify-center max-w-6xl mx-auto">
                        <div className="w-full lg:w-1/2 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full mb-6 mx-auto">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-emerald-900 font-bold text-xs uppercase tracking-wider">برامج تحفيظ متميزة</span>
                            </div>
                            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black mb-6 text-black leading-tight font-heading">
                                رحلتك مع <span className="text-emerald-600 relative inline-block">
                                    كتاب الله
                                    <svg className="absolute -bottom-2 left-0 w-full h-3 text-emerald-200" viewBox="0 0 100 10" preserveAspectRatio="none">
                                        <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
                                    </svg>
                                </span> تبدأ بخطوة
                            </h2>
                            <p className="text-gray-600 text-[10px] sm:text-xs lg:text-lg leading-relaxed mb-8 max-w-xl mx-auto font-medium">
                                منهجية فريدة تجمع بين أصالة التلقي وتقنيات التعليم الحديثة. نقدم حلقات فردية ومجموعات صغيرة مع نخبة من المقرئين المجازين.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-5">
                                <a
                                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في البدء بحفظ القرآن الكريم في دارين السابعة')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-10 py-4 bg-emerald-600 text-white font-bold text-lg shadow-xl hover:bg-emerald-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
                                >
                                    <span>ابدأ الحفظ الآن</span>
                                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                                </a>
                                <Link
                                    to="/courses"
                                    onClick={() => window.scrollTo(0, 0)}
                                    className="px-10 py-4 bg-white text-gray-700 border border-gray-200 font-bold text-lg hover:border-emerald-200 hover:text-emerald-700 hover:bg-emerald-50 transition-all flex items-center justify-center"
                                >
                                    تصفح المزيد
                                </Link>
                            </div>
                            <div className="items-center justify-center gap-4 inline-flex">
                                <div className="flex -space-x-3 space-x-reverse">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-[#FDFCF8] bg-emerald-100 overflow-hidden shadow-sm">
                                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Student" />
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-2 border-[#FDFCF8] bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm">+5k</div>
                                </div>
                                <div className="h-8 w-px bg-emerald-200/50 mx-2"></div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-black">4.9/5 تقييم ممتاز</div>
                                    <div className="text-xs text-gray-500">من قبل آلاف الطلاب</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 flex justify-center py-6 lg:py-0">
                            <div className="grid grid-cols-2 gap-4 w-full max-w-[400px]">
                                <div className="relative p-5 bg-white border border-gray-100 rounded-none shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group overflow-hidden">
                                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-indigo-600 transition-all duration-500 group-hover:w-full group-hover:h-full group-hover:opacity-10 opacity-30"></div>
                                    <div className="w-12 h-12 bg-gray-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-12">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-black text-black text-xs mb-1">أوقات مرنة</h3>
                                    <p className="text-[10px] text-gray-500 leading-tight">اختر مواعيدك المفضلة</p>
                                </div>
                                <div className="relative p-5 bg-white border border-gray-100 rounded-none shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group overflow-hidden">
                                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-amber-500 transition-all duration-500 group-hover:w-full group-hover:h-full group-hover:opacity-10 opacity-30"></div>
                                    <div className="w-12 h-12 bg-gray-50 text-amber-600 flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition-all transform group-hover:-rotate-12">
                                        <ClipboardCheck className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-black text-black text-xs mb-1">متابعة دقيقة</h3>
                                    <p className="text-[10px] text-gray-500 leading-tight">تقارير إنجاز أسبوعية</p>
                                </div>
                                <div className="relative p-5 bg-white border border-gray-100 rounded-none shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group overflow-hidden">
                                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-emerald-600 transition-all duration-500 group-hover:w-full group-hover:h-full group-hover:opacity-10 opacity-30"></div>
                                    <div className="w-12 h-12 bg-gray-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all transform group-hover:scale-110">
                                        <Mic className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-black text-black text-xs mb-1">معلمون مجازون</h3>
                                    <p className="text-[10px] text-gray-500 leading-tight">نخبة الحفاظ المبدعون</p>
                                </div>
                                <div className="relative p-5 bg-gradient-to-br from-indigo-600 to-indigo-900 border border-transparent rounded-none shadow-lg text-white flex flex-col items-center text-center group transition-all overflow-hidden cursor-pointer hover:scale-105">
                                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white transition-all duration-500 group-hover:w-full group-hover:h-full group-hover:opacity-20 opacity-40"></div>
                                    <div className="w-12 h-12 bg-white/20 text-white flex items-center justify-center mb-4 backdrop-blur-sm group-hover:rotate-12 transition-transform">
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-black text-white text-xs mb-1">جرب مجاناً</h3>
                                    <p className="text-white/80 text-[10px] leading-tight">حصة تجريبية للمشتركين</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works Section - Reimagined Creative Design */}
            <section id="how-it-works" className="py-10 relative overflow-hidden transition-colors duration-500 bg-slate-50 dark:bg-slate-950 scroll-mt-32">
                {/* Modern Mesh Gradient Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-indigo-500/[0.05] dark:bg-indigo-500/[0.08] blur-[100px] rounded-full animate-pulse"></div>
                    <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-emerald-500/[0.03] dark:bg-emerald-500/[0.06] blur-[100px] rounded-full"></div>
                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full mb-4 mx-auto scale-90">
                            <Zap size={12} className="text-amber-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">ابدأ رحلتك</span>
                        </div>
                        <h2 className="text-xl md:text-5xl font-black text-slate-900 dark:text-white font-heading">
                            كيف تشترك في <span className="text-indigo-600">المعهد؟</span>
                        </h2>
                    </div>
                    
                    <div className="max-w-4xl mx-auto relative pt-4">
                        {/* Creative Curved Connectors (Visible on desktop) */}
                        <div className="hidden md:block absolute inset-0 pointer-events-none overflow-visible">
                            {/* Arrow 1 to 2 */}
                            <svg className="absolute top-[30px] left-[25%] w-[25%] h-[60px]" viewBox="0 0 200 60" fill="none">
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
                            <svg className="absolute top-[30px] right-[25%] w-[25%] h-[60px]" viewBox="0 0 200 60" fill="none">
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

                        <div className="grid grid-cols-3 gap-2 md:gap-4">
                            {[
                                {
                                    id: '01',
                                    title: 'اختر الخدمة',
                                    desc: 'حدد النظام التعليمي المناسب',
                                    icon: <Users className="w-5 h-5 md:w-6 md:h-6" />,
                                    color: 'from-slate-900 to-slate-800'
                                },
                                {
                                    id: '02',
                                    title: 'حصة مجانية',
                                    desc: 'استمتع بالتجريب أولاً',
                                    icon: <Star className="w-5 h-5 md:w-6 md:h-6" />,
                                    color: 'from-emerald-600 to-emerald-500'
                                },
                                {
                                    id: '03',
                                    title: 'اشترك الآن',
                                    desc: 'تواصل لحجز مقعدك',
                                    icon: <Zap className="w-5 h-5 md:w-6 md:h-6" />,
                                    color: 'from-indigo-600 to-indigo-500'
                                }
                            ].map((step) => (
                                <div key={step.id} className="relative group flex flex-col items-center">
                                    {/* Small Floating Number Circle */}
                                    <div className={cn(
                                        "w-[55px] h-[55px] md:w-[90px] md:h-[90px] rounded-[30%] flex items-center justify-center text-white shadow-xl mb-4 md:mb-6 relative transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 bg-gradient-to-br",
                                        step.color
                                    )}>
                                        <div className="scale-75 md:scale-100">
                                            {step.icon}
                                        </div>
                                        <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-4 h-4 md:w-6 md:h-6 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-full flex items-center justify-center text-[7px] md:text-[9px] font-black shadow-lg border border-slate-100 dark:border-slate-800">
                                            {step.id}
                                        </span>
                                    </div>

                                    {/* Glass Content Card */}
                                    <div className="text-center px-1 md:px-4 w-full">
                                        <h3 className="text-[9px] md:text-sm font-black text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">
                                            {step.title}
                                        </h3>
                                        <p className="hidden sm:block text-[8px] md:text-[10px] text-slate-500 dark:text-slate-400 leading-tight font-bold">
                                            {step.desc}
                                        </p>
                                    </div>
                                    
                                    {/* Subtle decorative dot for flow */}
                                    <div className="hidden md:block absolute top-[45px] -right-2 w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 group-last:hidden"></div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 flex justify-center">
                            <a
                                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في البدء وحجز حصة تجريبية مجانية')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative px-8 py-3.5 bg-slate-900 text-white font-black text-sm rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative flex items-center gap-2">
                                    <span>احجز حصتك المجانية الآن</span>
                                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section - Spacing Optimized */}
            <section className="py-4 md:py-6 bg-[rgb(var(--bg-card))] relative overflow-hidden transition-colors duration-500">
                {/* Neon Indigo Dashed Lines - Section Boundaries */}
                <div className="absolute top-0 left-0 w-full h-px border-t border-dashed border-indigo-500/40 z-20 shadow-[0_0_10px_rgba(99,102,241,0.2)]"></div>
                <div className="absolute bottom-0 left-0 w-full h-px border-b border-dashed border-indigo-500/40 z-20 shadow-[0_0_10px_rgba(99,102,241,0.2)]"></div>

                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-4 md:mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600/5 border border-indigo-500/10 rounded-full mb-3 mx-auto">
                            <Quote size={12} className="text-indigo-600" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-700">آراء يعتز بها</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-black mb-3 font-heading leading-tight">
                            ماذا يقول <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-indigo-500">أولياء الأمور؟</span>
                        </h2>
                        <div className="h-1 w-16 bg-amber-500 mx-auto rounded-full"></div>
                    </div>

                    <div className="max-w-6xl mx-auto">
                        {/* Mobile View - Compact Slider */}
                        <div className="lg:hidden">
                            <div className="relative group">
                                <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col min-h-[220px]">
                                    <Quote size={40} className="text-indigo-500/10 absolute -top-1 -left-1" />
                                    
                                    <div className="relative z-10 flex flex-col h-full flex-grow">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="bg-[#800020] text-white px-3 py-1 rounded-full text-[10px] font-black">
                                                {reviews[currentIndex].name}
                                            </div>
                                            <div className="flex gap-0.5 text-amber-500">
                                                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill="currentColor" />)}
                                            </div>
                                        </div>
                                        
                                        <div className="flex-grow mb-4">
                                            <p className="text-gray-600 dark:text-slate-300 text-xs leading-relaxed font-medium italic">
                                                "{reviews[currentIndex].content}"
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-800 mt-auto">
                                            <p className="text-[9px] text-indigo-600 font-black uppercase tracking-[0.2em]">{reviews[currentIndex].role}</p>
                                            <div className="flex gap-2">
                                                <button onClick={prevSlide} className="w-8 h-8 rounded-none bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-slate-700">
                                                    <ChevronRight className="rotate-180" size={16} />
                                                </button>
                                                <button onClick={nextSlide} className="w-8 h-8 rounded-none bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-slate-700">
                                                    <LucideChevronLeft className="rotate-180" size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Desktop View - Compact Premium Grid */}
                        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
                            {reviews.map((review, index) => (
                                <div key={index} className="group relative bg-white dark:bg-slate-900 p-5 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-500 hover:-translate-y-1 flex flex-col">
                                    <Quote size={30} className="absolute -top-2 -left-2 text-indigo-500/5 group-hover:text-indigo-500/15 transition-all duration-500" />
                                    
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="bg-[#800020] text-white px-4 py-1.5 rounded-full text-[11px] font-black shadow-sm group-hover:scale-105 transition-transform">
                                            {review.name}
                                        </div>
                                        <div className="flex gap-0.5 text-amber-500">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill="currentColor" />)}
                                        </div>
                                    </div>
                                    
                                    <div className="flex-grow mb-4">
                                        <p className="text-gray-600 dark:text-slate-400 text-[11px] leading-relaxed font-medium italic">
                                            "{review.content}"
                                        </p>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-gray-100 dark:border-slate-800 mt-auto flex justify-between items-center">
                                        <p className="text-[9px] text-indigo-600 font-black uppercase tracking-[0.2em]">{review.role}</p>
                                        <div className="w-6 h-px bg-indigo-100 dark:bg-slate-800"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>



            <MasarSection />

            {/* FAQ Section - Spacing Optimized */}
            <section className="py-4 md:py-6 bg-[rgb(var(--bg-surface))] relative overflow-hidden transition-colors duration-500" id="faq">
                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.2]"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 15% 50%, #6366F1 0%, transparent 40%), radial-gradient(circle at 85% 50%, #8B5CF6 0%, transparent 40%)',
                        filter: 'blur(80px)'
                    }}>
                </div>
                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.1]"
                    style={{
                        backgroundImage: 'url("https://www.transparenttextures.com/patterns/simple-dashed.png")',
                        backgroundSize: '200px 200px'
                    }}>
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/50 backdrop-blur-sm border border-gray-100 rounded-full mb-2 mx-auto shadow-sm">
                            <HelpCircle size={12} className="text-indigo-600" />
                            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">لديك استفسار؟</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-black mb-3 font-heading">
                            الأسئلة <span className="text-indigo-600">الشائعة</span>
                        </h2>
                        <div className="h-1 w-16 bg-amber-500 mx-auto rounded-full"></div>
                    </div>
                    <div className="max-w-2xl mx-auto space-y-3">
                        {[
                            {
                                q: "كيف يتم الدراسة في المعهد ؟",
                                a: "الدراسة تتم عن بعد عبر فصول افتراضية تفاعلية مباشرة (لايف) بين المعلم والطالب، باستخدام أحدث التقنيات لضمان جودة الصوت والصورة."
                            },
                            {
                                q: "هل المناهج معتمدة ؟",
                                a: "نعم، نلتزم بتدريس المناهج الحكومية المعتمدة في الكويت ودول الخليج، بالإضافة إلى مناهجنا الخاصة في التأسيس واللغات."
                            },
                            {
                                q: "كيف يمكنني متابعة مستوى ابني ؟",
                                a: "نقوم بإرسال تقارير دورية ومفصلة لولي الأمر عبر الواتساب، تشمل مستوى الطالب، الحضور والغياب، وملاحظات المعلم."
                            },
                            {
                                q: "هل توجد حصص تجريبية ؟",
                                a: "نعم، نقدم حصة تجريبية مجانية لتقييم مستوى الطالب والتعرف على طريقة التدريس قبل الاشتراك الفعلي."
                            }
                        ].map((item, idx) => {
                            const icons = [<HelpCircle size={80} />, <Star size={80} />, <Heart size={80} />, <img src="/dareen_logo_new.jpg" className="w-20 h-20 object-contain opacity-20" />];
                            return (
                                <div key={idx} className="relative bg-white border border-gray-100 rounded-xl overflow-hidden group hover:border-indigo-100 transition-all duration-500 hover:shadow-md hover:shadow-indigo-500/5">
                                    <div className="absolute -bottom-4 -left-4 text-gray-400 opacity-[0.03] group-hover:opacity-[0.06] group-hover:rotate-12 transition-all duration-700 pointer-events-none">
                                        {icons[idx % icons.length]}
                                    </div>
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity pointer-events-none"></div>
                                    <details className="group relative z-10">
                                        <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                                            <h3 className="text-xs md:text-sm font-black text-black group-hover:text-indigo-600 transition-colors">
                                                {item.q}
                                            </h3>
                                            <span className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center transform group-open:rotate-180 group-open:bg-indigo-600 group-open:text-white transition-all duration-300">
                                                <ChevronDown size={14} className="text-gray-400 group-open:text-white" />
                                            </span>
                                        </summary>
                                        <div className="px-4 pb-4 pt-0">
                                            <div className="h-px w-full bg-gradient-to-r from-indigo-500/10 via-gray-100 to-transparent mb-3"></div>
                                            <p className="text-[10px] md:text-xs text-black leading-relaxed font-medium">
                                                {item.a}
                                            </p>
                                        </div>
                                    </details>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
};
