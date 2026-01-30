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



                    <div className="flex flex-col lg:flex-row items-stretch">
                        {/* Image Side - Optimized for Mobile Branding */}
                        <div className="w-full lg:w-1/3 bg-white relative shrink-0 h-40 lg:h-auto overflow-hidden">
                            <div className="absolute inset-0 z-10 flex items-center justify-center p-4 lg:p-0">
                                <img
                                    src="/dareen_logo_new.jpg"
                                    alt="شعار دارين"
                                    className="w-full h-full object-contain lg:object-cover"
                                />
                            </div>
                            {/* Decorative slant - only on desktop */}
                            <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-12 bg-white skew-x-[-6deg] translate-x-6 z-20"></div>
                        </div>

                        {/* Text Content Side */}
                        <div className="w-full lg:w-2/3 p-6 md:p-8 lg:p-10 text-white relative z-20 text-center lg:text-right flex flex-col justify-center bg-gradient-to-b from-transparent to-[#0f286e]/50 lg:to-transparent">

                            <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full backdrop-blur-md">
                                    <span className="w-2 h-2 rounded-full bg-[#0d9488] animate-pulse"></span>
                                    <span className="text-[10px] md:text-xs font-bold text-gray-100 uppercase tracking-wider">بوابة التميز الرقمي</span>
                                </div>
                            </div>

                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-4 font-heading leading-tight">
                                منصة <span className="text-[#0d9488] bg-white px-4 py-1 inline-block transform -rotate-1 shadow-[0_10px_20px_rgba(0,0,0,0.2)] text-shadow-none">دارين</span>
                            </h2>

                            <p className="text-gray-200 text-sm md:text-base lg:text-lg leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0 font-medium opacity-90">
                                وجهتك المتكاملة للتعلم الذكي. نوفر لك بيئة تعليمية تفاعلية تجمع بين جودة المحتوى وأحدث تقنيات التعليم الرقمي لضمان تفوقك.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                                <button className="px-8 py-3.5 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-lg font-bold shadow-xl hover:shadow-[#0d9488]/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3 group">
                                    <BookOpen className="w-5 h-5 transition-transform group-hover:scale-110" />
                                    <span>ابدأ التعلم الآن</span>
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                </button>

                                <button className="px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/20 text-white rounded-lg font-bold backdrop-blur-sm transition-all duration-300 flex items-center justify-center gap-2 hover:border-white/50">
                                    <span>اكتشف المنصة</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};
