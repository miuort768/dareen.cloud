import { Hammer, AlertTriangle, Phone, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MaintenanceScreen = () => {
    const { academyName, adminPhone } = useApp();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
            {/* Background Decorative Blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative max-w-2xl w-full space-y-8 animate-in fade-in zoom-in duration-700">
                {/* Icon Container */}
                <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                    <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-3xl rotate-12 flex items-center justify-center shadow-xl">
                        <Hammer size={40} className="text-white -rotate-12" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-900 p-2 rounded-full shadow-lg border border-gray-100 dark:border-gray-800">
                        <AlertTriangle size={24} className="text-amber-500" />
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-black uppercase tracking-wider">
                        وضع الصيانة قيد التنفيذ
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
                        {academyName}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-bold leading-relaxed max-w-xl mx-auto">
                        نعمل حالياً على تحسين المنصة لتقديم تجربة أفضل لكم. يرجى العودة لاحقاً.
                    </p>
                </div>

                {/* Stats/Status Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
                    <div className="bg-white dark:bg-gray-900 p-6 border border-gray-200 dark:border-gray-800 flex flex-col items-center gap-3">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl">
                            <Phone size={24} />
                        </div>
                        <p className="text-xs text-gray-400 font-bold">للتواصل العاجل</p>
                        <a
                            href={`https://wa.me/${adminPhone}`}
                            className="text-lg font-black text-gray-900 dark:text-white hover:text-primary-600 transition-colors"
                        >
                            {adminPhone}
                        </a>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-6 border border-gray-200 dark:border-gray-800 flex flex-col items-center gap-3">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl">
                            <ExternalLink size={24} />
                        </div>
                        <p className="text-xs text-gray-400 font-bold">الحالة الفنية</p>
                        <p className="text-lg font-black text-emerald-500">جاري التحديث...</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col items-center gap-4 pt-8 opacity-50">
                    <div className="w-12 h-1 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                    <p className="text-xs font-bold text-gray-500">مركز التقني لمعهد {academyName} &copy; {new Date().getFullYear()}</p>
                </div>
            </div>
        </div>
    );
};
