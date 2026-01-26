import { Hammer, Phone, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MaintenanceScreen = () => {
    const { academyName, adminPhone } = useApp();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 text-center overflow-hidden" dir="rtl">
            <div className="relative max-w-md w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl p-6 md:p-8 space-y-4 animate-in fade-in zoom-in duration-500">
                {/* Minimal Icon */}
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl mx-auto flex items-center justify-center">
                    <Hammer size={20} className="text-amber-600" />
                </div>

                {/* Compact Text */}
                <div className="space-y-1">
                    <h1 className="text-lg md:text-xl font-black text-gray-900 dark:text-white">
                        {academyName}
                    </h1>
                    <p className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full inline-block">
                        المنصة في صيانة مؤقتة
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium pt-2">
                        نعمل على تحسين الخدمة، سنعود للعمل قريباً جداً.
                    </p>
                </div>

                {/* Small Info Row */}
                <div className="flex items-center gap-2 pt-2">
                    <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
                        <Phone size={14} className="text-blue-500 mx-auto mb-1" />
                        <p className="text-[9px] text-gray-400 font-black uppercase">للمساعدة</p>
                        <a
                            href={`https://wa.me/${adminPhone?.startsWith('01') ? '2' + adminPhone : adminPhone}`}
                            className="text-xs font-black text-gray-900 dark:text-white hover:text-primary-600"
                        >
                            {adminPhone?.startsWith('01') ? '+2' + adminPhone : adminPhone}
                        </a>
                    </div>
                    <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
                        <ExternalLink size={14} className="text-emerald-500 mx-auto mb-1" />
                        <p className="text-[9px] text-gray-400 font-black uppercase">الحالة</p>
                        <p className="text-xs font-black text-emerald-600">جاري التحديث</p>
                    </div>
                </div>

                {/* Minimal Footer */}
                <div className="pt-2 opacity-40">
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">&copy; {new Date().getFullYear()} {academyName}</p>
                </div>
            </div>
        </div>
    );
};
