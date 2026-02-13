import { Hammer, AlertTriangle, Phone, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MaintenanceScreen = () => {
    const { academyName, adminPhone } = useApp();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4 md:p-6 text-center overflow-y-auto no-scrollbar" dir="rtl">
            {/* Background Decorative Blobs */}
            <div className="fixed top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="fixed bottom-0 left-0 w-64 md:w-96 h-64 md:h-96 bg-amber-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="relative max-w-2xl w-full space-y-6 md:space-y-8 animate-in fade-in zoom-in duration-700 py-8">
                {/* Icon Container */}
                <div className="relative mx-auto w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
                    <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping"></div>
                    <div className="relative w-20 h-20 md:w-24 md:h-24 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-2xl md:rounded-3xl rotate-12 flex items-center justify-center shadow-xl">
                        <Hammer size={32} className="text-white md:size-[40px] -rotate-12" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-white dark:bg-gray-900 p-1.5 md:p-2 rounded-full shadow-lg border border-gray-100 dark:border-gray-800">
                        <AlertTriangle size={18} className="text-amber-500 md:size-[24px]" />
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-3 md:space-y-4 px-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider">
                        وضع الصيانة قيد التنفيذ
                    </div>
                    <h1 className="text-2xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
                        {academyName}
                    </h1>
                    <p className="text-[13px] md:text-base text-gray-500 dark:text-gray-400 font-bold leading-relaxed max-w-lg mx-auto">
                        تخضع المنصة حالياً لأعمال تحديث وتطوير شاملة لضمان تقديم أفضل تجربة تعليمية ممكنة. سنعود للعمل بكامل طاقتنا خلال وقت وجيز.
                    </p>
                </div>

                {/* Stats/Status Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 pt-2 md:pt-4 px-2">
                    <div className="bg-white dark:bg-gray-900 p-4 md:p-6 border border-gray-200 dark:border-gray-800 flex flex-col items-center gap-2 md:gap-3 rounded-none">
                        <div className="p-2 md:p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl md:rounded-2xl">
                            <Phone size={20} className="md:size-[24px]" />
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold">للتواصل العاجل</p>
                        <a
                            href={`https://wa.me/${adminPhone?.startsWith('01') ? '2' + adminPhone : adminPhone}`}
                            className="text-base md:text-lg font-black text-gray-900 dark:text-white hover:text-primary-600 transition-colors truncate w-full"
                        >
                            {adminPhone?.startsWith('01') ? '+2' + adminPhone : adminPhone}
                        </a>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-4 md:p-6 border border-gray-200 dark:border-gray-800 flex flex-col items-center gap-2 md:gap-3 rounded-none">
                        <div className="p-2 md:p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl md:rounded-2xl">
                            <ExternalLink size={20} className="md:size-[24px]" />
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold">الحالة الفنية</p>
                        <p className="text-base md:text-lg font-black text-emerald-500">جاري التحديث...</p>
                    </div>
                </div>

                {/* Emergency Bypass for Owner (Hidden-ish) */}
                <div className="pt-4">
                    <a
                        href="/login-q8"
                        className="text-[10px] text-gray-400 hover:text-primary-500 underline transition-colors"
                    >
                        دخول الإدارة (للمخولين فقط)
                    </a>
                </div>

                {/* Footer */}
                <div className="flex flex-col items-center gap-2 pt-2 md:pt-4 opacity-40">
                    <div className="w-8 md:w-10 h-0.5 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                    <p className="text-[9px] md:text-[11px] font-black text-gray-500 uppercase tracking-widest">الإدارة التقنية لمنصة {academyName} &copy; {new Date().getFullYear()}</p>
                </div>
            </div>
        </div>
    );
};
