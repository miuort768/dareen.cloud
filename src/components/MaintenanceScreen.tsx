import { useApp } from '../context/AppContext';
import { Snowflake } from 'lucide-react';

export const MaintenanceScreen = () => {
    const { adminPhone } = useApp();

    return (
        <div className="h-dvh w-full bg-gradient-to-br from-[#020617] via-[#0f172a] to-black flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-sans" dir="rtl">
            {/* Geometric Accents */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#5c59f2]/5 rotate-45 translate-x-1/2 -translate-y-1/2 border border-[#5c59f2]/10" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/5 -rotate-12 -translate-x-1/3 translate-y-1/3 border border-indigo-500/10" />

            <div className="relative z-10 max-w-lg w-full">
                {/* Main Card Container */}
                <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-none shadow-none overflow-hidden">
                    
                    {/* Top Accent Bar */}
                    <div className="h-1.5 bg-[#5c59f2] w-full" />

                    <div className="p-8 md:p-12">
                        {/* Status Icon */}
                        <div className="mb-8">
                            <div className="w-20 h-20 mx-auto bg-[#eef2ff] dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center border border-indigo-100 dark:border-indigo-800 shadow-sm">
                                <Snowflake size={36} className="text-[#5c59f2] animate-spin-slow" />
                            </div>
                        </div>

                        {/* Title */}
                        <div className="space-y-3 mb-8">
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter uppercase">
                                المنصة في وضع <br/> 
                                <span className="text-[#5c59f2]">الصيانة الدورية</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 font-bold text-[13px] md:text-sm leading-relaxed max-w-xs mx-auto">
                                نحن بصدد تحديث النظام وتطوير البنية التحتية لتقديم خدمة أفضل.
                            </p>
                        </div>

                        {/* Progress Bar - Settings Style */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mb-8">
                            <div className="flex justify-between items-center mb-2 px-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Update</span>
                                <span className="text-[10px] font-black text-[#5c59f2] uppercase tracking-widest">75% Complete</span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-[#5c59f2] animate-pulse" style={{ width: '75%' }} />
                            </div>
                        </div>

                        {/* WhatsApp Button - Settings Button Style */}
                        {adminPhone && (
                            <a
                                href={`https://wa.me/${adminPhone.replace(/\D/g, '').replace(/^0/, '20')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-3 bg-[#5c59f2] hover:bg-indigo-700 text-white px-6 py-4 rounded-xl text-[13px] font-black uppercase tracking-tight shadow-md transition-all transform hover:scale-[1.02] active:scale-95"
                            >
                                📱 تواصل مع الدعم الفني
                            </a>
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">© 2024 Dareen Academy</span>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Server v2.4.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
