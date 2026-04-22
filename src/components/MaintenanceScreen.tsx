import { useApp } from '../context/AppContext';
import { Snowflake } from 'lucide-react';

export const MaintenanceScreen = () => {
    const { adminPhone } = useApp();

    return (
        <div className="h-dvh w-full bg-gradient-to-br from-[#020617] via-[#0f172a] to-black flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-sans" dir="rtl">
            {/* Geometric Accents */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#5c59f2]/5 rotate-45 translate-x-1/2 -translate-y-1/2 border border-[#5c59f2]/10" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/5 -rotate-12 -translate-x-1/3 translate-y-1/3 border border-indigo-500/10" />

            <div className="relative z-10 max-w-xl w-full">
                {/* Status Icon */}
                <div className="mb-10">
                    <div className="w-24 h-24 mx-auto bg-[#5c59f2]/20 rounded-3xl flex items-center justify-center border border-[#5c59f2]/30 backdrop-blur-sm shadow-xl">
                        <Snowflake size={44} className="text-[#5c59f2] animate-spin-slow" />
                    </div>
                </div>

                {/* Title */}
                <div className="space-y-3 mb-10">
                    <h1 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tighter uppercase">
                        المنصة في وضع <br/> 
                        <span className="text-[#5c59f2] underline decoration-4 decoration-[#5c59f2]/20 underline-offset-4">الصيانة الدورية</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-xs md:text-sm leading-relaxed max-w-xs mx-auto">
                        نحن بصدد إجراء تحديثات جذرية لضمان أفضل تجربة تعليمية. 
                        سنكون متاحين خلال وقت قصير جداً.
                    </p>
                </div>

                {/* Progress Indicator - High Contrast */}
                <div className="flex flex-col items-center gap-4 mb-12">
                    <div className="w-full max-w-[240px] h-2 bg-white/5 border border-white/10 rounded-full overflow-hidden p-0.5">
                        <div className="h-full bg-[#5c59f2] rounded-full shadow-[0_0_10px_rgba(92,89,242,0.4)]" style={{ width: '75%' }} />
                    </div>
                    <span className="text-[9px] font-black text-[#5c59f2] uppercase tracking-[0.4em] animate-pulse">
                        System Update — 75%
                    </span>
                </div>

                {/* WhatsApp Button - Premium Sleek Style */}
                {adminPhone && (
                    <div className="flex flex-col items-center gap-6">
                        <a
                            href={`https://wa.me/${adminPhone.replace(/\D/g, '').replace(/^0/, '20')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center bg-white hover:bg-[#5c59f2] text-[#020617] hover:text-white px-12 py-4 rounded-full text-[12px] font-black uppercase tracking-widest shadow-xl transition-all transform hover:scale-[1.05] active:scale-95 border-2 border-white"
                        >
                            تواصل مع الدعم الفني
                        </a>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Urgent Matters Only</p>
                    </div>
                )}
            </div>
        </div>
    );
};
