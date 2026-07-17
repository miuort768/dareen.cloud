import { useAdminPhone } from '../context/AppContext';
import { Snowflake } from 'lucide-react';

export const MaintenanceScreen = () => {
    const adminPhone = useAdminPhone();

    return (
        <div className="h-dvh w-full bg-gradient-to-br from-background via-card to-black flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-sans" dir="rtl">
            {/* Geometric Accents */}
            <div className="absolute top-0 start-0 w-[500px] h-[500px] bg-primary/5 rotate-45 translate-x-1/2 -translate-y-1/2 border border-primary/10" />
            <div className="absolute bottom-0 end-0 w-[300px] h-[300px] bg-primary/5 -rotate-12 -translate-x-1/3 translate-y-1/3 border border-primary/10" />

            <div className="relative z-10 max-w-xl w-full">
                {/* Status Icon */}
                <div className="mb-10">
                    <div className="w-24 h-24 mx-auto bg-primary/20 rounded-none flex items-center justify-center border border-primary/30  shadow-sm">
                        <Snowflake size={44} className="text-primary animate-spin-slow" />
                    </div>
                </div>

                {/* Title Section */}
                <div className="mb-12">
                    <h1 className="text-2xl md:text-4xl font-medium text-on-primary leading-tight tracking-tighter uppercase mb-8">
                        المنصة في وضع <br/> 
                        <span className="text-primary underline decoration-4 decoration-[var(--bg-primary)]/20 underline-offset-4">الصيانة الدورية</span>
                    </h1>
                    <p className="text-muted font-normal text-sm md:text-base leading-relaxed max-w-xs mx-auto">
                        نحن بصدد إجراء تحديثات جذرية لضمان أفضل تجربة تعليمية. 
                        سنكون متاحين خلال وقت قصير جداً.
                    </p>
                </div>

                {/* Progress Indicator - Cleaner */}
                <div className="flex flex-col items-center gap-4 mb-16">
                    <div className="w-full max-w-[280px] h-2 bg-white/5 border border-white/10 rounded-full overflow-hidden p-0.5">
                        <div className="h-full w-3/4 bg-primary rounded-full shadow-lg shadow-primary/30" />
                    </div>
                    <span className="text-micro font-medium text-primary uppercase tracking-[0.5em] animate-pulse">
                        العمل جاري الآن
                    </span>
                </div>
            </div>

            {/* Bottom Button Area */}
            {adminPhone && (
                <div className="absolute bottom-12 end-6 start-6 flex flex-col items-center">
                    <a
                        href={`https://wa.me/${adminPhone.replace(/\D/g, '').replace(/^0/, '20')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center bg-card hover:bg-primary text-main hover:text-on-primary px-14 py-5 rounded-full text-sm md:text-base font-medium uppercase tracking-widest shadow-sm transition-all transform hover:scale-[1.05] active:scale-95 border-2 border-border"
                    >
                        تواصل مع الدعم الفني
                    </a>
                </div>
            )}
        </div>
    );
};
