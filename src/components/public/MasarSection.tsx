import { ArrowLeft, BookOpen } from 'lucide-react';

export const MasarSection = () => {
    return (
        <section className="py-8 bg-white relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">

                {/* The Single Big Rectangle */}
                <div className="max-w-6xl mx-auto bg-gradient-to-r from-[#1e3a8a] to-[#0f286e] shadow-2xl overflow-hidden border border-[#1e3a8a]/20 relative">

                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute right-0 top-0 w-64 h-64 bg-white rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"></div>
                        <div className="absolute left-0 bottom-0 w-64 h-64 bg-[#0d9488] rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3"></div>
                    </div>

// Remove section parsing and padding reduction from here as it is better targeted in separate ReplaceFileContent or by just targeting the section wrapper separately if needed.
                    // This replacement focuses on the inner content structure (Image + Text).

                    <div className="flex flex-col lg:flex-row items-stretch">
                        {/* Changed items-center to items-stretch to make image fill height */}

                        {/* Image Side - Removed padding completely */}
                        <div className="w-full lg:w-1/3 bg-white relative shrink-0 min-h-[250px] lg:min-h-0">
                            {/* Decorative slant */}
                            <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-12 bg-white skew-x-[-6deg] translate-x-6 z-10 transition-transform duration-500 hover:translate-x-4"></div>

                            <div className="absolute inset-0 z-0">
                                <img
                                    src="/dareen_logo_new.jpg"
                                    alt="شعار دارين"
                                    className="w-full h-full object-cover"
                                />
                                {/* Added overlay gradient so text on image (if any) is readable, or just to blend it */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent lg:bg-none"></div>
                            </div>
                        </div>

                        {/* Text Content Side - Reduced padding */}
                        <div className="w-full lg:w-2/3 p-6 lg:p-10 text-white relative z-20 text-center lg:text-right flex flex-col justify-center">

                            <div className="flex items-center justify-center lg:justify-start gap-4 mb-3">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full backdrop-blur-sm">
                                    <span className="w-2 h-2 rounded-full bg-[#0d9488] animate-pulse"></span>
                                    <span className="text-xs font-bold text-gray-100">بوابة المستقبل</span>
                                </div>
                            </div>

                            <h2 className="text-2xl md:text-4xl font-black mb-3 font-heading leading-tight">
                                منصة <span className="text-[#0d9488] bg-white px-3 py-1 inline-block transform -rotate-2 shadow-[0_0_15px_rgba(13,148,136,0.3)] text-shadow-none">دارين</span>
                            </h2>

                            <p className="text-gray-200 text-base md:text-lg leading-relaxed mb-6 max-w-2xl mx-auto lg:mx-0 font-medium opacity-90">
                                نجمع لك أحدث الأدوات التعليمية، المصادر الرقمية، وبرامج التطوير المهني في مكان واحد لضمان مستقبل تعليمي مشرق.
                            </p>

                            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                                <button className="px-6 py-3 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-lg font-bold shadow-lg hover:shadow-[#0d9488]/50 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 group ring-offset-2 ring-offset-[#1e3a8a] focus:ring-2 ring-[#0d9488]">
                                    <BookOpen className="w-5 h-5" />
                                    <span>تصفح المنصة</span>
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                </button>

                                <button className="px-6 py-3 bg-transparent hover:bg-white/10 border border-white/30 text-white rounded-lg font-bold transition-all duration-300 flex items-center gap-2 hover:border-white">
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
