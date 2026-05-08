import { ArrowLeft, BookOpen, Bell, MessageCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';

export const MasarSection = () => {
    const { adminPhone } = useSettings();

    return (
        <section className="py-2 bg-white dark:bg-slate-950 relative overflow-hidden transition-colors duration-500">
            <div className="container mx-auto px-3 relative z-10">

                <div className="max-w-6xl mx-auto bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] shadow-[0_30px_60px_-15px_rgba(30,27,75,0.4)] overflow-hidden border border-white/5 relative rounded-none">

                    {/* Background Patterns */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute left-0 bottom-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2"></div>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/simple-dashed.png')] opacity-20"></div>
                    </div>

                    <div className="flex flex-col lg:flex-row items-stretch min-h-[260px]">
                        {/* Image Side */}
                        <div className="w-full lg:w-[35%] relative shrink-0 overflow-hidden bg-white/[0.08] backdrop-blur-md flex items-center justify-center p-4 lg:p-3 border-b lg:border-b-0 lg:border-l border-white/10 group">
                            <div className="relative w-full h-full flex items-center justify-center">
                                <div className="absolute w-48 h-48 bg-indigo-500/20 blur-[80px] rounded-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                <img
                                    src="/dareen_books_banner.png"
                                    alt="بوابة الكتب والملخصات - دارين"
                                    className="w-full max-w-[280px] lg:max-w-[340px] h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                        </div>

                        {/* Text Content Side */}
                        <div className="w-full lg:w-[65%] p-4 md:p-6 lg:p-8 text-white relative z-20 text-center lg:text-right flex flex-col justify-center">

                            <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/20 rounded-full backdrop-blur-md">
                                    <Bell className="w-3 h-3 text-amber-400 animate-pulse" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">بوابة الكتب والملخصات</span>
                                </div>
                            </div>

                            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black mb-3 font-heading leading-tight">
                                <span className="text-white">مركز</span> <span className="text-white bg-indigo-600 px-2 py-0.5 md:px-4 md:py-1 inline-block transform -rotate-1 shadow-[0_10px_20px_rgba(79,70,229,0.3)] whitespace-nowrap">دارين</span> <span className="text-white">للمذكرات التعليمية</span>
                            </h2>

                            <p className="text-gray-300 text-[11px] md:text-xs lg:text-sm leading-relaxed mb-5 max-w-2xl mx-auto lg:mx-0 font-medium opacity-90">
                                حصرياً في مركز دارين، نوفر لك أقوى المذكرات التعليمية والملخصات الشاملة لجميع المراحل الدراسية، معدة بعناية من قبل نخبة من المعلمين لضمان تفوقك الدراسي.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-2 justify-center lg:justify-start">
                                <Link
                                    to="/books"
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-none font-black text-sm shadow-2xl shadow-indigo-600/20 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group"
                                >
                                    <FileText className="w-4 h-4 transition-transform group-hover:scale-110" />
                                    <span>تحميل مذكرة</span>
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                </Link>

                                <a
                                    href={`https://wa.me/2${adminPhone}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/20 text-white rounded-none font-black text-sm backdrop-blur-sm transition-all duration-300 flex items-center justify-center gap-2 hover:border-white/40"
                                >
                                    <MessageCircle className="w-4 h-4" />
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
