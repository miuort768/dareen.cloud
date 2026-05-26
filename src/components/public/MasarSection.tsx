import { Link } from 'react-router-dom';
import { Download, FileText, ArrowLeft, MessageCircle, Shield, BadgeCheck, Headphones, Moon } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

const FloatingBtns = ({ phone }: { phone: string }) => (
    <div className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 flex-col gap-3 z-50">
        <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer"
            className="w-12 h-12 rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center" title="واتساب">
            <MessageCircle size={22} />
        </a>
        <a href="https://t.me/daren_school" target="_blank" rel="noopener noreferrer"
            className="w-12 h-12 rounded-full bg-[#0088CC] text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center" title="تيليجرام">
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
        </a>
        <button onClick={() => document.documentElement.classList.toggle('dark')}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6C4BFF] to-[#8B5CF6] text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center" title="الوضع الليلي">
            <Moon size={22} />
        </button>
    </div>
);

export const MasarSection = () => {
    const { adminPhone } = useSettingsStore();

    return (
        <>
            {/* ─── Desktop version ─── */}
            <section className="hidden md:block py-4 bg-white dark:bg-slate-950 relative overflow-hidden transition-colors duration-500">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-6xl mx-auto bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] shadow-[0_30px_60px_-15px_rgba(30,27,75,0.4)] overflow-hidden border border-white/5 relative rounded-none">
                        <div className="absolute inset-0 opacity-20 pointer-events-none">
                            <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
                            <div className="absolute left-0 bottom-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2"></div>
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/simple-dashed.png')] opacity-20"></div>
                        </div>
                        <div className="flex flex-col lg:flex-row items-stretch min-h-[400px]">
                            <div className="w-full lg:w-[40%] relative shrink-0 overflow-hidden bg-white/[0.08] backdrop-blur-md flex items-center justify-center p-8 lg:p-4 border-b lg:border-b-0 lg:border-l border-white/10 group">
                                <div className="absolute top-0 -left-[100%] w-[100%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine-slow pointer-events-none z-30"></div>
                                <div className="relative w-full h-full flex items-center justify-center z-10">
                                    <div className="absolute w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                    <picture>
                                        <source srcSet="/dareen_books_portal_v3.webp" type="image/webp" />
                                        <source srcSet="/dareen_books_portal_v3.avif" type="image/avif" />
                                        <img src="/dareen_books_portal_v3.png" alt="بوابة الكتب والملخصات - دارين" width="680" height="680" loading="lazy" decoding="async" className="w-full max-w-[280px] lg:max-w-[340px] h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700" />
                                    </picture>
                                </div>
                            </div>
                            <div className="w-full lg:w-[60%] p-6 md:p-12 lg:p-14 text-white relative z-20 text-center lg:text-right flex flex-col justify-center">
                                <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full backdrop-blur-md">
                                        <Download className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                                        <span className="text-xs font-black text-white uppercase tracking-widest">بوابة الكتب والملخصات</span>
                                    </div>
                                </div>
                                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black mb-3 font-heading leading-tight">
                                    <span className="text-white">مركز</span> <span className="text-white bg-indigo-600 px-3 py-1 md:px-5 md:py-1 inline-block transform -rotate-1 shadow-[0_10px_20px_rgba(79,70,229,0.3)] text-shadow-none whitespace-nowrap">دارين</span> <span className="text-white">للمذكرات التعليمية</span>
                                </h2>
                                <p className="text-gray-300 text-[10px] sm:text-xs md:text-sm lg:text-base leading-relaxed mb-6 max-w-2xl mx-auto lg:mx-0 font-medium opacity-90">
                                    حصرياً في مركز دارين، نوفر لك أقوى المذكرات التعليمية والملخصات الشاملة لجميع المراحل الدراسية، معدة بعناية من قبل نخبة من المعلمين لضمان تفوقك الدراسي.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                    <Link to="/books" className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-none font-black text-lg shadow-2xl shadow-indigo-600/20 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group">
                                        <FileText className="w-6 h-6 transition-transform group-hover:scale-110" />
                                        <span>تحميل مذكرة</span>
                                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                    </Link>
                                    <a href={`https://wa.me/2${adminPhone}`} target="_blank" rel="noopener noreferrer" className="px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/20 text-white rounded-none font-black text-lg backdrop-blur-sm transition-all duration-300 flex items-center justify-center gap-3 hover:border-white/40">
                                        <MessageCircle className="w-6 h-6" />
                                        <span>تواصل معنا</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Mobile version ─── */}
            <section className="block md:hidden relative overflow-hidden bg-[#F7F8FC] pt-3 pb-4">
                {/* Decorative blobs */}
                <div className="absolute top-20 -right-20 w-60 h-60 bg-purple-400/15 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-40 -left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="relative z-10 px-4">
                    {/* Hero Banner Image */}
                    <div className="relative rounded-2xl overflow-hidden shadow-lg mb-4">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1B1464]/60 via-transparent to-transparent z-10"></div>
                        <picture>
                            <source srcSet="/dareen_books_portal_v3.webp" type="image/webp" />
                            <source srcSet="/dareen_books_portal_v3.avif" type="image/avif" />
                            <img src="/dareen_books_portal_v3.png" alt="بوابة الكتب والملخصات" width="400" height="300" loading="lazy" className="w-full h-auto object-cover" />
                        </picture>
                    </div>

                    {/* Title Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-5 mb-5 flex items-center justify-between">
                        <div>
                            <h2 className="text-[#1E1E2F] text-lg font-black">بوابة الكتب والملخصات</h2>
                            <p className="text-[#7D8597] text-[11px] font-medium mt-0.5">جميع المذكرات في مكان واحد</p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center">
                            <Download size={20} className="text-[#6C4BFF]" />
                        </div>
                    </div>

                    {/* Purple Gradient Section */}
                    <div className="bg-gradient-to-br from-[#6C4BFF] via-[#5A3BFF] to-[#1B1464] rounded-3xl p-6 shadow-lg shadow-purple-500/20 mb-5">
                        {/* Tabs */}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative">
                                <span className="text-white font-black text-sm">مركز دارين</span>
                                <div className="absolute -bottom-1 right-0 w-full h-0.5 bg-white/80 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.6)]"></div>
                            </div>
                            <span className="text-white/50 font-medium text-sm">للمذكرات التعليمية</span>
                        </div>

                        {/* Description */}
                        <p className="text-white/80 text-[13px] leading-relaxed mb-6 font-medium">
                            حصريًا في مركز دارين، نوفر لك أقوى المذكرات التعليمية والملخصات الشاملة لجميع المراحل الدراسية، معدة بعناية من قبل نخبة من المعلمين لضمان تفوقك الدراسي.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col gap-3">
                            <Link
                                to="/books"
                                className="w-full py-4 bg-gradient-to-r from-[#8B5CF6] to-[#6C4BFF] text-white font-black text-base shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 rounded-2xl group"
                            >
                                <FileText size={20} />
                                <span>تحميل مذكرة</span>
                                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            </Link>
                            <a
                                href={`https://wa.me/2${adminPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3.5 bg-white/5 backdrop-blur-sm border border-white/20 text-white font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-3 rounded-2xl"
                            >
                                <MessageCircle size={18} />
                                <span>تواصل معنا</span>
                            </a>
                        </div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center bg-white rounded-2xl shadow-sm border border-gray-100/80 p-4">
                            <div className="w-12 h-12 mx-auto mb-2.5 rounded-2xl bg-purple-50 flex items-center justify-center">
                                <Shield size={20} className="text-[#6C4BFF]" />
                            </div>
                            <span className="text-[#1E1E2F] text-[11px] font-bold leading-tight block">جودة مضمونة</span>
                        </div>
                        <div className="text-center bg-white rounded-2xl shadow-sm border border-gray-100/80 p-4">
                            <div className="w-12 h-12 mx-auto mb-2.5 rounded-2xl bg-emerald-50 flex items-center justify-center">
                                <BadgeCheck size={20} className="text-[#18C76F]" />
                            </div>
                            <span className="text-[#1E1E2F] text-[11px] font-bold leading-tight block">محتوى موثوق</span>
                        </div>
                        <div className="text-center bg-white rounded-2xl shadow-sm border border-gray-100/80 p-4">
                            <div className="w-12 h-12 mx-auto mb-2.5 rounded-2xl bg-amber-50 flex items-center justify-center">
                                <Headphones size={20} className="text-[#F5A623]" />
                            </div>
                            <span className="text-[#1E1E2F] text-[11px] font-bold leading-tight block">دعم مستمر</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Floating Buttons - desktop only */}
            <FloatingBtns phone={adminPhone} />
        </>
    );
};
