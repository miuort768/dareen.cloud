import { Link } from 'react-router-dom';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { Zap, Shield, BookOpen, Target, Compass, Sparkles, Lightbulb, Award, Users, Heart, ArrowLeft } from 'lucide-react';
import { SEO } from '../../components/SEO';

export const About = () => {
    return (
        <div className="min-h-full bg-white dark:bg-slate-950 font-sans text-gray-800 dark:text-slate-100 relative overflow-x-hidden">
            <SEO
                title="عن دارين السابعة | المنصة التعليمية الأفضل في السعودية والكويت وقطر والامارات وعمان"
                description="تعرف على دارين السابعة، المؤسسة الرائدة للتعليم عن بعد في دول الخليج (السعودية، الكويت، قطر، الامارات، عمان). نقدم أفضل المدرسين الخصوصيين ومراجعات المناهج الخليجية."
                keywords="دارين السابعة, اكاديمية دارين الخليج, دروس خصوصية اونلاين الكويت, معلمين قطر, مدرس قدرات السعودية, منصة الامارات, معهد تعليمي عمان"
                url="https://dareen-edu.com/about"
                breadcrumbs={[
                    { name: 'الرئيسية', item: '/' },
                    { name: 'من نحن', item: '/about' }
                ]}
            />
            <PublicNavbar />

            {/* Hero Section */}
            <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-white dark:bg-slate-950">
                {/* Creative Background Elements - Premium Royal Theme */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none hidden md:block"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none hidden md:block"></div>
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/simple-dashed.png')]"></div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-none shadow-sm mb-8 animate-fade-in group hover:border-indigo-500 transition-all duration-500">
                        <Sparkles size={16} className="text-indigo-600 group-hover:rotate-12 transition-transform" />
                        <span className="text-xs font-black tracking-[0.1em] uppercase text-gray-900 dark:text-white">دارين السابعة | ريادة تعليمية</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-gray-900 dark:text-white mb-6 font-heading tracking-tight leading-[1.6] md:leading-tight relative">
                        <span className="sr-only">عن دارين السابعة للتعليم والتدريب - أفضل منصة للتعليم عن بعد والدروس الخصوصية في الكويت والخليج</span>
                        <span aria-hidden="true">نحن لا نُدرّس فقط،<br /></span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-900 py-1 inline-block" aria-hidden="true">نحن نبني مستقبلاً</span>
                    </h1>

                    <p className="text-sm md:text-xl text-gray-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed md:leading-loose mb-12 px-4 font-medium">
                        في دارين السابعة، نؤمن بأن كل طالب هو مشروع نجاح بحد ذاته. نجمع بين أصالة القيم العربية وأحدث تقنيات التعليم الرقمي لنخلق بيئة تعليمية لا تعرف الحدود.
                    </p>

                    <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                        <div className="flex flex-col items-center">
                            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-none flex items-center justify-center text-indigo-600 mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                <Award size={28} />
                            </div>
                            <span className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white">10+</span>
                            <span className="text-[10px] text-gray-400 dark:text-slate-500 font-black uppercase tracking-widest mt-1">سنوات تميز</span>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-none flex items-center justify-center text-indigo-600 mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                <Users size={28} />
                            </div>
                            <span className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white">5k+</span>
                            <span className="text-[10px] text-gray-400 dark:text-slate-500 font-black uppercase tracking-widest mt-1">طالب فخور</span>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 rounded-none flex items-center justify-center text-amber-600 mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                <Heart size={28} />
                            </div>
                            <span className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white">100%</span>
                            <span className="text-[10px] text-gray-400 dark:text-slate-500 font-black uppercase tracking-widest mt-1">ثقة وتفاني</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Story & Impact */}
            <section className="py-6 md:py-8 relative overflow-hidden bg-white dark:bg-slate-950">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 max-w-6xl mx-auto">

                        {/* Interactive Visual Side */}
                        <div className="w-full lg:w-1/2 order-2 lg:order-1">
                            <div className="relative">
                                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-600/10 to-amber-500/10 rounded-[3rem] -rotate-3 scale-105 blur-xl"></div>
                                <div className="relative grid grid-cols-2 gap-4">
                                    <div className="pt-8 space-y-4">
                                        <div className="h-64 rounded-[2rem] overflow-hidden shadow-2xl">
                                            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="Collaborative learning" loading="lazy" decoding="async" />
                                        </div>
                                        <div className="h-48 bg-amber-500 rounded-[2rem] p-6 flex flex-col justify-end text-white shadow-xl">
                                            <Sparkles size={24} className="mb-4" />
                                            <h4 className="font-black text-lg">إبداع مستمر</h4>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="h-48 bg-indigo-700 rounded-[2rem] p-6 flex flex-col justify-end text-white shadow-xl">
                                            <Target size={24} className="mb-4" />
                                            <h4 className="font-black text-lg">أهداف محققة</h4>
                                        </div>
                                        <div className="h-64 rounded-[2rem] overflow-hidden shadow-2xl">
                                            <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="Effective teaching" loading="lazy" decoding="async" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="w-full lg:w-1/2 order-1 lg:order-2 text-right">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-none mb-6">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">تعرف عليـــنا</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-8 font-heading leading-[1.6] md:leading-[1.6]">
                                ريادة في التعليم،<br />
                                <span className="text-indigo-600">نهضة في الفكر</span>
                            </h2>
                            <p className="text-gray-600 dark:text-slate-400 text-base md:text-lg leading-relaxed font-medium mb-10 max-w-xl">
                                بدأ دارين السابعة كحلم صغير لتقديم تعليم يختلف عن المألوف، واليوم أصبحنا منارة تعليمية يثق بها الآلاف. نعتمد على استراتيجيات التعلم النشط ونركز على تمكين الطالب من أدوات البحث والابتكار، ليواجه تحديات المستقبل بذكاء وثقة.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-slate-900/50 rounded-none hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors border border-gray-100 dark:border-slate-800">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-none shadow-sm flex items-center justify-center text-indigo-600 shrink-0">
                                        <Zap size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-gray-900 dark:text-white mb-1">رؤية الابتكار</h4>
                                        <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">أن نكون الخيار الأول للتعليم النوعي المبتكر في المنطقة العربية.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-slate-900/50 rounded-none hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors border border-gray-100 dark:border-slate-800">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-none shadow-sm flex items-center justify-center text-amber-600 shrink-0">
                                        <BookOpen size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-gray-900 dark:text-white mb-1">رسالة التمكين</h4>
                                        <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">تقديم تجربة تعليمية قيميّة وملهمة تُطلق العنان لإبداع الطالب وتضمن تفوقه.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values Section - Enhanced */}
            <section className="py-16 bg-[#fafafa] dark:bg-slate-900/50 relative overflow-hidden">
                {/* Visual Separator */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600/5 border border-indigo-600/10 mb-6">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">دستورنا التعليمي</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 font-heading">
                            القيم التي <span className="text-indigo-600">تُحدد هويتنا</span>
                        </h2>
                        <div className="h-1 w-20 bg-amber-500 mx-auto mb-8"></div>
                        <p className="text-gray-500 dark:text-slate-400 max-w-none mx-auto text-sm md:text-base leading-relaxed font-medium">
                            الالتزام الراسخ بهذه القيم هو ما يصنع الفرق الحقيقي في رحلة نجاح طلابنا.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {/* Value 1 - Honesty */}
                        <div className="group bg-white dark:bg-slate-900/40 dark:backdrop-blur-md p-8 border border-gray-100 dark:border-slate-800 hover:border-indigo-600/30 transition-all duration-500 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-0 bg-indigo-600 group-hover:h-full transition-all duration-500"></div>
                            <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 text-indigo-600 flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
                                <Shield className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 font-heading">الأمانة</h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed font-medium">
                                نلتزم بأعلى معايير النزاهة والصدق في كل تفاعل تعليمي، لنكون الشريك الموثوق لمستقبل أبنائكم.
                            </p>
                        </div>

                        {/* Value 2 - Innovation */}
                        <div className="group bg-white dark:bg-slate-900/40 dark:backdrop-blur-md p-8 border border-gray-100 dark:border-slate-800 hover:border-indigo-600/30 transition-all duration-500 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-0 bg-indigo-600 group-hover:h-full transition-all duration-500"></div>
                            <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 text-indigo-600 flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
                                <Lightbulb className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 font-heading">الابتكار</h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed font-medium">
                                نطور أدواتنا باستمرار لنجعل من رحلة العلم تجربة استثنائية مشوقة تفتح آفاق العقل.
                            </p>
                        </div>

                        {/* Value 3 - Excellence */}
                        <div className="group bg-white dark:bg-slate-900/40 dark:backdrop-blur-md p-8 border border-gray-100 dark:border-slate-800 hover:border-indigo-600/30 transition-all duration-500 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-0 bg-indigo-600 group-hover:h-full transition-all duration-500"></div>
                            <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 text-indigo-600 flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
                                <Award className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 font-heading">التميز</h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed font-medium">
                                لا نرضى بأقل من الجودة الفائقة في كل برنامج نقدمه، لضمان مخرجات تعليمية تليق بطلابنا.
                            </p>
                        </div>

                        {/* Value 4 - Building Generations */}
                        <div className="group bg-white dark:bg-slate-900/40 dark:backdrop-blur-md p-8 border border-gray-100 dark:border-slate-800 hover:border-indigo-600/30 transition-all duration-500 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-0 bg-indigo-600 group-hover:h-full transition-all duration-500"></div>
                            <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 text-indigo-600 flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
                                <Compass className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 font-heading">بناء الجيل</h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed font-medium">
                                نركز على صقل شخصية الطالب ومهاراته القيادية ليكون منارة للتغيير الإيجابي في المجتمع.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final Call to Action - Redesigned with Creative Touches */}
            <section className="py-20 bg-white dark:bg-slate-950 relative overflow-hidden">
                {/* Dramatic Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-indigo-600/[0.03] rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2"></div>
                    <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-purple-600/[0.03] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        {/* The Professional Container */}
                        <div className="relative group overflow-hidden">
                            {/* Animated Border/Glow effect */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-amber-500 to-indigo-600 opacity-20 group-hover:opacity-40 transition-opacity duration-700 blur-sm"></div>
                            
                            <div className="relative bg-[#0a0a0a] p-10 md:p-20 shadow-[0_40px_100px_-15px_rgba(0,0,0,0.6)] border border-white/5">
                                {/* Intricate Background Patterns */}
                                <div className="absolute inset-0 opacity-10 pointer-events-none">
                                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(79,70,229,0.15),transparent_50%)]"></div>
                                    <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,rgba(139,92,246,0.1),transparent_50%)]"></div>
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                                </div>

                                <div className="relative z-20 flex flex-col lg:flex-row items-center gap-16">
                                    {/* Content Side */}
                                    <div className="w-full lg:w-[60%] text-center lg:text-right">
                                        <div className="inline-flex items-center gap-3 px-6 py-2 bg-indigo-600/10 border border-indigo-500/20 mb-10 backdrop-blur-xl">
                                            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                                            <span className="text-xs font-black uppercase tracking-[0.4em] text-indigo-50">انضم إلى عائلتنا</span>
                                        </div>

                                        <h2 className="text-xl md:text-3xl lg:text-4xl font-black mb-6 font-heading text-white leading-[1.3] md:leading-[1.3]">
                                            هل أنت مستعد لتكون <br />
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-amber-200">جزءاً من حكايتنا؟</span>
                                        </h2>

                                        <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto lg:mx-0 mb-10 font-medium leading-relaxed opacity-80">
                                            انضم إلى آلاف الطلاب الذين بدؤوا رحلتهم نحو التميز الحقيقي مع دارين السابعة. مستقبلك المشرق يبدأ بقرار واحد تتخذه الآن.
                                        </p>

                                        <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                                            <Link
                                                to="/courses"
                                                onClick={() => window.scrollTo(0, 0)}
                                                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-[0_20px_40px_rgba(79,70,229,0.3)] transition-all duration-500 hover:-translate-y-1 flex items-center justify-center gap-4 group"
                                            >
                                                <span>ابدأ رحلتك الآن</span>
                                                <ArrowLeft size={20} className="group-hover:-translate-x-2 transition-transform" />
                                            </Link>

                                            <Link
                                                to="/login"
                                                onClick={() => window.scrollTo(0, 0)}
                                                className="px-10 py-4 bg-white/5 hover:bg-white/10 text-white font-black text-lg border border-white/10 hover:border-white/30 transition-all duration-500 flex items-center justify-center group"
                                            >
                                                <span>تسجيل الدخول</span>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Stats/Graphic Side */}
                                    <div className="w-full lg:w-[40%] relative">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="relative p-10 bg-white/[0.03] border border-white/10 backdrop-blur-2xl flex flex-col items-center justify-center text-center transform hover:-translate-y-3 hover:rotate-2 transition-all duration-700 group/card overflow-hidden">
                                                {/* Creative Corner Decor */}
                                                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-indigo-600 transition-all duration-500 group-hover/card:w-full group-hover/card:h-full group-hover/card:opacity-20"></div>
                                                
                                                <div className="relative z-10">
                                                    <div className="w-14 h-14 bg-indigo-600/20 text-indigo-500 mb-6 flex items-center justify-center group-hover/card:scale-110 group-hover/card:rotate-12 transition-transform duration-500">
                                                        <Users size={28} />
                                                    </div>
                                                    <span className="text-4xl font-black text-white mb-2 block tracking-tight">5k+</span>
                                                    <span className="text-[11px] text-indigo-500/80 font-black uppercase tracking-[0.2em]">طالب فعال</span>
                                                </div>
                                                
                                                {/* Artistic Glow */}
                                                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-indigo-600/10 rounded-full blur-2xl group-hover/card:bg-indigo-600/20 transition-all"></div>
                                            </div>

                                            <div className="relative p-10 bg-white/[0.03] border border-white/10 backdrop-blur-2xl flex flex-col items-center justify-center text-center translate-y-12 transform hover:translate-y-8 hover:-rotate-2 transition-all duration-700 group/card overflow-hidden">
                                                {/* Creative Corner Decor */}
                                                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-500 transition-all duration-500 group-hover/card:w-full group-hover/card:h-full group-hover/card:opacity-20"></div>
                                                
                                                <div className="relative z-10">
                                                    <div className="w-14 h-14 bg-amber-600/20 text-amber-500 mb-6 flex items-center justify-center group-hover/card:scale-110 group-hover/card:-rotate-12 transition-transform duration-500">
                                                        <Target size={28} />
                                                    </div>
                                                    <span className="text-4xl font-black text-white mb-2 block tracking-tight">100%</span>
                                                    <span className="text-[11px] text-amber-500/80 font-black uppercase tracking-[0.2em]">نسبة نجاح</span>
                                                </div>

                                                {/* Artistic Glow */}
                                                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-amber-600/10 rounded-full blur-2xl group-hover/card:bg-amber-600/20 transition-all"></div>
                                            </div>
                                        </div>
                                        {/* Background Glow for Stats */}
                                        <div className="absolute inset-0 bg-indigo-600/10 blur-[80px] -z-10"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
};
                                                <div className="w-14 h-14 bg-green-600/20 text-green-500 mb-6 flex items-center justify-center group-hover/card:scale-110 group-hover/card:-rotate-12 transition-transform duration-500">
                                                        <Target size={28} />
                                                    </div>
                                                    <span className="text-4xl font-black text-white mb-2 block tracking-tight">100%</span>
                                                    <span className="text-[11px] text-green-500/80 font-black uppercase tracking-[0.2em]">نسبة نجاح</span>
                                                </div>

                                                {/* Artistic Glow */}
                                                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-green-600/10 rounded-full blur-2xl group-hover/card:bg-green-600/20 transition-all"></div>
                                            </div>
                                        </div>
                                        {/* Background Glow for Stats */}
                                        <div className="absolute inset-0 bg-red-600/10 blur-[80px] -z-10"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
};
