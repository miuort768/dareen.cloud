import { ArrowLeft, BookOpen, Bell, MessageCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';

export const MasarSection = () => {
    const { adminPhone } = useSettings();

    return (
        <section className="py-4 bg-white dark:bg-slate-950 relative overflow-hidden transition-colors duration-500">
            <div className="container mx-auto px-4 relative z-10">

                {/* The Single Big Rectangle - Redesigned for Premium Royal Theme */}
                <div className="max-w-6xl mx-auto bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] shadow-[0_30px_60px_-15px_rgba(30,27,75,0.4)] overflow-hidden border border-white/5 relative rounded-none">

                    {/* Background Patterns - Sharper and More Modern */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute left-0 bottom-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2"></div>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/simple-dashed.png')] opacity-20"></div>
                    </div>

                    <div className="flex flex-col lg:flex-row items-stretch min-h-[400px]">
                        {/* Image Side - Modern and Sharp with a subtle glow */}
                        <div className="w-full lg:w-[40%] relative shrink-0 overflow-hidden bg-white/[0.08] backdrop-blur-md flex items-center justify-center p-8 lg:p-4 border-b lg:border-b-0 lg:border-l border-white/10 group">
                            <div className="relative w-full h-full flex items-center justify-center">
                                {/* Decorative Glow behind the image */}
                                <div className="absolute w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                
                                <img
                                    src="/dareen_books_banner.png"
                                    alt="بوابة الكتب والملخصات - دارين"
                                    className="w-full max-w-[280px] lg:max-w-[340px] h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                        </div>

                        {/* Text Content Side */}
                        <div className="w-full lg:w-[60%] p-6 md:p-12 lg:p-14 text-white relative z-20 text-center lg:text-right flex flex-col justify-center">

                            <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full backdrop-blur-md">
                                    <Bell className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                                    <span className="text-xs font-black text-white uppercase tracking-widest">بوابة الكتب والملخصات</span>
                                </div>
                            </div>

                            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black mb-6 font-heading leading-tight">
                                <span className="text-white">مركز</span> <span className="text-white bg-indigo-600 px-3 py-1 md:px-5 md:py-1 inline-block transform -rotate-1 shadow-[0_10px_20px_rgba(79,70,229,0.3)] text-shadow-none whitespace-nowrap">دارين</span> <span className="text-white">للمذكرات التعليمية</span>
                            </h2>

                            <p className="text-gray-300 text-xs md:text-sm lg:text-base leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0 font-medium opacity-90">
                                حصرياً في مركز دارين، نوفر لك أقوى المذكرات التعليمية والملخصات الشاملة لجميع المراحل الدراسية، معدة بعناية من قبل نخبة من المعلمين لضمان تفوقك الدراسي.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link
                                    to="/books"
                                    className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-none font-black text-lg shadow-2xl shadow-indigo-600/20 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group"
                                >
                                    <FileText className="w-6 h-6 transition-transform group-hover:scale-110" />
                                    <span>تحميل مذكرة</span>
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
