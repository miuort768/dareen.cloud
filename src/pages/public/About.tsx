
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { Zap, Shield, BookOpen, Target, Compass, Sparkles, Lightbulb } from 'lucide-react';
import { SEO } from '../../components/SEO';

export const About = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-800 relative select-none">
            <SEO
                title="عن المعهد"
                description="تعرف على معهد دارين وتاريخنا في التميز التعليمي. نهدف لبناء القدرات وتنمية المهارات عبر برامج تعليمية مبتكرة."
            />
            <PublicNavbar />

            {/* Hero Section */}
            <section className="relative pt-4 pb-16 md:pt-48 md:pb-24 overflow-hidden bg-[#FDFCF8]">
                {/* Creative Background Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

                {/* Subtle Islamic Pattern with Mask */}
                <div className="absolute inset-0 opacity-[0.02] islamic-pattern" style={{ maskImage: 'radial-gradient(circle at center, black, transparent 80%)' }}></div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-900 border border-gray-100 rounded-none shadow-sm mb-8 animate-fade-in group hover:border-gold transition-colors duration-500">
                        <Sparkles size={14} className="text-gold group-hover:scale-125 transition-transform" />
                        <span className="text-xs font-black tracking-[0.2em] uppercase">معهد دارين | أصالة ومعاصرة</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-8 font-heading">
                        <span className="block mb-6 md:mb-10">عن معهد دارين</span>
                        <span className="block text-2xl md:text-4xl text-gray-600 font-bold">
                            | حكاية <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-hover to-gold drop-shadow-sm">شغف تعليمي</span> تجاوزت الحدود
                        </span>
                    </h1>

                    <p className="text-base md:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed md:leading-loose mb-12 px-4 font-medium">
                        نحن لسنا مجرد منصة تعليمية، بل نحن عائلة تربوية تسعى لغرس القيم وبناء المهارات وتمكين الطلاب من الوصول إلى أقصى إمكاناتهم في بيئة محفزة للإبداع.
                    </p>

                    <div className="inline-flex items-center gap-12 px-10 py-4 group">
                        <div className="flex flex-col items-center">
                            <span className="text-4xl md:text-5xl font-black text-gray-900 mb-1 group-hover:text-gold transition-colors">10+</span>
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">سنوات خبرة</span>
                        </div>

                        <div className="w-px h-12 bg-gray-200"></div>

                        <div className="flex flex-col items-center">
                            <span className="text-3xl md:text-5xl font-black text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">100%</span>
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">رضا تام</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vision & Mission */}
            <section className="py-24 relative overflow-hidden bg-white">
                {/* Subtle Geometric Element */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-[#FDFCF8] -skew-x-12 translate-x-1/2 pointer-events-none"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16 max-w-6xl mx-auto">

                        {/* Image - Kept EXACTLY as it was */}
                        <div className="w-full lg:w-5/12">
                            <div className="relative group max-w-sm mx-auto">
                                <div className="absolute -inset-4 bg-gradient-to-r from-gold/20 to-gold-hover/20 clip-hexagon opacity-30 blur-2xl group-hover:scale-105 transition-transform duration-700"></div>
                                <div className="relative w-full aspect-square overflow-hidden clip-hexagon shadow-2xl">
                                    <img
                                        src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                        alt="About"
                                        className="w-full h-full object-cover transform transition duration-1000 group-hover:scale-110"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Content - Enhanced Design */}
                        <div className="w-full lg:w-7/12">
                            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-gray-900 text-white rounded-none mb-6">
                                <span className="text-xs font-black uppercase tracking-[0.2em]">قصة الشغف والنجاح</span>
                            </div>

                            <h2 className="text-3xl md:text-5xl font-heading font-black text-gray-900 leading-[1.2] mb-8">
                                رحلتنا في <span className="text-gold relative inline-block">
                                    بناء العقول
                                    <div className="absolute -bottom-2 right-0 w-2/3 h-1 bg-blue-600/20"></div>
                                </span>
                            </h2>

                            <p className="text-gray-500 text-lg leading-relaxed font-medium mb-10 max-w-xl">
                                تأسس معهد دارين انطلاقاً من إيماننا العميق بأن التعليم هو حجر الزاوية في بناء المجتمعات، حيث نسعى لغرس القيم وتنمية الشخصية قبل المعلومة.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                                {/* Vision Card */}
                                <div className="p-8 bg-white border border-gray-100 rounded-none shadow-sm hover:border-gold hover:shadow-xl hover:shadow-gold/5 transition-all duration-500 group relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-0 bg-gold group-hover:h-full transition-all duration-500"></div>
                                    <div className="w-14 h-14 bg-amber-50 text-gold flex items-center justify-center mb-6 group-hover:bg-gold group-hover:text-white transition-all duration-500 rounded-none transform group-hover:rotate-12">
                                        <Zap className="w-7 h-7" strokeWidth={1.5} />
                                    </div>
                                    <h4 className="text-xl font-black text-gray-900 mb-3 font-heading">رسالة الابتكار</h4>
                                    <p className="text-sm text-gray-400 leading-relaxed font-medium">نطمح لريادة التعليم الرقمي عبر دمج الأصالة بأحدث الأساليب العالمية.</p>
                                </div>

                                {/* Mission Card */}
                                <div className="p-8 bg-white border border-gray-100 rounded-none shadow-sm hover:border-blue-600 hover:shadow-xl hover:shadow-blue-600/5 transition-all duration-500 group relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-0 bg-blue-600 group-hover:h-full transition-all duration-500"></div>
                                    <div className="w-14 h-14 bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 rounded-none transform group-hover:-rotate-12">
                                        <BookOpen className="w-7 h-7" strokeWidth={1.5} />
                                    </div>
                                    <h4 className="text-xl font-black text-gray-900 mb-3 font-heading">تعليم قيمي</h4>
                                    <p className="text-sm text-gray-400 leading-relaxed font-medium">بناء جيل مُعتز بهويته، يمتلك مهارات القرن الحادي والعشرين بتمكن.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="py-24 bg-[#FDFDFD] relative overflow-hidden">
                {/* Decorative Blobs (Hoopa Style) */}
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-100 rounded-full blur-[100px] opacity-40 animate-pulse"></div>
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-gold/10 rounded-full blur-[100px] opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-16 lg:mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-1 bg-gray-900 text-white rounded-none mb-4 mx-auto">
                            <Sparkles size={14} className="text-gold" />
                            <span className="text-xs font-bold uppercase tracking-[0.2em]">هويتنا ومبادئنا</span>
                        </div>
                        <h2 className="text-4xl lg:text-6xl font-black text-gray-900 mb-6 font-heading">
                            قيمنا <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-gold">الجوهرية</span>
                        </h2>
                        <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
                            ليست مجرد شعارات، بل هي المنهج الذي نتبعه في كل لقاء تعليمي لنبني جيلاً واعياً ومبدعاً.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 max-w-7xl mx-auto">
                        {/* Value 1 */}
                        <div className="group relative p-4 lg:p-8 bg-white border border-gray-100 rounded-none hover:border-blue-500 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full overflow-hidden">
                            {/* Holographic Mesh Background on Hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none"
                                style={{ background: 'radial-gradient(at 0% 0%, #2563eb 0px, transparent 50%), radial-gradient(at 100% 100%, #d4af37 0px, transparent 50%)' }}>
                            </div>

                            <div className="mb-4 lg:mb-8 relative">
                                <div className="w-10 h-10 lg:w-16 lg:h-16 bg-gray-50 text-blue-600 flex items-center justify-center rounded-none group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 transform group-hover:rotate-[360deg]">
                                    <Shield className="w-5 h-5 lg:w-8 lg:h-8" strokeWidth={1.5} />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-50 opacity-0 group-hover:opacity-100 transition-all"></div>
                            </div>

                            <h3 className="text-base lg:text-2xl font-black text-gray-900 mb-2 lg:mb-4 relative z-10 font-heading">الأمانة والنزاهة</h3>
                            <p className="text-xs lg:text-base text-gray-400 lg:text-gray-500 leading-relaxed font-medium relative z-10">
                                نغرس القيم الأخلاقية في نفوس طلابنا كبذرة أولى للنجاح، فالأخلاق هي أساس العلم الحقيقي.
                            </p>

                            <div className="mt-auto pt-8 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">Integrity</span>
                                <div className="w-12 h-[1px] bg-blue-600"></div>
                            </div>
                        </div>

                        {/* Value 2 */}
                        <div className="group relative p-4 lg:p-8 bg-white border border-gray-100 rounded-none hover:border-gold transition-all duration-500 hover:-translate-y-2 flex flex-col h-full overflow-hidden">
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none"
                                style={{ background: 'radial-gradient(at 100% 0%, #d4af37 0px, transparent 50%), radial-gradient(at 0% 100%, #b45309 0px, transparent 50%)' }}>
                            </div>

                            <div className="mb-4 lg:mb-8 relative">
                                <div className="w-10 h-10 lg:w-16 lg:h-16 bg-gray-50 text-gold flex items-center justify-center rounded-none group-hover:bg-gold group-hover:text-white transition-all duration-500">
                                    <Lightbulb className="w-5 h-5 lg:w-8 lg:h-8" strokeWidth={1.5} />
                                </div>
                            </div>

                            <h3 className="text-base lg:text-2xl font-black text-gray-900 mb-2 lg:mb-4 relative z-10 font-heading">الابتكار التعليمي</h3>
                            <p className="text-xs lg:text-base text-gray-400 lg:text-gray-500 leading-relaxed font-medium relative z-10">
                                نستخدم أحدث التقنيات لنحول التعليم إلى تجربة ممتعة وتفاعلية تكسر حاجز الملل التقليدي.
                            </p>

                            <div className="mt-auto pt-8 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <span className="text-[10px] font-bold text-gold tracking-widest uppercase">Innovation</span>
                                <div className="w-12 h-[1px] bg-gold"></div>
                            </div>
                        </div>

                        {/* Value 3 */}
                        <div className="group relative p-4 lg:p-8 bg-white border border-gray-100 rounded-none hover:border-emerald-500 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full overflow-hidden">
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none"
                                style={{ background: 'radial-gradient(at 50% 50%, #10b981 0px, transparent 50%)' }}>
                            </div>

                            <div className="mb-4 lg:mb-8 relative">
                                <div className="w-10 h-10 lg:w-16 lg:h-16 bg-gray-50 text-emerald-600 flex items-center justify-center rounded-none group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 scale-x-[-1]">
                                    <Target className="w-5 h-5 lg:w-8 lg:h-8" strokeWidth={1.5} />
                                </div>
                            </div>

                            <h3 className="text-base lg:text-2xl font-black text-gray-900 mb-2 lg:mb-4 relative z-10 font-heading">التميز والإتقان</h3>
                            <p className="text-xs lg:text-base text-gray-400 lg:text-gray-500 leading-relaxed font-medium relative z-10">
                                لا نرضى بأقل من أعلى معايير الجودة في كل حصة، فهدفنا هو وصول الطالب لمرحلة الإبداع.
                            </p>

                            <div className="mt-auto pt-8 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <span className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase">Excellence</span>
                                <div className="w-12 h-[1px] bg-emerald-600"></div>
                            </div>
                        </div>

                        {/* Value 4 */}
                        <div className="group relative p-4 lg:p-8 bg-white border border-gray-100 rounded-none hover:border-indigo-600 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full overflow-hidden">
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none"
                                style={{ background: 'radial-gradient(at 0% 100%, #4f46e5 0px, transparent 50%), radial-gradient(at 100% 0%, #312e81 0px, transparent 50%)' }}>
                            </div>

                            <div className="mb-4 lg:mb-8 relative">
                                <div className="w-10 h-10 lg:w-16 lg:h-16 bg-gray-50 text-indigo-600 flex items-center justify-center rounded-none group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                    <Compass className="w-5 h-5 lg:w-8 lg:h-8" strokeWidth={1.5} />
                                </div>
                            </div>

                            <h3 className="text-base lg:text-2xl font-black text-gray-900 mb-2 lg:mb-4 relative z-10 font-heading">بناء الشخصية</h3>
                            <p className="text-xs lg:text-base text-gray-400 lg:text-gray-500 leading-relaxed font-medium relative z-10">
                                نركز على بناء إنسان مفكر ومستقل، يمتلك الثقة بالنفس والقدرة على مواجهة تحديات المستقبل.
                            </p>

                            <div className="mt-auto pt-8 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <span className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase">Growth</span>
                                <div className="w-12 h-[1px] bg-indigo-600"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
};
