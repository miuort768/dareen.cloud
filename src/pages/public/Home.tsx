import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { Play, ArrowLeft, Star, Heart, CheckCircle, Lightbulb, Users, Award, Zap, Clock, Mic, ClipboardCheck, ChevronRight, ChevronLeft as LucideChevronLeft, Quote } from 'lucide-react';
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
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 relative overflow-x-hidden">
            <SEO
                title="الرئيسية"
                description="معهد دارين وأكاديمية دارين للتعليم والتدريب - الخيار الأول للتعليم عن بعد في الكويت والخليج. دروس خصوصية لجميع المراحل، تحفيظ قرآن، ولغات."
            />
            <PublicNavbar />

            {/* Blob Backgrounds */}
            <div className="hero-blob bg-blue-600/10 w-96 h-96 rounded-full top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none hidden md:block"></div>
            <div className="hero-blob bg-gold/10 w-[30rem] h-[30rem] rounded-full bottom-0 right-0 translate-x-1/2 translate-y-1/2 pointer-events-none hidden md:block"></div>

            {/* Hero Section */}
            <section className="relative pt-24 pb-6 md:pt-28 md:pb-2 overflow-hidden bg-[#FDFCF8]">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12">

                        {/* Text Content */}
                        <div className="lg:w-[60%] text-center z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-100 rounded-full mb-1 mx-auto">
                                <span className="w-2 h-2 rounded-full bg-gold animate-pulse"></span>
                                <span className="text-yellow-800 font-bold text-[10px] sm:text-xs tracking-wide">منصة تعليمية بتصميم عصري</span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-heading font-black text-gray-900 leading-[1.2] mb-1">
                                <span className="block mb-0">معهد دارين</span>
                                <span className="text-xl sm:text-2xl lg:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-gold py-1 inline-block">
                                    للتعليم والتدريب عن بعد
                                </span>
                            </h1>

                            <p className="text-[11px] sm:text-xs md:text-xs lg:text-sm text-gray-600 leading-normal mb-5 max-w-[320px] sm:max-w-full mx-auto px-0 tracking-tighter font-medium">
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
                                    href={`https://wa.me/2${adminPhone}`}
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
                            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-center gap-6">
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
                        <div className="hidden lg:flex lg:w-[40%] justify-center z-10 relative">
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
            <section className="py-6 bg-white relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-6 max-w-5xl mx-auto">
                        <h2 className="text-2xl lg:text-5xl font-heading font-black text-gray-900 mb-2 uppercase leading-[1.4] py-2">
                            لماذا <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-gold py-1 inline-block">تختارنا؟</span>
                        </h2>
                        <div className="h-1.5 w-24 bg-gradient-to-r from-blue-600 to-transparent mx-auto rounded-full mb-4"></div>
                        <p className="text-gray-500 text-xs sm:text-sm md:text-base leading-relaxed font-medium">
                            نقدم تجربة تعليمية متكاملة تجمع بين أحدث التقنيات وأفضل الكوادر التعليمية لضمان مستقبل مشرق لأبنائكم.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto">
                        {/* Feature 1 */}
                        <div className="md:col-span-2 relative p-6 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-none shadow-2xl overflow-hidden group flex items-center gap-4">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                            <div className="relative z-10 w-12 h-12 bg-white/20 backdrop-blur-md rounded-none flex items-center justify-center shrink-0 border border-white/30 group-hover:scale-110 transition-transform">
                                <Lightbulb className="w-6 h-6 text-white" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-base font-bold text-white mb-1">طرق تعليم مبتكرة</h3>
                                <p className="text-xs text-blue-50 leading-relaxed">
                                    طرق تعليم تفاعلية حديثة تنمي مهارات الفهم والتفكير الإبداعي لدى طفلك.
                                </p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-6 bg-gradient-to-br from-gold to-gold-hover rounded-none shadow-xl text-white group flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-none flex items-center justify-center shrink-0 border border-white/30 group-hover:rotate-12 transition-transform">
                                <Heart className="w-6 h-6 text-white fill-white" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold mb-1">بيئة آمنة ومحفزة</h3>
                                <p className="text-xs text-white/90 leading-relaxed">
                                    بيئة تعليمية افتراضية آمنة تشجع الطالب على التفاعل والمشاركة بحرية.
                                </p>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-6 bg-white border border-gray-100 rounded-none shadow-sm hover:shadow-xl transition-all group flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-none flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div className="text-right">
                                <h3 className="text-base font-bold text-gray-900 mb-1">نتائج مضمونة</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    متابعة دقيقة وتقارير دورية لضمان تحقيق أفضل النتائج التعليمية.
                                </p>
                            </div>
                        </div>

                        {/* Feature 4 */}
                        <div className="md:col-span-2 p-6 md:p-8 bg-gray-900 rounded-none shadow-2xl text-white relative overflow-hidden group">
                            {/* Decorative Glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6">
                                <div className="flex-1 text-center lg:text-right">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full mb-2 border border-white/10 mx-auto lg:mx-0">
                                        <Award size={16} className="text-gold" />
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-300">التميز التعليمي</span>
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-black mb-2 font-heading text-white">بيئة تعليمية متطورة</h3>
                                    <p className="text-white/80 text-xs md:text-sm leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                                        نخبة من المعلمين المبدعين لضمان تفوق طفلك أكاديمياً وتربوياً بأحدث الوسائل التعليمية.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full lg:w-auto shrink-0">
                                    <div className="p-6 bg-white/5 border border-white/10 rounded-none text-center group-hover:bg-white/10 transition-all duration-300 hover:border-blue-500/30">
                                        <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                                        <div className="text-3xl font-black text-white">+70</div>
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
            <section className="pt-6 pb-6 relative overflow-hidden bg-[#FDFCF8]">
                {/* Subtle Islamic Pattern Background */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'radial-gradient(#10B981 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 justify-center max-w-6xl mx-auto">

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

                            <p className="text-gray-600 text-[10px] sm:text-xs lg:text-lg leading-relaxed mb-8 max-w-xl mx-auto font-medium">
                                منهجية فريدة تجمع بين أصالة التلقي وتقنيات التعليم الحديثة. نقدم <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">حلقات فردية</span> ومجموعات صغيرة مع نخبة من المقرئين المجازين.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                                <a
                                    href={`https://wa.me/2${adminPhone}?text=${encodeURIComponent('السلام عليكم، أرغب في البدء بحفظ القرآن الكريم في معهد دارين')}`}
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

                        {/* Visual Side (Modern Grid System) */}
                        <div className="w-full lg:w-1/2 flex justify-center py-6 lg:py-0">
                            <div className="grid grid-cols-2 gap-4 w-full max-w-[400px]">
                                {/* Feature 1: Flexible Times */}
                                <div className="p-4 bg-white rounded-2xl shadow-sm border border-blue-50 hover:shadow-md hover:border-blue-100 transition-all flex flex-col items-center text-center group">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-xs mb-1">أوقات مرنة</h3>
                                    <p className="text-[10px] text-gray-500 leading-tight">اختر مواعيدك المفضلة</p>
                                </div>

                                {/* Feature 2: Accurate Follow-up */}
                                <div className="p-4 bg-white rounded-2xl shadow-sm border border-amber-50 hover:shadow-md hover:border-amber-100 transition-all flex flex-col items-center text-center group">
                                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                        <ClipboardCheck className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-xs mb-1">متابعة دقيقة</h3>
                                    <p className="text-[10px] text-gray-500 leading-tight">تقارير إنجاز أسبوعية</p>
                                </div>

                                {/* Feature 3: Certified Teachers */}
                                <div className="p-4 bg-white rounded-2xl shadow-sm border border-emerald-50 hover:shadow-md hover:border-emerald-100 transition-all flex flex-col items-center text-center group">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                        <Mic className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-xs mb-1">معلمون مجازون</h3>
                                    <p className="text-[10px] text-gray-500 leading-tight">نخبة الحفاظ المبدعون</p>
                                </div>

                                {/* Feature 4: Try Free */}
                                <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg shadow-blue-200 text-white flex flex-col items-center text-center group hover:scale-[1.02] transition-transform cursor-pointer">
                                    <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center mb-3 backdrop-blur-sm">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-white text-xs mb-1">جرب مجاناً</h3>
                                    <p className="text-white/80 text-[10px] leading-tight">حصة تجريبية للمشتركين</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Testimonials Section - Refined Light Theme */}
            <section className="py-6 md:py-8 bg-white relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-6 md:mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full mb-3 mx-auto">
                            <Quote size={12} className="text-blue-600" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-700">ثقة متبادلة</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 font-heading leading-tight">
                            ماذا يقول <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500">أولياء الأمور؟</span>
                        </h2>
                        <div className="h-1 w-16 bg-gold mx-auto rounded-full"></div>
                    </div>

                    <div className="max-w-7xl mx-auto">
                        {/* Mobile Slider View (One card at a time) */}
                        <div className="lg:hidden">
                            <div className="relative group">
                                <div className="p-5 bg-gray-50 border border-gray-100 rounded-none shadow-sm relative overflow-hidden flex flex-col min-h-[250px]">
                                    <Quote size={30} className="text-blue-600/5 absolute top-4 left-4" />

                                    <div className="relative z-10 flex flex-col h-full flex-grow">
                                        <div className="flex gap-1 mb-4 text-gold">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill="currentColor" />)}
                                        </div>

                                        <div className="flex-grow overflow-y-auto pr-1 mb-4">
                                            <p className="text-gray-600 text-sm leading-relaxed font-medium italic">
                                                "{reviews[currentIndex].content}"
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-auto">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-gray-200">
                                                    <img src={reviews[currentIndex].avatar} alt={reviews[currentIndex].name} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-gray-900 text-base">{reviews[currentIndex].name}</h4>
                                                    <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{reviews[currentIndex].role}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={prevSlide} className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all active:scale-90 border border-gray-100">
                                                    <ChevronRight className="rotate-180" size={18} />
                                                </button>
                                                <button onClick={nextSlide} className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all active:scale-90 border border-gray-100">
                                                    <LucideChevronLeft className="rotate-180" size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Wall of Trust (Masonry Grid) */}
                        <div className="hidden lg:grid lg:grid-cols-3 gap-3">
                            {reviews.map((review, index) => (
                                <div key={index} className="group relative bg-gray-50 p-4 rounded-none border border-gray-100 shadow-sm hover:shadow-md transition-all duration-500 hover:-translate-y-1">
                                    <Quote size={40} className="absolute -top-2 -left-2 text-blue-600/5 group-hover:text-blue-600/10 transition-colors" />

                                    {/* Stars */}
                                    <div className="flex gap-1 mb-3 text-gold">
                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill="currentColor" />)}
                                    </div>

                                    {/* Content */}
                                    <div className="mb-4">
                                        <p className="text-gray-600 text-xs leading-relaxed font-medium italic">
                                            "{review.content}"
                                        </p>
                                    </div>

                                    {/* User Info */}
                                    <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                                        <div className="w-8 h-8 rounded-none overflow-hidden shadow-sm border border-white shrink-0 transform group-hover:scale-110 transition-transform">
                                            <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 text-xs">{review.name}</h4>
                                            <p className="text-[9px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">{review.role}</p>
                                        </div>
                                    </div>

                                    {/* Small Tail Accent */}
                                    <div className="absolute -bottom-1 right-8 w-3 h-3 bg-gray-50 rotate-45 border-r border-b border-gray-100"></div>
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
