import { useApp } from '../context/AppContext';
import { Snowflake } from 'lucide-react';

export const MaintenanceScreen = () => {
    const { adminPhone } = useApp();

    return (
        <div className="h-dvh w-full bg-[#020617] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-sans" dir="rtl">
            {/* Geometric Accents */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rotate-45 translate-x-1/2 -translate-y-1/2 border border-amber-500/10" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary-500/5 -rotate-12 -translate-x-1/3 translate-y-1/3 border border-primary-500/10" />

            <div className="relative z-10 max-w-xl w-full">
                {/* Branding Tag */}
                <div className="mb-12 inline-block bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 px-4 py-2 shadow-[4px_4px_0px_#e2e8f0] dark:shadow-[4px_4px_0px_#1e293b]">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Academy Management System</p>
                </div>

                {/* Main Visual */}
                <div className="relative mb-10 group">
                    <div className="w-24 h-24 mx-auto bg-amber-500 flex items-center justify-center border-4 border-black dark:border-white shadow-[8px_8px_0px_#b45309] transform -rotate-3 group-hover:rotate-0 transition-transform">
                        <Snowflake size={40} className="text-white animate-spin-slow" />
                    </div>
                </div>

                {/* Title Section */}
                <div className="space-y-4 mb-10">
                    <h1 className="text-4xl md:text-6xl font-black text-white leading-none tracking-tighter uppercase">
                        المنصة في وضع <br/> 
                        <span className="text-amber-500 underline decoration-8 decoration-amber-500/30 underline-offset-8">الصيانة</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-sm md:text-base leading-relaxed max-w-md mx-auto">
                        نقوم حالياً بإجراء تحديثات جذرية لضمان أفضل تجربة تعليمية. 
                        سنكون متاحين خلال وقت قصير جداً.
                    </p>
                </div>

                {/* Progress Indicator */}
                <div className="flex flex-col items-center gap-4 mb-12">
                    <div className="w-full max-w-xs h-3 bg-slate-900 border border-slate-800 overflow-hidden p-0.5">
                        <div className="h-full bg-amber-500 animate-loading-bar" style={{ width: '60%' }} />
                    </div>
                    <span className="text-[11px] font-black text-amber-500 uppercase tracking-widest animate-pulse">
                        العمل جاري الآن — انتظرونا
                    </span>
                </div>

                {/* Contact Footer */}
                {adminPhone && (
                    <div className="pt-8 border-t border-slate-800/50">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">للحالات الطارئة تواصل معنا</p>
                        <a
                            href={`https://wa.me/${adminPhone.replace(/\D/g, '').replace(/^0/, '20')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 font-black text-xs uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all shadow-[6px_6px_0px_#1e293b] active:translate-y-1 active:shadow-none"
                        >
                            📱 تواصل واتساب الآن
                        </a>
                    </div>
                )}
            </div>

            {/* Bottom Bar */}
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center opacity-30">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">© 2024 Dareen Academy</span>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">v2.4.0 Stable</span>
            </div>
        </div>
    );
};
