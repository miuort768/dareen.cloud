import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, ClipboardCheck, Mic, Zap } from 'lucide-react';

interface QuranSectionProps {
    whatsappNumber: string;
}

export const QuranSection = ({ whatsappNumber }: QuranSectionProps) => {
    return (
        <section className="pt-6 pb-6 relative overflow-hidden bg-[rgb(var(--bg-surface))] transition-colors duration-500">
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
                            <span className="text-emerald-900 font-bold text-xs ">برامج تحفيظ متميزة</span>
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
                                className="px-10 py-4 bg-emerald-600 text-white font-bold text-lg shadow-xl hover:bg-emerald-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
                            >
                                <span>ابدأ الحفظ الآن</span>
                                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            </a>
                            <Link
                                to="/courses"
                                onClick={() => window.scrollTo(0, 0)}
                                className="px-10 py-4 bg-white text-gray-700 border border-gray-200 font-bold text-lg hover:border-emerald-200 hover:text-emerald-700 hover:bg-emerald-50 transition-all flex items-center justify-center"
                            >
                                تصفح المزيد
                            </Link>
                        </div>
                        <div className="items-center justify-center gap-4 inline-flex">
                            <div className="flex -space-x-3 space-x-reverse">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#FDFCF8] bg-emerald-100 overflow-hidden shadow-sm">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Student" />
                                    </div>
                                ))}
                                <div className="w-10 h-10 rounded-full border-2 border-[#FDFCF8] bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm">+5k</div>
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
                            <div className="relative p-5 bg-white border border-gray-100 rounded-none shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group overflow-hidden">
                                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-indigo-600 transition-all duration-500 group-hover:w-full group-hover:h-full group-hover:opacity-10 opacity-30"></div>
                                <div className="w-12 h-12 bg-gray-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-12">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <h3 className="font-black text-black text-xs mb-1">أوقات مرنة</h3>
                                <p className="text-[10px] text-gray-500 leading-tight">اختر مواعيدك المفضلة</p>
                            </div>
                            <div className="relative p-5 bg-white border border-gray-100 rounded-none shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group overflow-hidden">
                                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-amber-500 transition-all duration-500 group-hover:w-full group-hover:h-full group-hover:opacity-10 opacity-30"></div>
                                <div className="w-12 h-12 bg-gray-50 text-amber-600 flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition-all transform group-hover:-rotate-12">
                                    <ClipboardCheck className="w-6 h-6" />
                                </div>
                                <h3 className="font-black text-black text-xs mb-1">متابعة دقيقة</h3>
                                <p className="text-[10px] text-gray-500 leading-tight">تقارير إنجاز أسبوعية</p>
                            </div>
                            <div className="relative p-5 bg-white border border-gray-100 rounded-none shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group overflow-hidden">
                                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-emerald-600 transition-all duration-500 group-hover:w-full group-hover:h-full group-hover:opacity-10 opacity-30"></div>
                                <div className="w-12 h-12 bg-gray-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all transform group-hover:scale-110">
                                    <Mic className="w-6 h-6" />
                                </div>
                                <h3 className="font-black text-black text-xs mb-1">معلمون مجازون</h3>
                                <p className="text-[10px] text-gray-500 leading-tight">نخبة الحفاظ المبدعون</p>
                            </div>
                            <div className="relative p-5 bg-gradient-to-br from-indigo-600 to-indigo-900 border border-transparent rounded-none shadow-lg text-white flex flex-col items-center text-center group transition-all overflow-hidden cursor-pointer hover:scale-105">
                                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white transition-all duration-500 group-hover:w-full group-hover:h-full group-hover:opacity-20 opacity-40"></div>
                                <div className="w-12 h-12 bg-white/20 text-white flex items-center justify-center mb-4 backdrop-blur-sm group-hover:rotate-12 transition-transform">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <h3 className="font-black text-white text-xs mb-1">جرب مجاناً</h3>
                                <p className="text-white/80 text-[10px] leading-tight">حصة تجريبية للمشتركين</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
