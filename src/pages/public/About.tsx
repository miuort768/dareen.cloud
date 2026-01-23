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

            {/* Magical Hero Section */}
            <section className="relative pt-32 pb-16 md:pt-40 md:pb-32 overflow-hidden bg-[#FDFCF8]">
                {/* Magical Background Elements */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none animate-pulse"></div>
                <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-gold rounded-full animate-ping opacity-20"></div>
                <div className="absolute top-2/3 right-1/4 w-3 h-3 bg-blue-500 rounded-full animate-ping opacity-20" style={{ animationDelay: '1s' }}></div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-white border border-gray-100 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-10 animate-fade-in group hover:border-gold transition-all duration-500 cursor-default">
                        <Sparkles size={18} className="text-gold group-hover:rotate-12 transition-transform" />
                        <span className="text-xs font-black tracking-[0.2em] uppercase text-gray-900">معهد دارين | سحر التعليم الرقمي</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-gray-900 mb-8 font-heading tracking-tight leading-[1.1]">
                        نحن لا نُدرّس فقط،<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-900">نحن نبتكر مستقبلاً</span>
                    </h1>

                    <p className="text-base md:text-2xl text-gray-500 max-w-3xl mx-auto leading-relaxed md:leading-relaxed mb-16 px-4 font-medium opacity-90">
                        حيث تجتمع الأصالة بالإبداع الرقمي الخالص لنصنع تجربة تعليمية لا تُنسى.
                    </p>

                    <div className="flex flex-wrap justify-center gap-10 md:gap-20">
                        <div className="flex flex-col items-center group">
                            <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center text-blue-600 mb-4 shadow-xl shadow-blue-500/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-blue-50">
                                <Award size={32} />
                            </div>
                            <span className="text-3xl md:text-5xl font-black text-gray-900">10+</span>
                            <span className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em] mt-2">عقد من العطاء</span>
                        </div>

                        <div className="flex flex-col items-center group">
                            <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center text-gold mb-4 shadow-xl shadow-gold/10 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 border border-gold/5">
                                <Users size={32} />
                            </div>
                            <span className="text-3xl md:text-5xl font-black text-gray-900">5k+</span>
                            <span className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em] mt-2">قصة نجاح</span>
                        </div>

                        <div className="flex flex-col items-center group">
                            <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center text-emerald-600 mb-4 shadow-xl shadow-emerald-500/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-emerald-50">
                                <Heart size={32} />
                            </div>
                            <span className="text-3xl md:text-5xl font-black text-gray-900">100%</span>
                            <span className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em] mt-2">شغف حقيقي</span>
                        </div>
                    </div>
                </div>

                {/* Magical Floating Objects Separator */}
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent"></div>
            </section>

            {/* Our Story & Impact with Floating Magic */}
            <section className="py-20 md:py-32 relative overflow-hidden bg-white">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24 max-w-7xl mx-auto">

                        {/* Interactive Visual Side - Floating Magic */}
                        <div className="w-full lg:w-1/2 order-2 lg:order-1">
                            <div className="relative p-4">
                                <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-gold/10 rounded-full blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>

                                <div className="relative grid grid-cols-2 gap-6">
                                    <div className="pt-12 space-y-6 animate-float">
                                        <div className="h-72 rounded-[3.5rem] overflow-hidden shadow-2xl border-4 border-white">
                                            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700" alt="Collaborative learning" />
                                        </div>
                                        <div className="h-44 bg-gradient-to-br from-gold to-amber-500 rounded-[2.5rem] p-8 flex flex-col justify-end text-white shadow-xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                                            <Sparkles size={28} className="mb-4 relative z-10" />
                                            <h4 className="font-black text-xl relative z-10">إبداع بلا حدود</h4>
                                        </div>
                                    </div>
                                    <div className="space-y-6 animate-float" style={{ animationDelay: '2s' }}>
                                        <div className="h-44 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[2.5rem] p-8 flex flex-col justify-end text-white shadow-xl relative overflow-hidden group">
                                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                                            <Target size={28} className="mb-4 relative z-10" />
                                            <h4 className="font-black text-xl relative z-10">رؤية ثاقبة</h4>
                                        </div>
                                        <div className="h-72 rounded-[3.5rem] overflow-hidden shadow-2xl border-4 border-white">
                                            <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700" alt="Effective teaching" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="w-full lg:w-1/2 order-1 lg:order-2 text-right">
                            <div className="inline-flex items-center gap-3 px-5 py-2 bg-blue-50 text-blue-700 rounded-2xl mb-8 border border-blue-100/50">
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                                <span className="text-xs font-black uppercase tracking-[0.2em]">جوهر معهد دارين</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-10 font-heading leading-[1.1]">
                                رحلتنا في <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-amber-600">ابتكار العقول</span>
                            </h2>
                            <p className="text-gray-500 text-lg md:text-xl leading-relaxed font-medium mb-12 max-w-xl">
                                في معهد دارين، نحن لا ننقل المعرفة فحسب، بل نصيغ الشخصية. حكايتنا بدأت بشغف واحد: كيف نجعل التعليم أمتع رحلة في حياة الطالب؟ واليوم نعيش هذا الحلم مع آلاف الطلاب حول العالم.
                            </p>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="group flex flex-col md:flex-row items-center gap-6 p-8 bg-white rounded-[2rem] hover:bg-gray-50 transition-all duration-500 border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5">
                                    <div className="w-16 h-16 bg-blue-50 rounded-2xl shadow-sm flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                        <Zap size={32} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-gray-900 mb-2">رؤية الابتكار</h4>
                                        <p className="text-base text-gray-500 font-medium">ريادة التحول الرقمي في التعليم العربي بمعايير عالمية.</p>
                                    </div>
                                </div>
                                <div className="group flex flex-col md:flex-row items-center gap-6 p-8 bg-white rounded-[2rem] hover:bg-gray-50 transition-all duration-500 border border-gray-100 hover:border-gold/30 hover:shadow-xl hover:shadow-gold/5">
                                    <div className="w-16 h-16 bg-amber-50 rounded-2xl shadow-sm flex items-center justify-center text-gold shrink-0 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                                        <BookOpen size={32} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-gray-900 mb-2">رسالة التمكين</h4>
                                        <p className="text-base text-gray-500 font-medium">تمكين جيل من المبدعين بأدوات العلم وقيم الأصالة.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values Section - Enhanced Magic */}
            <section className="py-20 md:py-32 bg-[#F8F9FC] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-16 md:mb-24">
                        <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 font-heading">
                            القيم التي <span className="text-blue-600">تُحدد هويتنا</span>
                        </h2>
                        <div className="h-2 w-32 bg-gradient-to-r from-blue-600 to-gold mx-auto rounded-full mb-10"></div>
                        <p className="text-gray-500 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed font-medium">
                            نحن لا نؤمن بالصدفة في النجاح، بل نؤمن بأن الالتزام بهذه القيم هو ما يصنع الفرق الحقيقي في حياة طلابنا.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 max-w-7xl mx-auto">
                        {[
                            { icon: Shield, title: "الأمانة", color: "blue", desc: "نلتزم بأعلى معايير النزاهة في التعامل كشريك موثوق لمستقبل أبنائكم." },
                            { icon: Lightbulb, title: "الابتكار", color: "gold", desc: "نبتكر دائماً في طرق التدريس لنجعل العلم تجربة مشوقة ومحفزة." },
                            { icon: Award, title: "التميز", color: "emerald", desc: "نضع الجودة نصب أعيننا في كل تفاصيل البرامج التعليمية." },
                            { icon: Compass, title: "بناء الجيل", color: "indigo", desc: "هدفنا الأسمى هو تكوين شخصية الطالب ليكون عضواً فعالاً ومبدعاً." }
                        ].map((v, i) => (
                            <div key={i} className="group bg-white p-5 md:p-10 rounded-2xl md:rounded-[3rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-2xl transition-all duration-700 border border-gray-50 flex flex-col items-center text-center hover:-translate-y-4">
                                <div className={`w-12 h-12 md:w-24 md:h-24 bg-${v.color === 'gold' ? 'amber' : v.color}-50 text-${v.color === 'gold' ? 'gold' : v.color}-600 rounded-xl md:rounded-[2.5rem] flex items-center justify-center mb-4 md:mb-10 group-hover:bg-${v.color === 'gold' ? 'gold' : v.color}-600 group-hover:text-white transition-all duration-700 shadow-sm relative overflow-hidden`}>
                                    <v.icon size={24} className="md:w-[44px] md:h-[44px] relative z-10" />
                                    <div className={`absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-700`}></div>
                                </div>
                                <h3 className="text-sm md:text-2xl font-black text-gray-900 mb-2 md:mb-6 font-heading leading-tight">{v.title}</h3>
                                <p className="text-[10px] md:text-base text-gray-500 leading-relaxed font-medium line-clamp-3 md:line-clamp-none">
                                    {v.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final Call to Action - Magical Glow */}
            <section className="py-20 md:py-32 bg-white relative">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="bg-gray-950 rounded-none p-12 md:p-24 text-center text-white relative overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.15)] group">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/40 via-transparent to-indigo-900/40 opacity-50"></div>
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000"></div>
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gold/10 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000"></div>

                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-7xl font-black mb-10 font-heading tracking-tight">هل أنت مستعد لهذه الرحلة؟</h2>
                            <p className="text-gray-400 text-lg md:text-2xl max-w-2xl mx-auto mb-16 font-medium leading-relaxed">
                                انضم الآن لعائلة دارين واكتشف كيف يمكن للتعليم أن يغير قواعد اللعبة في حياتك ومستقبلك.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                <a href="/courses" className="px-12 py-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black rounded-2xl shadow-xl hover:shadow-blue-500/20 transition-all transform hover:-translate-y-2 active:scale-95">تصفح الدورات الآن</a>
                                <a href="/login" className="px-12 py-6 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl backdrop-blur-md border border-white/10 transition-all transform hover:-translate-y-1">سجل دخولك مجاناً</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
};
