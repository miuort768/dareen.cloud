import { Lightbulb, Heart, CheckCircle, BookOpen, Award, Users, Star } from 'lucide-react';

export const WhyChooseUs = () => {
    return (
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
                            <img src="/dareen_logo_new.jpg" alt="Logo" width="48" height="48" className="w-12 h-12 object-contain opacity-20 dark:opacity-30" />
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
                                    <span className="text-xs font-bold  text-gray-300">التميز التعليمي</span>
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
    );
};
