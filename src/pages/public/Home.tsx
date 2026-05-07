import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { Play, ArrowLeft, Star, Heart, CheckCircle, Lightbulb, Users, Award, Zap, Clock, Mic, ClipboardCheck, BookOpen, ChevronRight, ChevronLeft as LucideChevronLeft, Quote, ChevronDown, HelpCircle, Sparkles, ShieldCheck, Rocket } from 'lucide-react';
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
        <div className="min-h-full bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-slate-100 relative overflow-x-hidden transition-colors duration-500">
            <SEO
                title="دارين السابعة للتعليم والتدريب | المنصة رقم 1 في الكويت والسعودية وقطر والامارات وعمان"
                description="دارين السابعة للتعليم والتدريب يوفر أفضل دروس خصوصية أونلاين، مراجعات نهائية، تحفيظ قرآن، وتأسيس أكاديمي مع نخبة من المعلمين للمناهج في الكويت، السعودية، قطر، الامارات، وسلطنة عمان."
                keywords="أفضل منصة تعليمية, تعليم عن بعد الكويت, مدرس خصوصي قطر, دروس خصوصية السعودية, معلمين الامارات, دروس اونلاين سلطنة عمان, دارين السابعة, تحفيظ قرآن عن بعد"
                preloadImages={['/hero-child.png']}
            />
            <PublicNavbar />

            {/* ── Section 1: Cinematic Hero Canvas ── */}
            <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-white dark:bg-black">
                {/* Advanced Aurora Background */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/10 dark:bg-indigo-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 dark:bg-purple-600/15 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.05]"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-16 items-center">
                        <div className="lg:col-span-7 text-right">
                            {/* Premium Badge */}
                            <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-900 dark:bg-white/10 border border-white/10 rounded-none mb-8 md:animate-in md:fade-in md:slide-in-from-right-10 md:duration-700">
                                <Sparkles size={14} className="text-amber-400 animate-spin-slow" />
                                <span className="text-[10px] font-black text-white dark:text-indigo-400 uppercase tracking-[0.3em]">Signature Education Platform</span>
                            </div>

                            <h1 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] mb-8 tracking-tighter uppercase md:animate-in md:fade-in md:slide-in-from-right-16 md:duration-1000">
                                <span className="block mb-2">{typewriterText || '\u00A0'}<span className="inline-block animate-pulse border-r-8 border-indigo-600 ml-2 h-[0.9em]"></span></span>
                                <span className="text-transparent bg-clip-text bg-gradient-to-l from-indigo-600 via-purple-500 to-indigo-400 block pb-2">
                                    للتعليم والتدريب الذكي
                                </span>
                            </h1>

                            <p className="text-sm md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed mb-12 max-w-2xl font-medium tracking-tight md:animate-in md:fade-in md:slide-in-from-right-20 md:duration-1000 md:delay-200">
                                ندمج الخبرة التعليمية العريقة مع تكنولوجيا الذكاء الاصطناعي لنصنع مستقبلاً يليق بأبنائكم. <span className="text-indigo-500 font-bold">دارين السابعة.. حيث تبدأ القمة.</span>
                            </p>

                            <div className="flex flex-col sm:flex-row gap-5 md:animate-in md:fade-in md:slide-in-from-bottom-10 md:duration-1000 md:delay-300">
                                <Link
                                    to="/courses"
                                    className="group relative px-12 py-5 bg-indigo-600 text-white font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:scale-105 active:scale-95 transition-all text-center"
                                >
                                    تصفح المسارات الأكاديمية
                                    <div className="absolute inset-0 border border-white/20 translate-x-1.5 translate-y-1.5 -z-10 group-hover:translate-x-2.5 group-hover:translate-y-2.5 transition-transform"></div>
                                </Link>
                                <button
                                    onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="px-12 py-5 bg-white dark:bg-white/5 border-2 border-slate-900 dark:border-white/10 text-slate-900 dark:text-white font-black text-sm uppercase tracking-[0.2em] hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-4 group"
                                >
                                    <Play size={18} className="fill-indigo-600 text-indigo-600 group-hover:scale-125 transition-transform" />
                                    اكتشف التجربة
                                </button>
                            </div>

                            {/* Trust Markers */}
                            <div className="mt-16 flex items-center gap-8 md:animate-in md:fade-in md:duration-1000 md:delay-500">
                                <div className="flex -space-x-4 space-x-reverse">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-12 h-12 rounded-none border-4 border-white dark:border-black bg-slate-200 overflow-hidden shadow-xl transform hover:-translate-y-2 transition-transform">
                                            <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="User" />
                                        </div>
                                    ))}
                                </div>
                                <div className="h-10 w-px bg-slate-200 dark:bg-white/10"></div>
                                <div>
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <Star size={16} className="text-amber-400 fill-amber-400" />
                                        <span className="text-lg font-black dark:text-white">4.9/5</span>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي تقييمات المنصة</p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-5 relative hidden lg:block md:animate-in md:zoom-in md:duration-1000">
                            <div className="relative w-full aspect-square group">
                                <div className="absolute inset-0 bg-indigo-600/20 rounded-[4rem] blur-[80px] group-hover:bg-indigo-600/30 transition-all duration-700"></div>
                                <img
                                    src="/hero-child.png"
                                    alt="Hero"
                                    className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_35px_35px_rgba(0,0,0,0.3)] group-hover:scale-105 transition-transform duration-700"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000&auto=format&fit=crop';
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Section 2: Signature Horizontal Ticker ── */}
            <div className="bg-amber-400 dark:bg-indigo-600 py-4 overflow-hidden whitespace-nowrap border-y-4 border-slate-900 dark:border-white/10">
                <div className="inline-flex gap-20 animate-marquee">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-6">
                            <span className="text-xs md:text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.4em]">دروس خصوصية أونلاين</span>
                            <Sparkles size={16} className="text-slate-900 dark:text-white" />
                            <span className="text-xs md:text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.4em]">تحفيظ القرآن الكريم</span>
                            <Sparkles size={16} className="text-slate-900 dark:text-white" />
                            <span className="text-xs md:text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.4em]">تأسيس أكاديمي شامل</span>
                            <Sparkles size={16} className="text-slate-900 dark:text-white" />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Section 3: Why Choose Us (Brutalist Modern) ── */}
            <section className="py-24 bg-white dark:bg-black relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20 max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6">
                            <ShieldCheck size={12} className="text-indigo-500" />
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Advanced Features</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6 leading-none">
                            لماذا <span className="text-indigo-600">تختارنا؟</span>
                        </h2>
                        <p className="text-sm md:text-lg text-slate-400 font-medium max-w-xl mx-auto leading-relaxed uppercase tracking-wide">
                            نظام تعليمي متكامل صُمم ليحقق التوازن بين الإبداع الأكاديمي والراحة التقنية.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {[
                            { 
                                title: 'طرق تعليم ذكية', 
                                desc: 'نستخدم تقنيات التلعيب (Gamification) لجذب انتباه الطالب وتحفيزه على التعلم المستمر.', 
                                icon: Lightbulb, 
                                color: 'text-indigo-500', 
                                bg: 'bg-indigo-500/5', 
                                border: 'border-indigo-500/20' 
                            },
                            { 
                                title: 'بيئة آمنة تماماً', 
                                desc: 'فصول افتراضية مشفرة وتحت إشراف تربوي كامل لضمان أعلى مستويات الأمان لطفلك.', 
                                icon: ShieldCheck, 
                                color: 'text-emerald-500', 
                                bg: 'bg-emerald-500/5', 
                                border: 'border-emerald-500/20' 
                            },
                            { 
                                title: 'نتائج ملموسة', 
                                desc: 'تقارير أداء دورية مدعومة بالبيانات لولي الأمر لمتابعة كل خطوة في رحلة التفوق.', 
                                icon: Award, 
                                color: 'text-amber-500', 
                                bg: 'bg-amber-500/5', 
                                border: 'border-amber-500/20' 
                            }
                        ].map((feature, i) => (
                            <div key={i} className={cn(
                                "relative group p-10 bg-white dark:bg-slate-900 border-2 transition-all duration-500 hover:-translate-y-2",
                                feature.border
                            )}>
                                <div className="absolute top-0 left-0 w-12 h-1 bg-indigo-600 group-hover:w-full transition-all duration-500"></div>
                                <div className={cn("w-14 h-14 border mb-8 flex items-center justify-center transition-transform group-hover:rotate-12", feature.border, feature.bg)}>
                                    <feature.icon size={28} className={feature.color} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-4">{feature.title}</h3>
                                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{feature.desc}</p>
                                <div className="mt-8 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowLeft size={20} className={cn(feature.color, "group-hover:-translate-x-2 transition-transform")} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Section 4: Quran Memorization (Emerald Gold Style) ── */}
            <section className="relative py-24 bg-slate-900 dark:bg-black overflow-hidden border-y-8 border-emerald-600">
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2 text-right">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">إجازة وإتقان</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-8 leading-none">
                                رحلتك مع <span className="text-emerald-500">كتاب الله</span> تبدأ من هنا
                            </h2>
                            <p className="text-sm md:text-lg text-slate-400 font-medium mb-12 leading-relaxed">
                                نعتمد في دارين السابعة على نهج "التلقي المباشر" الذي يجمع بين الضبط اللفظي والتدبر الإيماني، مع نخبة من الحفاظ المجازين بالقراءات العشر.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-6">
                                <a
                                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في البدء بحفظ القرآن الكريم في دارين السابعة')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-10 py-5 bg-emerald-600 text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 hover:bg-emerald-500 transition-all text-center flex items-center justify-center gap-3"
                                >
                                    سجل في حلقات التحفيظ
                                    <Rocket size={18} />
                                </a>
                                <Link
                                    to="/courses"
                                    className="px-10 py-5 border-2 border-white/10 text-white font-black text-sm uppercase tracking-[0.2em] hover:bg-white/5 transition-all text-center"
                                >
                                    المسارات القرآنية
                                </Link>
                            </div>
                        </div>

                        <div className="lg:w-1/2 grid grid-cols-2 gap-6">
                            {[
                                { title: 'مقرئون مجازون', icon: Mic, count: '100+' },
                                { title: 'ساعات حفظ', icon: Clock, count: '50k+' },
                                { title: 'طالب وطالبة', icon: Users, count: '10k+' },
                                { title: 'ختمة مكتملة', icon: BookOpen, count: '2k+' }
                            ].map((stat, i) => (
                                <div key={i} className="p-8 bg-white/5 border border-white/10 group hover:border-emerald-500 transition-all">
                                    <stat.icon size={24} className="text-emerald-500 mb-4 group-hover:scale-125 transition-transform" />
                                    <div className="text-2xl font-black text-white mb-1 uppercase tracking-tighter">{stat.count}</div>
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.title}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Section 5: How it Works (Abstract Flow) ── */}
            <section id="how-it-works" className="py-24 bg-white dark:bg-black scroll-mt-20">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full mb-6">
                            <Zap size={12} className="text-amber-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Protocol</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">بروتوكول الانضمام</h2>
                    </div>

                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Decorative Line (Desktop) */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-800 -z-10"></div>

                        {[
                            { step: '01', title: 'اختيار المسار', desc: 'تحديد النظام الأكاديمي أو القرآني المناسب للطالب.', icon: Users },
                            { step: '02', title: 'الجلسة التعريفية', desc: 'حصة تجريبية مجانية لتقييم المستوى والتفاعل المباشر.', icon: Star },
                            { step: '03', title: 'بدء الرحلة', desc: 'تفعيل حساب الطالب والانطلاق في غرفة العمليات.', icon: Rocket }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center text-center group">
                                <div className="w-20 h-20 bg-white dark:bg-slate-900 border-4 border-indigo-600 rounded-none flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 transition-transform">
                                    <item.icon size={32} className="text-indigo-600" />
                                </div>
                                <div className="text-indigo-600 font-black text-sm uppercase tracking-[0.3em] mb-4">{item.step}</div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">{item.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed px-6">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Section 6: Testimonials (Signature Grid) ── */}
            <section className="py-24 bg-slate-50 dark:bg-black relative">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20 max-w-4xl mx-auto">
                        <Quote size={40} className="text-indigo-600 mx-auto mb-8 opacity-20" />
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">أصوات النجاح</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
                        {reviews.slice(0, 6).map((review, i) => (
                            <div key={i} className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-all hover:shadow-2xl group">
                                <div className="flex gap-1 mb-6 text-amber-400">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="currentColor" />)}
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium italic mb-8 leading-loose">"{review.content}"</p>
                                <div className="flex items-center gap-4 pt-6 border-t border-slate-50 dark:border-slate-800">
                                    <div className="w-12 h-12 bg-slate-200 dark:bg-black rounded-none border-2 border-indigo-600/20 overflow-hidden group-hover:scale-110 transition-transform">
                                        <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tighter">{review.name}</h4>
                                        <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">{review.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <MasarSection />

            {/* FAQ (Minimal & Sharp) */}
            <section className="py-24 bg-white dark:bg-black" id="faq">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto grid lg:grid-cols-12 gap-16">
                        <div className="lg:col-span-5">
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 leading-[1.1]">
                                الأسئلة <span className="text-indigo-600">الشائعة</span>
                            </h2>
                            <p className="text-slate-500 font-medium mb-10 leading-relaxed uppercase tracking-widest text-xs">
                                كل ما تحتاج لمعرفته حول بروتوكولات التعليم في دارين السابعة.
                            </p>
                            <div className="w-20 h-1.5 bg-indigo-600"></div>
                        </div>

                        <div className="lg:col-span-7 space-y-4">
                            {[
                                { q: "كيف يتم الدراسة في المعهد ؟", a: "الدراسة تتم عن بعد عبر فصول افتراضية تفاعلية مباشرة (لايف) بين المعلم والطالب، باستخدام أحدث التقنيات لضمان جودة الصوت والصورة." },
                                { q: "هل المناهج معتمدة ؟", a: "نعم، نلتزم بتدريس المناهج الحكومية المعتمدة في الكويت ودول الخليج، بالإضافة إلى مناهجنا الخاصة في التأسيس واللغات." },
                                { q: "كيف يمكنني متابعة مستوى ابني ؟", a: "نقوم بإرسال تقارير دورية ومفصلة لولي الأمر عبر الواتساب، تشمل مستوى الطالب، الحضور والغياب، وملاحظات المعلم." },
                                { q: "هل توجد حصص تجريبية ؟", a: "نعم، نقدم حصة تجريبية مجانية لتقييم مستوى الطالب والتعرف على طريقة التدريس قبل الاشتراك الفعلي." }
                            ].map((item, i) => (
                                <details key={i} className="group bg-slate-50 dark:bg-slate-900/50 border border-transparent open:border-indigo-600 transition-all duration-500">
                                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                                        <h3 className="text-xs md:text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight group-open:text-indigo-600 transition-colors">
                                            {item.q}
                                        </h3>
                                        <Plus size={16} className="text-slate-400 group-open:rotate-45 transition-transform" />
                                    </summary>
                                    <div className="px-6 pb-6 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                        {item.a}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <PublicFooter />
            
            {/* Custom Styles for Animations */}
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(100%); }
                }
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                    display: inline-flex;
                    flex-direction: row-reverse;
                }
                .animate-spin-slow {
                    animation: spin 8s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};
