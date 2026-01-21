import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { Play, ArrowLeft, Star, Heart, CheckCircle, Lightbulb, Users, Award, Zap, Quote, ChevronRight, ChevronLeft as LucideChevronLeft, Clock, Mic, ClipboardCheck } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useApp } from '../../context/AppContext';
import { SEO } from '../../components/SEO';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
    const { adminPhone } = useSettings();
    const { isAuthenticated, currentUser } = useApp();
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (isAuthenticated) {
            if (currentUser?.role === 'chat_user') {
                navigate('/chat', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        }
    }, [isAuthenticated, currentUser, navigate]);

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
            content: "أحسن قرار خذيته إني سجلت عيالي بمعهد دارين. المدرسين قمة في الأخلاق والتعامل، ويوصلون المعلومة بسلاسة.",
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
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 relative select-none overflow-x-hidden">
            <SEO
                title="الرئيسية"
                description="معهد دارين وأكاديمية دارين للتعليم والتدريب - الخيار الأول للتعليم عن بعد في الكويت والخليج. دروس خصوصية لجميع المراحل، تحفيظ قرآن، ولغات."
            />
            <PublicNavbar />

            {/* Blob Backgrounds */}
            <div className="hero-blob bg-blue-600/10 w-96 h-96 rounded-full top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none hidden md:block"></div>
            <div className="hero-blob bg-gold/10 w-[30rem] h-[30rem] rounded-full bottom-0 right-0 translate-x-1/2 translate-y-1/2 pointer-events-none hidden md:block"></div>

            {/* Hero Section */}
            <section className="relative pt-4 md:pt-48 md:pb-8 overflow-hidden bg-[#FDFCF8]">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12">

                        {/* Text Content */}
                        <div className="lg:w-1/2 text-center z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-100 rounded-full mb-3 mx-auto">
                                <span className="w-2 h-2 rounded-full bg-gold animate-pulse"></span>
                                <span className="text-yellow-800 font-bold text-[10px] sm:text-xs tracking-wide">منصة تعليمية بتصميم عصري</span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-heading font-black text-gray-900 leading-tight mb-3">
                                <span className="block mb-2">معهد دارين</span>
                                <span className="block text-xl sm:text-2xl lg:text-4xl">
                                    | <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-gold">أكاديمية دارين لتعليم والتدريب</span>
                                </span>
                            </h1>

                            <p className="text-[11px] sm:text-base lg:text-lg text-gray-500 leading-relaxed mb-8 max-w-[320px] sm:max-w-xl mx-auto px-2">
                                منصة متكاملة تجمع بين أفضل المعلمين وأحدث تقنيات التعليم الإلكتروني لضمان تفوق أبنائكم في جميع المراحل الدراسية.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                                <Link
                                    to="/courses"
                                    className="px-6 py-3 sm:px-10 sm:py-4 bg-gray-900 text-white font-bold text-base sm:text-lg shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group"
                                >
                                    <span>تصفح الدورات</span>
                                    <ArrowLeft className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />
                                </Link>
                                <a
                                    href={`https://wa.me/${adminPhone}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-3 sm:px-10 sm:py-4 bg-white text-gray-900 border border-gray-200 font-bold text-base sm:text-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center group-hover:scale-110 transition">
                                        <Play className="w-4 h-4 text-gold fill-gold" />
                                    </div>
                                    <span>كيف نعمل؟</span>
                                </a>
                            </div>

                            {/* Trust Badges */}
                            <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-center gap-6">
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
                                    <div className="font-bold text-gray-900 flex items-center gap-1">
                                        4.9/5
                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium">تقييم الطلاب وأولياء الأمور</p>
                                </div>
                            </div>
                        </div>

                        {/* Image Side */}
                        <div className="hidden lg:flex lg:w-1/2 justify-center z-10 relative">
                            <div className="relative w-full max-w-[500px] aspect-[4/5]">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-gold/20 rounded-[3rem] blur-2xl animate-pulse"></div>
                                <img
                                    src="/hero-child.png"
                                    alt="Hero"
                                    className="relative w-full h-full object-contain filter drop-shadow-2xl z-10"
                                    loading="lazy"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000&auto=format&fit=crop';
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="pt-20 pb-24 bg-white relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <h2 className="text-3xl lg:text-5xl font-heading font-black text-gray-900 mb-8 uppercase leading-normal py-2">
                            لماذا <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-gold">تختارنا؟</span>
                        </h2>
                        <div className="h-1.5 w-24 bg-gradient-to-r from-blue-600 to-transparent mx-auto rounded-full mb-8"></div>
                        <p className="text-gray-500 text-lg leading-relaxed">
                            نقدم تجربة تعليمية متكاملة تجمع بين أحدث التقنيات وأفضل الكوادر التعليمية لضمان مستقبل مشرق لأبنائكم.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Feature 1 */}
                        <div className="md:col-span-2 relative p-8 md:p-12 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-none shadow-2xl overflow-hidden group">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-none flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                                    <Lightbulb className="w-10 h-10 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">طرق تعليم مبتكرة</h3>
                                    <p className="text-blue-50 text-sm md:text-lg leading-relaxed">
                                        طرق تعليم تفاعلية حديثة تنمي مهارات الفهم والتفكير الإبداعي لدى طفلك.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-8 bg-gradient-to-br from-gold to-gold-hover rounded-none shadow-xl text-white group">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-none flex items-center justify-center mb-6 border border-white/30 group-hover:rotate-12 transition-transform">
                                <Heart className="w-8 h-8 text-white fill-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">بيئة آمنة ومحفزة</h3>
                            <p className="text-white/90 leading-relaxed">
                                بيئة تعليمية افتراضية آمنة تشجع الطالب على التفاعل والمشاركة بحرية.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-8 bg-white border border-gray-100 rounded-none shadow-sm hover:shadow-xl transition-all group">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-none flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">نتائج مضمونة</h3>
                            <p className="text-gray-500 leading-relaxed">
                                متابعة دقيقة وتقارير دورية لضمان تحقيق أفضل النتائج التعليمية.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="md:col-span-2 p-8 md:p-12 bg-gray-900 rounded-none shadow-2xl text-white relative overflow-hidden group">
                            {/* Decorative Glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
                                <div className="flex-1 text-center lg:text-right">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full mb-6 border border-white/10 mx-auto lg:mx-0">
                                        <Award size={16} className="text-gold" />
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-300">التميز التعليمي</span>
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-black mb-4 font-heading text-white">نخبة من المعلمين المبدعين</h3>
                                    <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                                        نخبة من المعلمين المبدعين لضمان تفوق طفلك أكاديمياً وتربوياً بأحدث الوسائل.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full lg:w-auto shrink-0">
                                    <div className="p-6 bg-white/5 border border-white/10 rounded-none text-center group-hover:bg-white/10 transition-all duration-300 hover:border-blue-500/30">
                                        <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                                        <div className="text-3xl font-black text-white">+50</div>
                                        <div className="text-xs text-gray-400 font-bold">معلم خبير</div>
                                    </div>
                                    <div className="p-6 bg-white/5 border border-white/10 rounded-none text-center group-hover:bg-white/10 transition-all duration-300 hover:border-gold/30">
                                        <Star className="w-8 h-8 text-gold mx-auto mb-3" />
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
            <section className="py-20 relative overflow-hidden bg-[#FDFCF8]">
                {/* Subtle Islamic Pattern Background */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'radial-gradient(#10B981 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16 justify-center max-w-6xl mx-auto">

                        {/* Content Side */}
                        <div className="w-full lg:w-1/2 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full mb-6 mx-auto">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-emerald-800 font-bold text-xs uppercase tracking-wider">برامج تحفيظ متميزة</span>
                            </div>

                            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black mb-6 text-gray-900 leading-tight font-heading">
                                رحلتك مع <span className="text-emerald-600 relative inline-block">
                                    كتاب الله
                                    <svg className="absolute -bottom-2 left-0 w-full h-3 text-emerald-200" viewBox="0 0 100 10" preserveAspectRatio="none">
                                        <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
                                    </svg>
                                </span> تبدأ بخطوة
                            </h2>

                            <p className="text-gray-600 text-base lg:text-lg leading-relaxed mb-8 max-w-xl mx-auto font-medium">
                                منهجية فريدة تجمع بين أصالة التلقي وتقنيات التعليم الحديثة. نقدم <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">حلقات فردية</span> ومجموعات صغيرة مع نخبة من المقرئين المجازين.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                                <a
                                    href={`https://wa.me/${adminPhone}?text=${encodeURIComponent('السلام عليكم، أرغب في البدء بحفظ القرآن الكريم في معهد دارين')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-10 py-4 bg-emerald-600 text-white font-bold text-lg shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
                                >
                                    <span>ابدأ الحفظ الآن</span>
                                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                                </a>
                                <Link to="/courses" className="px-10 py-4 bg-white text-gray-700 border border-gray-200 font-bold text-lg hover:border-emerald-200 hover:text-emerald-700 hover:bg-emerald-50 transition-all flex items-center justify-center">
                                    تصفح المزيد
                                </Link>
                            </div>

                            {/* Trust Badge (Cleaned) */}
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
                                    <div className="text-sm font-bold text-gray-900">4.9/5 تقييم ممتاز</div>
                                    <div className="text-xs text-gray-500">من قبل آلاف الطلاب</div>
                                </div>
                            </div>
                        </div>

                        {/* Visual Side (Geometric Diamonds) */}
                        <div className="w-full lg:w-1/2 flex justify-center py-12 lg:py-0 overflow-visible">
                            <div className="relative w-[280px] h-[280px] md:w-[400px] md:h-[400px] scale-90 sm:scale-100">

                                {/* Top Card - Flexible Times */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 md:w-44 md:h-44 bg-white rounded-3xl shadow-xl border border-gray-100 flex items-center justify-center rotate-45 hover:scale-110 hover:z-30 transition-all group cursor-default">
                                    <div className="-rotate-45 text-center px-2 md:px-4">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 md:mb-3 mx-auto group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                            <Clock className="w-4 h-4 md:w-5 md:h-5" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-xs md:text-sm mb-0.5 md:mb-1">أوقات مرنة</h3>
                                        <p className="text-gray-400 text-[9px] md:text-[10px] leading-tight font-medium hidden sm:block">اختر مواعيدك المفضلة</p>
                                    </div>
                                </div>

                                {/* Right Card - Accurate Follow-up */}
                                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-32 h-32 md:w-44 md:h-44 bg-white rounded-3xl shadow-xl border border-gray-100 flex items-center justify-center rotate-45 hover:scale-110 hover:z-30 transition-all group cursor-default">
                                    <div className="-rotate-45 text-center px-2 md:px-4">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 md:mb-3 mx-auto group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                            <ClipboardCheck className="w-4 h-4 md:w-5 md:h-5" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-xs md:text-sm mb-0.5 md:mb-1">متابعة دقيقة</h3>
                                        <p className="text-gray-400 text-[9px] md:text-[10px] leading-tight font-medium hidden sm:block">تقارير إنجاز أسبوعية</p>
                                    </div>
                                </div>

                                {/* Left Card - Certified Teachers */}
                                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-32 h-32 md:w-44 md:h-44 bg-white rounded-3xl shadow-xl border border-gray-100 flex items-center justify-center rotate-45 hover:scale-110 hover:z-30 transition-all group cursor-default">
                                    <div className="-rotate-45 text-center px-2 md:px-4">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 md:mb-3 mx-auto group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <Mic className="w-4 h-4 md:w-5 md:h-5" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-xs md:text-sm mb-0.5 md:mb-1">معلمون مجازون</h3>
                                        <p className="text-gray-400 text-[9px] md:text-[10px] leading-tight font-medium hidden sm:block">نخبة الحفاظ المبدعون</p>
                                    </div>
                                </div>

                                {/* Bottom Card - Try Free */}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-32 md:w-44 md:h-44 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-2xl shadow-emerald-200/50 flex items-center justify-center rotate-45 hover:scale-110 hover:z-30 transition-all group cursor-default">
                                    <div className="-rotate-45 text-center px-2 md:px-4">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center mb-2 md:mb-3 mx-auto">
                                            <Zap className="w-4 h-4 md:w-5 md:h-5" />
                                        </div>
                                        <h3 className="font-bold text-white text-xs md:text-sm mb-0.5 md:mb-1">جرب مجاناً</h3>
                                        <p className="text-white/70 text-[9px] md:text-[10px] leading-tight font-medium hidden sm:block">حصة تجريبية للمشتركين</p>
                                    </div>
                                </div>

                                {/* Central Glow */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-emerald-500/20 rounded-full blur-2xl animate-pulse"></div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-white relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-black text-gray-900 uppercase">
                            آراء <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-gold">أولياء الأمور</span>
                        </h2>
                        <div className="h-1.5 w-24 bg-gradient-to-r from-blue-600 to-transparent mx-auto rounded-full mt-4"></div>
                    </div>

                    <div className="max-w-6xl mx-auto relative">
                        {/* Mobile Slider (Shows 1 card) */}
                        <div className="block lg:hidden">
                            <div className="relative">
                                <div className="p-8 bg-gray-50 border border-gray-100 rounded-none relative transition-all duration-500 min-h-[250px] flex flex-col justify-center">
                                    <Quote className="absolute top-4 left-4 w-12 h-12 text-blue-600/5" />

                                    <div className="flex items-center gap-4 mb-6 text-right">
                                        <div className="relative order-2">
                                            <img src={reviews[currentIndex].avatar} alt={reviews[currentIndex].name} className="w-16 h-16 rounded-none object-cover border border-gray-200" />
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gold rounded-none flex items-center justify-center">
                                                <Star size={10} className="text-white fill-white" />
                                            </div>
                                        </div>
                                        <div className="text-right flex-grow order-1">
                                            <h4 className="font-bold text-gray-900 text-lg">{reviews[currentIndex].name}</h4>
                                            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">{reviews[currentIndex].role}</p>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 leading-relaxed text-base italic mb-6 text-right">"{reviews[currentIndex].content}"</p>

                                    <div className="flex justify-end gap-1 text-gold pt-4 border-t border-gray-100">
                                        {[1, 2, 3, 4, 5].map(star => <Star key={star} size={14} fill="currentColor" />)}
                                    </div>
                                </div>

                                {/* Slider Controls with Dots */}
                                <div className="flex justify-center flex-row-reverse gap-4 mt-8">
                                    <button onClick={nextSlide} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors">
                                        <ChevronRight size={24} className="rotate-180" />
                                    </button>
                                    <div className="flex items-center gap-1.5">
                                        {reviews.map((_, i) => (
                                            <div key={i} className={`h-1.5 transition-all ${i === currentIndex ? 'w-6 bg-blue-600' : 'w-2 bg-gray-200'}`}></div>
                                        ))}
                                    </div>
                                    <button onClick={prevSlide} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors">
                                        <LucideChevronLeft size={24} className="rotate-180" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Grid View */}
                        <div className="hidden lg:grid lg:grid-cols-3 gap-8">
                            {reviews.map((review, index) => (
                                <div key={index} className="p-8 bg-gray-50 border border-gray-100 rounded-none relative group hover:bg-white hover:shadow-2xl transition-all duration-300 flex flex-col h-full text-right">
                                    <Quote className="absolute top-4 left-4 w-12 h-12 text-blue-600/5 group-hover:text-blue-600/10 transition-colors" />

                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="relative order-2">
                                            <img src={review.avatar} alt={review.name} className="w-16 h-16 rounded-none object-cover border border-gray-200" />
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gold rounded-none flex items-center justify-center">
                                                <Star size={10} className="text-white fill-white" />
                                            </div>
                                        </div>
                                        <div className="text-right flex-grow order-1">
                                            <h4 className="font-bold text-gray-900 text-lg">{review.name}</h4>
                                            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">{review.role}</p>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 leading-relaxed text-base italic mb-8 flex-grow">"{review.content}"</p>

                                    <div className="flex justify-end gap-1 text-gold pt-4 border-t border-gray-100">
                                        {[1, 2, 3, 4, 5].map(star => <Star key={star} size={14} fill="currentColor" />)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
};
