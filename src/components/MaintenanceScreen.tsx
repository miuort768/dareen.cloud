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
                <div className="space-y-4 mb-10">
                    <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter uppercase">
                        المنصة في وضع <br/> 
                        <span className="text-[#5c59f2] underline decoration-8 decoration-[#5c59f2]/20 underline-offset-8">الصيانة الدورية</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-sm md:text-base leading-relaxed max-w-md mx-auto">
                        نحن بصدد إجراء تحديثات جذرية لضمان أفضل تجربة تعليمية. 
                        سنكون متاحين خلال وقت قصير جداً.
                    </p>
                </div>

                {/* Progress Indicator - High Contrast */}
                <div className="flex flex-col items-center gap-4 mb-12">
                    <div className="w-full max-w-xs h-3 bg-white/5 border border-white/10 rounded-full overflow-hidden p-0.5">
                        <div className="h-full bg-[#5c59f2] rounded-full shadow-[0_0_15px_rgba(92,89,242,0.5)]" style={{ width: '75%' }} />
                    </div>
                    <span className="text-[11px] font-black text-[#5c59f2] uppercase tracking-[0.3em] animate-pulse">
                        System Update In Progress — 75%
                    </span>
                </div>

                {/* WhatsApp Button - Settings Button Style (High Contrast) */}
                {adminPhone && (
                    <div className="flex flex-col items-center gap-6">
                        <a
                            href={`https://wa.me/${adminPhone.replace(/\D/g, '').replace(/^0/, '20')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-4 bg-white text-[#020617] px-10 py-5 rounded-2xl text-[14px] font-black uppercase tracking-tight shadow-2xl transition-all transform hover:scale-[1.05] active:scale-95 hover:bg-[#5c59f2] hover:text-white"
                        >
                            📱 تواصل مع الدعم الفني الآن
                        </a>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Available 24/7 for urgent matters</p>
                    </div>
                )}
            </div>
        </div>
    );
};
