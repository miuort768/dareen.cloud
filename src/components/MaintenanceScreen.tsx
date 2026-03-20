import { useApp } from '../context/AppContext';

export const MaintenanceScreen = () => {
    const { adminPhone } = useApp();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" />

            <div className="relative z-10 max-w-lg w-full">
                {/* Icon */}
                <div className="w-24 h-24 mx-auto mb-8 bg-amber-500/20 flex items-center justify-center border-2 border-amber-500/40">
                    <span className="text-5xl">🛠️</span>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
                    نحن في وضع الصيانة
                </h1>
                <div className="w-16 h-1 bg-amber-500 mx-auto mb-6" />

                {/* Description */}
                <p className="text-gray-400 font-bold text-base leading-relaxed mb-8">
                    نقوم حالياً بتحديث المنصة وإضافة ميزات جديدة لتحسين تجربتك.
                    سنعود قريباً إن شاء الله!
                </p>

                {/* Status badge */}
                <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-2 font-black text-sm mb-8">
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse inline-block" />
                    الموقع سيعود قريباً — يُرجى الانتظار
                </div>

                {/* Contact support */}
                {adminPhone && (
                    <div className="bg-white/5 border border-white/10 p-5">
                        <p className="text-gray-400 text-xs font-bold mb-3 uppercase tracking-widest">للتواصل مع الإدارة</p>
                        <a
                            href={`https://wa.me/${adminPhone.replace(/\D/g, '').replace(/^0/, '20')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 font-black text-sm uppercase tracking-widest active:scale-95 transition-all shadow-lg"
                        >
                            📱 تواصل عبر واتساب
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};
