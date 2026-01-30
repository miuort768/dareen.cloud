import { ArrowLeft, BookOpen } from 'lucide-react';

export const MasarSection = () => {
    return (
        <section className="py-12 bg-white relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">

                {/* The Single Big Rectangle */}
                <div className="max-w-6xl mx-auto bg-gradient-to-r from-[#1e3a8a] to-[#0f286e] rounded-3xl shadow-2xl overflow-hidden border border-[#1e3a8a]/20 relative">

                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute right-0 top-0 w-64 h-64 bg-white rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"></div>
                        <div className="absolute left-0 bottom-0 w-64 h-64 bg-[#0d9488] rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3"></div>
                    </div>

                    <div className="flex flex-col lg:flex-row items-center">

                        {/* Image Side (The Logo at the edge) */}
                        <div className="w-full lg:w-1/3 h-64 lg:h-auto bg-white flex items-center justify-center p-8 relative shrink-0">
                            {/* Decorative slant for Desktop - Fixed for RTL: removed skew to keep it simple rectangle or slant from left */}
                            <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-12 bg-white skew-x-[-6deg] translate-x-6 z-10"></div>

                            <div className="relative z-20 w-48 h-48 flex items-center justify-center">
                                {/* Using the logo as requested */}
                                <img
                                    src="/logo.png"
                                    alt="شعار دارين"
                                    className="w-full h-full object-contain drop-shadow-lg"
                                />
                            </div>
                        </div>

                        {/* Text Content Side */}
                        <div className="w-full lg:w-2/3 p-8 lg:p-12 text-white relative z-20 text-center lg:text-right">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full mb-4 backdrop-blur-sm">
                                <span className="w-2 h-2 rounded-full bg-[#0d9488] animate-pulse"></span>
                                <span className="text-xs font-bold text-gray-100">بوابة المستقبل</span>
                            </div>

                            <h2 className="text-3xl md:text-5xl font-black mb-4 font-heading leading-tight">
                                منصة <span className="text-[#0d9488] bg-white px-2 rounded-lg inline-block transform -rotate-1 shadow-lg mx-1">مسار</span>
                            </h2>

                            <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0 font-medium">
                                نجمع لك أحدث الأدوات التعليمية، المصادر الرقمية، وبرامج التطوير المهني في مكان واحد لضمان مستقبل تعليمي مشرق.
                            </p>

                            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                                <button className="px-8 py-4 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl font-bold shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-1 transition-all flex items-center gap-2 group">
                                    <BookOpen className="w-5 h-5" />
                                    <span>تصفح المنصة</span>
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                </button>

                                <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 text-white rounded-xl font-bold backdrop-blur-sm transition-all flex items-center gap-2">
                                    <span>اعرف المزيد</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};
