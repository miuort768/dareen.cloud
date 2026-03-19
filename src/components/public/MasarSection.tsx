import { ArrowLeft, BookOpen, Bell, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';

export const MasarSection = () => {
    const { adminPhone } = useSettings();

    return (
        <section className="py-12 bg-white relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">

                {/* The Single Big Rectangle - Redesigned for Watermelon Theme */}
                <div className="max-w-6xl mx-auto bg-gradient-to-br from-black via-gray-900 to-red-950 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden border border-white/5 relative rounded-none">

                    {/* Background Patterns - Sharper and More Modern */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute right-0 top-0 w-80 h-80 bg-red-600 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute left-0 bottom-0 w-80 h-80 bg-green-600 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2"></div>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/simple-dashed.png')] opacity-20"></div>
                    </div>

                    <div className="flex flex-col lg:flex-row items-stretch min-h-[400px]">
                        {/* Image Side - Modern and Sharp with a subtle glow */}
                        <div className="w-full lg:w-[35%] relative shrink-0 overflow-hidden bg-white/[0.08] backdrop-blur-md flex items-center justify-center p-8 lg:p-0 border-b lg:border-b-0 lg:border-l border-white/10 group">
                            <div className="relative w-full h-full flex items-center justify-center">
                                {/* Decorative Glow behind the image */}
                                <div className="absolute w-48 h-48 bg-red-600/20 blur-[60px] rounded-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                
                                <img
                                    src="/dareen_logo_new.jpg"
                                    alt="شعار دارين"
                                    className="w-40 h-40 lg:w-56 lg:h-56 object-contain rounded-none shadow-2xl border border-white/20 p-2 bg-black/20 hover:border-red-500/50 transition-all duration-700 group-hover:scale-105"
                                />
                            </div>
                        </div>

                        {/* Text Content Side */}
                        <div className="w-full lg:w-[65%] p-6 md:p-12 lg:p-14 text-white relative z-20 text-center lg:text-right flex flex-col justify-center">

                            <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-600/20 border border-red-500/30 rounded-full backdrop-blur-md">
                                    <Bell className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                                    <span className="text-xs font-black text-red-50 uppercase tracking-widest">بوابة التميز الرقمي</span>
                                </div>
                            </div>

                            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black mb-6 font-heading leading-tight">
                                <span className="text-white">منصة</span> <span className="text-white bg-green-600 px-3 py-1 md:px-5 md:py-1 inline-block transform -rotate-1 shadow-[0_10px_20px_rgba(22,163,74,0.3)] text-shadow-none whitespace-nowrap">دارين</span> <span className="text-white">للتعليم والتدريب</span>
                            </h2>

                            <p className="text-gray-300 text-xs md:text-sm lg:text-base leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0 font-medium opacity-90">
                                وجهتك المتكاملة للتعلم الذكي. نوفر لك بيئة تعليمية تفاعلية تجمع بين جودة المحتوى وأحدث تقنيات التعليم الرقمي لضمان تفوقك الدائم.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link
                                    to="/courses"
                                    className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white rounded-none font-black text-lg shadow-2xl shadow-red-600/20 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group"
                                >
                                    <BookOpen className="w-6 h-6 transition-transform group-hover:scale-110" />
                                    <span>تصفح الدورات</span>
                                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                </Link>

                                <a
                                    href={`https://wa.me/2${adminPhone}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/20 text-white rounded-none font-black text-lg backdrop-blur-sm transition-all duration-300 flex items-center justify-center gap-3 hover:border-white/40"
                                >
                                    <MessageCircle className="w-6 h-6" />
                                    <span>تواصل معنا</span>
                                </a>

                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};
