import { ArrowLeft, BookOpen, MessageCircle, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';

export const MasarSection = () => {
    const { adminPhone } = useSettings();

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
                        {/* Image Side - Hidden on Mobile */}
                        <div className="hidden lg:block lg:w-1/3 relative shrink-0 overflow-hidden bg-[#f8f9fa]">
                            <div className="absolute inset-0 z-10 flex items-center justify-center">
                                <img
                                    src="/dareen_logo_new.jpg"
                                    alt="شعار دارين"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Text Content Side */}
                        <div className="w-full lg:w-2/3 p-4 md:p-8 lg:p-10 text-white relative z-20 text-center lg:text-right flex flex-col justify-center">

                            <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full backdrop-blur-md">
                                    <Bell className="w-3 h-3 text-[#0d9488] animate-pulse" />
                                    <span className="text-[10px] md:text-xs font-bold text-gray-100 uppercase tracking-wider">بوابة التميز الرقمي</span>
                                </div>
                            </div>

                            <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black mb-4 font-heading leading-tight">
                                <span className="text-[#d4af37]">منصة</span> <span className="text-[#0d9488] bg-white px-2 py-0.5 md:px-4 md:py-1 inline-block transform -rotate-1 shadow-[0_10px_20px_rgba(0,0,0,0.2)] text-shadow-none whitespace-nowrap">دارين</span> <span className="text-[#d4af37]">للتعليم والتدريب</span>
                            </h2>

                            <p className="text-gray-200 text-sm md:text-base lg:text-lg leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0 font-medium opacity-90">
                                وجهتك المتكاملة للتعلم الذكي. نوفر لك بيئة تعليمية تفاعلية تجمع بين جودة المحتوى وأحدث تقنيات التعليم الرقمي لضمان تفوقك.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                                <Link
                                    to="/courses"
                                    className="px-8 py-3.5 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-none font-bold shadow-xl hover:shadow-[#0d9488]/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3 group"
                                >
                                    <BookOpen className="w-5 h-5 transition-transform group-hover:scale-110" />
                                    <span>تصفح الدورات</span>
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                </Link>

                                <a
                                    href={`https://wa.me/${adminPhone}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/20 text-white rounded-none font-bold backdrop-blur-sm transition-all duration-300 flex items-center justify-center gap-2 hover:border-white/50"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    <span>تواصل مع الادارة</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};
