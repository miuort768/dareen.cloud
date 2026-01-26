import { Hammer, AlertTriangle, Phone, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MaintenanceScreen = () => {
    const { academyName, adminPhone } = useApp();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4 md:p-8 lg:p-12 text-center overflow-y-auto no-scrollbar relative" dir="rtl">
            {/* Background Decorative Elements - Desktop & Tablet Optimized */}
            <div className="fixed top-0 right-0 w-64 md:w-[600px] h-64 md:h-[600px] bg-primary-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0"></div>
            <div className="fixed bottom-0 left-0 w-64 md:w-[700px] h-64 md:h-[700px] bg-amber-500/5 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0"></div>

            {/* Geometric Shapes for Desktop */}
            <div className="fixed top-20 left-20 w-32 h-32 border border-primary-500/10 rounded-full hidden lg:block animate-pulse pointer-events-none"></div>
            <div className="fixed bottom-20 right-20 w-48 h-48 border border-amber-500/10 rounded-3xl rotate-45 hidden lg:block animate-bounce-slow pointer-events-none"></div>

            <div className="relative max-w-2xl lg:max-w-4xl w-full space-y-8 md:space-y-12 animate-in fade-in zoom-in duration-1000 py-12 z-10">
                {/* Icon Container - Larger on PC */}
                <div className="relative mx-auto w-24 md:w-40 h-24 md:h-40 flex items-center justify-center">
                    <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping duration-[3s]"></div>
                    <div className="absolute inset-4 bg-amber-500/10 rounded-full animate-pulse duration-[2s]"></div>
                    <div className="relative w-20 h-20 md:w-32 md:h-32 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-2xl md:rounded-[40px] rotate-12 flex items-center justify-center shadow-2xl transition-transform hover:rotate-0 duration-500">
                        <Hammer size={32} className="text-white md:size-[60px] -rotate-12 transition-transform hover:rotate-0" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-white dark:bg-gray-900 p-1.5 md:p-3 rounded-full shadow-2xl border border-gray-100 dark:border-gray-800">
                        <AlertTriangle size={18} className="text-amber-500 md:size-[32px]" />
                    </div>
                </div>

                {/* Text Content - Responsive Typography */}
                <div className="space-y-4 md:space-y-6 px-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-[10px] md:text-sm font-black uppercase tracking-widest border border-amber-200/50 dark:border-amber-800/50">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                        وضع الصيانة قيد التنفيذ
                    </div>
                    <h1 className="text-3xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tight">
                        {academyName}
                    </h1>
                    <p className="text-base md:text-2xl text-gray-600 dark:text-gray-400 font-bold leading-relaxed max-w-2xl mx-auto">
                        نعمل حالياً على تطوير وتحديث المنصة لنقدم لكم تجربة تعليمية أكثر ذكاءً وسرعة. شكراً لصبركم.
                    </p>
                </div>

                {/* Info Cards Grid - Split on Tablet/PC */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-6 md:pt-10 px-4">
                    <div className="group bg-white dark:bg-gray-900 p-6 md:p-10 border border-gray-200 dark:border-gray-800 flex flex-col items-center gap-4 md:gap-6 rounded-[2rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                        <div className="p-4 md:p-5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 group-hover:scale-110 transition-transform rounded-3xl">
                            <Phone size={24} className="md:size-[36px]" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs md:text-sm text-gray-400 font-black uppercase tracking-tighter">للتواصل المباشر</p>
                            <a
                                href={`https://wa.me/${adminPhone?.startsWith('01') ? '2' + adminPhone : adminPhone}`}
                                className="text-xl md:text-3xl font-black text-gray-900 dark:text-white hover:text-primary-600 transition-colors block"
                            >
                                {adminPhone?.startsWith('01') ? '+2' + adminPhone : adminPhone}
                            </a>
                        </div>
                    </div>
                    <div className="group bg-white dark:bg-gray-900 p-6 md:p-10 border border-gray-200 dark:border-gray-800 flex flex-col items-center gap-4 md:gap-6 rounded-[2rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                        <div className="p-4 md:p-5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 group-hover:scale-110 transition-transform rounded-3xl">
                            <ExternalLink size={24} className="md:size-[36px]" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs md:text-sm text-gray-400 font-black uppercase tracking-tighter">الحالة الفنية للخدمة</p>
                            <p className="text-xl md:text-3xl font-black text-emerald-500 flex items-center gap-2">
                                <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                                جاري التحديث...
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="flex flex-col items-center gap-4 md:gap-6 pt-10 md:pt-16 opacity-60">
                    <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent rounded-full"></div>
                    <div className="flex flex-col gap-1">
                        <p className="text-xs md:text-base font-black text-gray-500">المركز التقني | {academyName}</p>
                        <p className="text-[10px] md:text-xs font-bold text-gray-400">كافة الحقوق محفوظة &copy; {new Date().getFullYear()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
