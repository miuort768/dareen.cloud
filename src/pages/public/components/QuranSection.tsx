import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, ClipboardCheck, Mic, Sparkles, Star } from 'lucide-react';

interface QuranSectionProps {
    whatsappNumber: string;
}

const LeafDecoration = () => (
    <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 pointer-events-none overflow-hidden opacity-60">
        <svg viewBox="0 0 200 200" className="w-full h-full text-emerald-400/30">
            <defs>
                <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#08B26A" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#6C4BFF" stopOpacity="0.15" />
                </linearGradient>
            </defs>
            <path d="M180 20 Q140 40 120 80 Q100 120 130 150 Q160 130 170 90 Q180 50 180 20Z" fill="url(#leafGrad)" transform="rotate(15, 100, 100)" />
            <path d="M160 60 Q120 70 100 100 Q80 130 110 155 Q140 140 150 110 Q160 80 160 60Z" fill="url(#leafGrad)" transform="rotate(30, 100, 100)" />
            <path d="M200 40 Q170 50 150 80 Q130 110 150 135 Q170 120 180 90 Q190 60 200 40Z" fill="url(#leafGrad)" transform="rotate(-10, 100, 100)" />
            <circle cx="170" cy="30" r="8" fill="#08B26A" opacity="0.15" />
            <circle cx="150" cy="70" r="5" fill="#6C4BFF" opacity="0.1" />
            <circle cx="190" cy="60" r="6" fill="#08B26A" opacity="0.12" />
        </svg>
    </div>
);

export const QuranSection = ({ whatsappNumber }: QuranSectionProps) => {
    return (
        <>
            {/* Desktop version */}
            <section className="hidden md:block pt-6 pb-6 relative overflow-hidden bg-[rgb(var(--bg-surface))] transition-colors duration-500">
                <div className="absolute top-0 left-0 w-full h-px border-t border-dashed border-emerald-500/30 z-20"></div>
                <div className="absolute bottom-0 left-0 w-full h-px border-b border-dashed border-emerald-500/30 z-20"></div>
                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.2]"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 20% 30%, #6366F1 0%, transparent 45%), radial-gradient(circle at 80% 70%, #8B5CF6 0%, transparent 45%)',
                        filter: 'blur(70px)'
                    }}>
                </div>
                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.1]"
                    style={{
                        backgroundImage: 'url("https://www.transparenttextures.com/patterns/simple-dashed.png")',
                        backgroundSize: '200px 200px'
                    }}>
                </div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-16 justify-center max-w-6xl mx-auto">
                        <div className="w-full lg:w-1/2 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full mb-6 mx-auto">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-emerald-900 font-bold text-xs">برامج تحفيظ متميزة</span>
                            </div>
                            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black mb-6 text-black leading-tight font-heading">
                                رحلتك مع <span className="text-emerald-600 relative inline-block">
                                    كتاب الله
                                    <svg className="absolute -bottom-2 left-0 w-full h-3 text-emerald-200" viewBox="0 0 100 10" preserveAspectRatio="none">
                                        <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
                                    </svg>
                                </span> تبدأ بخطوة
                            </h2>
                            <p className="text-gray-600 text-[10px] sm:text-xs lg:text-lg leading-relaxed mb-8 max-w-xl mx-auto font-medium">
                                منهجية فريدة تجمع بين أصالة التلقي وتقنيات التعليم الحديثة. نقدم حلقات فردية ومجموعات صغيرة مع نخبة من المقرئين المجازين.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-5">
                                <a
                                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في البدء بحفظ القرآن الكريم في دارين السابعة')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-10 py-4 bg-emerald-600 text-white font-bold text-lg shadow-xl hover:bg-emerald-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group rounded-xl"
                                >
                                    <span>ابدأ الحفظ الآن</span>
                                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                                </a>
                                <Link
                                    to="/courses"
                                    onClick={() => window.scrollTo(0, 0)}
                                    className="px-10 py-4 bg-white text-gray-700 border border-gray-200 font-bold text-lg hover:border-emerald-200 hover:text-emerald-700 hover:bg-emerald-50 transition-all flex items-center justify-center rounded-xl"
                                >
                                    <Sparkles size={20} className="ml-2" />
                                    تصفح المزيد
                                </Link>
                            </div>
                            <div className="items-center justify-center gap-4 inline-flex">
                                <div className="flex -space-x-3 space-x-reverse">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-[#FDFCF8] bg-emerald-100 overflow-hidden shadow-sm">
                                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt={`صورة طالب ${i}`} width="40" height="40" />
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-2 border-[#FDFCF8] bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700 shadow-sm">+5k</div>
                                </div>
                                <div className="h-8 w-px bg-emerald-200/50 mx-2"></div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-black">4.9/5 تقييم ممتاز</div>
                                    <div className="text-xs text-gray-500">من قبل آلاف الطلاب</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 flex justify-center py-6 lg:py-0">
                            <div className="grid grid-cols-2 gap-4 w-full max-w-[400px]">
                                <div className="relative p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group overflow-hidden">
                                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-indigo-600 transition-all duration-500 group-hover:w-full group-hover:h-full group-hover:opacity-10 opacity-30"></div>
                                    <div className="w-12 h-12 bg-gray-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-12 rounded-xl">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-black text-black text-xs mb-1">أوقات مرنة</h3>
                                    <p className="text-[10px] text-gray-500 leading-tight">اختر مواعيدك المفضلة</p>
                                </div>
                                <div className="relative p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group overflow-hidden">
                                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-amber-500 transition-all duration-500 group-hover:w-full group-hover:h-full group-hover:opacity-10 opacity-30"></div>
                                    <div className="w-12 h-12 bg-gray-50 text-amber-600 flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition-all transform group-hover:-rotate-12 rounded-xl">
                                        <ClipboardCheck className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-black text-black text-xs mb-1">متابعة دقيقة</h3>
                                    <p className="text-[10px] text-gray-500 leading-tight">تقارير إنجاز أسبوعية</p>
                                </div>
                                <div className="relative p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group overflow-hidden">
                                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-emerald-600 transition-all duration-500 group-hover:w-full group-hover:h-full group-hover:opacity-10 opacity-30"></div>
                                    <div className="w-12 h-12 bg-gray-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all transform group-hover:scale-110 rounded-xl">
                                        <Mic className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-black text-black text-xs mb-1">معلمون مجازون</h3>
                                    <p className="text-[10px] text-gray-500 leading-tight">نخبة الحفاظ المبدعون</p>
                                </div>
                                <div className="relative p-5 bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-2xl shadow-lg text-white flex flex-col items-center text-center group transition-all overflow-hidden cursor-pointer hover:scale-105">
                                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white transition-all duration-500 group-hover:w-full group-hover:h-full group-hover:opacity-20 opacity-40"></div>
                                    <div className="w-12 h-12 bg-white/20 text-white flex items-center justify-center mb-4 backdrop-blur-sm group-hover:rotate-12 transition-transform rounded-xl">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-black text-white text-xs mb-1">جرب مجاناً</h3>
                                    <p className="text-white/80 text-[10px] leading-tight">حصة تجريبية للمشتركين</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mobile version */}
            <section className="block md:hidden relative overflow-hidden bg-[#F8F9FB] transition-colors duration-500 pt-2 pb-8">
                <LeafDecoration />

                {/* Decorative background blobs */}
                <div className="absolute top-40 -left-20 w-64 h-64 bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-40 -right-20 w-80 h-80 bg-purple-400/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="relative z-10 px-5">
                    {/* Badge */}
                    <div className="flex items-center justify-center mb-5 mt-2">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-emerald-100/80 rounded-full shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-emerald-700 font-bold text-[11px] tracking-wide">برامج حفظ متميزة</span>
                        </div>
                    </div>

                    {/* Hero Title */}
                    <div className="text-center mb-5">
                        <h2 className="text-[26px] leading-[1.2] font-black text-[#1B1B1F] font-heading">
                            رحلتك مع{" "}
                            <span className="text-[#08B26A] relative inline-block">
                                كتاب الله
                                <svg className="absolute -bottom-1.5 left-0 w-full h-3 text-emerald-300" viewBox="0 0 120 12" preserveAspectRatio="none">
                                    <path d="M2 8 Q 30 0 60 8 Q 90 12 118 4" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                                </svg>
                            </span>
                        </h2>
                        <h2 className="text-[26px] leading-[1.2] font-black text-[#1B1B1F] font-heading mt-0.5">
                            تبدأ بخطوة
                        </h2>
                    </div>

                    {/* Description */}
                    <p className="text-[#7D8597] text-sm leading-relaxed text-center max-w-xs mx-auto mb-6 font-medium">
                        منهجية فريدة تجمع بين أصالة التلقي وتقنيات التعليم الحديثة. نقدم حلقات فردية ومجموعات صغيرة مع نخبة من المقرئين المجازين.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col gap-3 items-center mb-7">
                        <a
                            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في البدء بحفظ القرآن الكريم في دارين السابعة')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full max-w-[320px] py-4 bg-gradient-to-r from-[#08B26A] to-[#00A86B] text-white font-black text-base shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group rounded-2xl"
                        >
                            <span>ابدأ الحفظ الآن</span>
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </a>
                        <Link
                            to="/courses"
                            onClick={() => window.scrollTo(0, 0)}
                            className="w-full max-w-[320px] py-3.5 bg-white text-[#08B26A] border border-gray-100 font-bold text-sm hover:border-emerald-200 hover:bg-emerald-50/50 transition-all flex items-center justify-center gap-2 rounded-2xl shadow-sm"
                        >
                            <Sparkles size={16} />
                            تصفح المزيد
                        </Link>
                    </div>

                    {/* Rating + Users */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="text-left">
                            <div className="flex items-center gap-1.5">
                                <span className="text-lg font-black text-[#1B1B1F]">4.9</span>
                                <span className="text-sm font-bold text-[#7D8597]">/5</span>
                                <Star size={14} className="text-amber-400 fill-amber-400" />
                            </div>
                            <div className="text-[11px] text-[#7D8597] font-medium mt-0.5">من قبل آلاف الطلاب</div>
                        </div>
                        <div className="h-10 w-px bg-emerald-200/60"></div>
                        <div className="flex -space-x-2.5 space-x-reverse">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-9 h-9 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm">
                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="" width="36" height="36" className="w-full h-full object-cover" />
                                </div>
                            ))}
                            <div className="w-9 h-9 rounded-full border-2 border-white bg-gradient-to-br from-[#08B26A] to-[#00A86B] flex items-center justify-center text-[10px] font-black text-white shadow-sm">5K+</div>
                        </div>
                    </div>

                    {/* Feature Cards 2x2 */}
                    <div className="grid grid-cols-2 gap-3 mb-8 max-w-[360px] mx-auto">
                        <div className="bg-white border border-gray-100/80 rounded-2xl p-4 shadow-sm flex flex-col items-center text-center">
                            <div className="w-11 h-11 bg-amber-50 rounded-2xl flex items-center justify-center mb-3">
                                <ClipboardCheck size={22} className="text-[#F5A623]" />
                            </div>
                            <h3 className="font-black text-[#1B1B1F] text-[13px] mb-1">متابعة دقيقة</h3>
                            <p className="text-[#7D8597] text-[10px] leading-relaxed">تقارير إنجاز أسبوعية</p>
                        </div>
                        <div className="bg-white border border-gray-100/80 rounded-2xl p-4 shadow-sm flex flex-col items-center text-center">
                            <div className="w-11 h-11 bg-purple-50 rounded-2xl flex items-center justify-center mb-3">
                                <Clock size={22} className="text-[#6C4BFF]" />
                            </div>
                            <h3 className="font-black text-[#1B1B1F] text-[13px] mb-1">أوقات مرنة</h3>
                            <p className="text-[#7D8597] text-[10px] leading-relaxed">اختر مواعيدك المفضلة</p>
                        </div>
                        <div className="bg-gradient-to-br from-[#6C4BFF] to-[#1B1464] border-0 rounded-2xl p-4 shadow-lg shadow-purple-500/20 flex flex-col items-center text-center">
                            <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-sm">
                                <Sparkles size={22} className="text-white" />
                            </div>
                            <h3 className="font-black text-white text-[13px] mb-1">جرب مجانًا</h3>
                            <p className="text-white/80 text-[10px] leading-relaxed">حصة تجريبية للمشتركين</p>
                        </div>
                        <div className="bg-white border border-gray-100/80 rounded-2xl p-4 shadow-sm flex flex-col items-center text-center">
                            <div className="w-11 h-11 bg-emerald-50 rounded-2xl flex items-center justify-center mb-3">
                                <Mic size={22} className="text-[#08B26A]" />
                            </div>
                            <h3 className="font-black text-[#1B1B1F] text-[13px] mb-1">معلمون مجازون</h3>
                            <p className="text-[#7D8597] text-[10px] leading-relaxed">نخبة الحفاظ المبدعين</p>
                        </div>
                    </div>

                </div>
            </section>

        </>
    );
};
