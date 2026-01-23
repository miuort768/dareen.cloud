import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { Zap, Shield, BookOpen, Target, Compass, Sparkles, Lightbulb, Award, Users, Heart } from 'lucide-react';
import { SEO } from '../../components/SEO';

export const About = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-800 relative overflow-x-hidden">
            <SEO
                title="عن المعهد"
                description="تعرف على معهد دارين وتاريخنا في التميز التعليمي. نهدف لبناء القدرات وتنمية المهارات عبر برامج تعليمية مبتكرة تجمع بين الأصالة والمعاصرة."
            />
            <PublicNavbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-[#FDFCF8]">
                {/* Creative Background Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none hidden md:block"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none hidden md:block"></div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-full shadow-sm mb-8 animate-fade-in group hover:border-gold transition-all duration-500">
                        <Sparkles size={16} className="text-gold group-hover:rotate-12 transition-transform" />
                        <span className="text-xs font-black tracking-[0.1em] uppercase text-gray-900">معهد دارين | ريادة تعليمية</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-gray-900 mb-6 font-heading tracking-tight">
                        نحن لا نُدرّس فقط،<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-900">نحن نبني مستقبلاً</span>
                    </h1>

                    <p className="text-sm md:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed md:leading-loose mb-12 px-4 font-medium">
                        في معهد دارين، نؤمن بأن كل طالب هو مشروع نجاح بحد ذاته. نجمع بين أصالة القيم العربية وأحدث تقنيات التعليم الرقمي لنخلق بيئة تعليمية لا تعرف الحدود.
                    </p>

                    <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                        <div className="flex flex-col items-center">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                <Award size={28} />
                            </div>
                            <span className="text-2xl md:text-4xl font-black text-gray-900">10+</span>
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">سنوات تميز</span>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center text-gold mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                <Users size={28} />
                            </div>
                            <span className="text-2xl md:text-4xl font-black text-gray-900">5k+</span>
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">طالب فخور</span>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                <Heart size={28} />
                            </div>
                            <span className="text-2xl md:text-4xl font-black text-gray-900">100%</span>
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">ثقة وتفاني</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Story & Impact */}
            <section className="py-6 md:py-8 relative overflow-hidden bg-white">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 max-w-6xl mx-auto">

                        {/* Interactive Visual Side */}
                        <div className="w-full lg:w-1/2 order-2 lg:order-1">
                            <div className="relative">
                                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-600/10 to-gold/10 rounded-[3rem] -rotate-3 scale-105 blur-xl"></div>
                                <div className="relative grid grid-cols-2 gap-4">
                                    <div className="pt-8 space-y-4">
                                        <div className="h-64 rounded-[2rem] overflow-hidden shadow-2xl">
                                            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="Collaborative learning" />
                                        </div>
                                        <div className="h-48 bg-gold rounded-[2rem] p-6 flex flex-col justify-end text-white shadow-xl">
                                            <Sparkles size={24} className="mb-4" />
                                            <h4 className="font-black text-lg">إبداع مستمر</h4>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="h-48 bg-blue-700 rounded-[2rem] p-6 flex flex-col justify-end text-white shadow-xl">
                                            <Target size={24} className="mb-4" />
                                            <h4 className="font-black text-lg">أهداف محققة</h4>
                                        </div>
                                        <div className="h-64 rounded-[2rem] overflow-hidden shadow-2xl">
                                            <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="Effective teaching" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="w-full lg:w-1/2 order-1 lg:order-2 text-right">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-900 text-white rounded-md mb-6">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">تعرف عليـــنا</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-8 font-heading leading-tight">
                                ريادة في التعليم،<br />
                                <span className="text-gold">نهضة في الفكر</span>
                            </h2>
                            <p className="text-gray-600 text-base md:text-lg leading-relaxed font-medium mb-10 max-w-xl">
                                بدأ معهد دارين كحلم صغير لتقديم تعليم يختلف عن المألوف، واليوم أصبحنا منارة تعليمية يثق بها الآلاف. نعتمد على استراتيجيات التعلم النشط ونركز على تمكين الطالب من أدوات البحث والابتكار، ليواجه تحديات المستقبل بذكاء وثقة.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-100">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 shrink-0">
                                        <Zap size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-gray-900 mb-1">رؤية الابتكار</h4>
                                        <p className="text-sm text-gray-500 font-medium">أن نكون الخيار الأول للتعليم النوعي المبتكر في المنطقة العربية.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-100">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-gold shrink-0">
                                        <BookOpen size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-gray-900 mb-1">رسالة التمكين</h4>
                                        <p className="text-sm text-gray-500 font-medium">تقديم تجربة تعليمية قيميّة وملهمة تُطلق العنان لإبداع الطالب وتضمن تفوقه.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values Section - Enhanced */}
            <section className="py-6 md:py-8 bg-[#F8F9FC] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-16 md:mb-24">
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 font-heading">
                            القيم التي <span className="text-blue-600">تُحدد هويتنا</span>
                        </h2>
                        <div className="h-1.5 w-24 bg-gold mx-auto rounded-full mb-8"></div>
                        <p className="text-gray-500 max-w-2xl mx-auto text-base md:text-lg leading-relaxed font-medium">
                            نحن لا نؤمن بالصدفة في النجاح، بل نؤمن بأن الالتزام بهذه القيم هو ما يصنع الفرق الحقيقي في حياة طلابنا.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 max-w-7xl mx-auto">
                        {/* Value 1 */}
                        <div className="group bg-white p-5 md:p-10 rounded-2xl md:rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-50 flex flex-col items-center text-center">
                            <div className="w-12 h-12 md:w-20 md:h-20 bg-blue-50 text-blue-600 rounded-xl md:rounded-3xl flex items-center justify-center mb-4 md:mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all duration-700 shadow-sm relative">
                                <Shield className="w-6 h-6 md:w-9 md:h-9" />
                                <div className="absolute -inset-2 bg-blue-600/10 rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <h3 className="text-base md:text-2xl font-black text-gray-900 mb-2 md:mb-4 font-heading">الأمانة</h3>
                            <p className="text-[10px] md:text-sm text-gray-500 leading-relaxed font-medium line-clamp-3 md:line-clamp-none">
                                نلتزم بأعلى معايير النزاهة في التعامل والتعليم كشريك موثوق لمستقبل أبنائكم.
                            </p>
                        </div>

                        {/* Value 2 */}
                        <div className="group bg-white p-5 md:p-10 rounded-2xl md:rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-50 flex flex-col items-center text-center">
                            <div className="w-12 h-12 md:w-20 md:h-20 bg-amber-50 text-gold rounded-xl md:rounded-3xl flex items-center justify-center mb-4 md:mb-8 group-hover:bg-gold group-hover:text-white transition-all duration-700 shadow-sm relative">
                                <Lightbulb className="w-6 h-6 md:w-9 md:h-9" />
                                <div className="absolute -inset-2 bg-gold/10 rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <h3 className="text-base md:text-2xl font-black text-gray-900 mb-2 md:mb-4 font-heading">الابتكار</h3>
                            <p className="text-[10px] md:text-sm text-gray-500 leading-relaxed font-medium line-clamp-3 md:line-clamp-none">
                                نبتكر دائماً في طرق التدريس لنجعل العلم تجربة مشوقة ومحفزة للذهن.
                            </p>
                        </div>

                        {/* Value 3 */}
                        <div className="group bg-white p-5 md:p-10 rounded-2xl md:rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-50 flex flex-col items-center text-center">
                            <div className="w-12 h-12 md:w-20 md:h-20 bg-emerald-50 text-emerald-600 rounded-xl md:rounded-3xl flex items-center justify-center mb-4 md:mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-700 shadow-sm relative">
                                <Award className="w-6 h-6 md:w-9 md:h-9" />
                                <div className="absolute -inset-2 bg-emerald-600/10 rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <h3 className="text-base md:text-2xl font-black text-gray-900 mb-2 md:mb-4 font-heading">التميز</h3>
                            <p className="text-[10px] md:text-sm text-gray-500 leading-relaxed font-medium line-clamp-3 md:line-clamp-none">
                                نضع الجودة نصب أعيننا في كل تفاصيل البرامج التعليمية التي نقدمها.
                            </p>
                        </div>

                        {/* Value 4 */}
                        <div className="group bg-white p-5 md:p-10 rounded-2xl md:rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-50 flex flex-col items-center text-center">
                            <div className="w-12 h-12 md:w-20 md:h-20 bg-indigo-50 text-indigo-700 rounded-xl md:rounded-3xl flex items-center justify-center mb-4 md:mb-8 group-hover:bg-indigo-700 group-hover:text-white transition-all duration-700 shadow-sm relative">
                                <Compass className="w-6 h-6 md:w-9 md:h-9" />
                                <div className="absolute -inset-2 bg-indigo-700/10 rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <h3 className="text-base md:text-2xl font-black text-gray-900 mb-2 md:mb-4 font-heading">بناء الجيل</h3>
                            <p className="text-[10px] md:text-sm text-gray-500 leading-relaxed font-medium line-clamp-3 md:line-clamp-none">
                                هدفنا الأسمى هو تكوين شخصية الطالب ليكون عضواً فعالاً في مجتمعه.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final Call to Action */}
            <section className="py-5 md:py-8 bg-white relative">
                <div className="container mx-auto px-4">
                    <div className="bg-gradient-to-r from-blue-900 to-indigo-800 rounded-none p-10 md:p-20 text-center text-white relative overflow-hidden shadow-2xl group">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl font-black mb-8 font-heading">هل أنت مستعد لتكون جزءاً من حكايتنا؟</h2>
                            <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium">
                                انضم إلى آلاف الطلاب الذين بدؤوا رحلتهم نحو التميز مع معهد دارين. مستقبلك المشرق يبدأ من هنا.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a href="/courses" className="px-10 py-5 bg-gold hover:bg-gold-hover text-white font-black rounded-2xl shadow-lg transition-all transform hover:-translate-y-1">تصفح الدورات</a>
                                <a href="/login" className="px-10 py-5 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl backdrop-blur-md transition-all">سجل دخولك الآن</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
};
