import { useAdminPhone } from '../context/AppContext';
import { Image } from '../shared/components/ui';

export const MaintenanceScreen = () => {
    const adminPhone = useAdminPhone();

    return (
        <div className="h-dvh w-full bg-background flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-sans" dir="rtl">
            {/* Geometric Accents */}
            <div className="absolute top-0 start-0 w-[500px] h-[500px] bg-primary-soft rotate-45 translate-x-1/2 -translate-y-1/2 border border-primary-soft" />
            <div className="absolute bottom-0 end-0 w-[300px] h-[300px] bg-primary-soft -rotate-12 -translate-x-1/3 translate-y-1/3 border border-primary-soft" />

            <div className="relative z-10 max-w-xl w-full">
                {/* Logo */}
                <div className="mb-10">
                    <div className="w-28 h-28 mx-auto bg-card border border-border rounded-3xl shadow-sm flex items-center justify-center">
                        <Image src="/dareen_logo_new.webp" alt="دارين" className="w-20 h-20" imgClassName="object-contain" />
                    </div>
                </div>

                {/* Title Section */}
                <div className="mb-10">
                    <h1 className="text-2xl md:text-4xl font-bold text-main leading-tight mb-4">
                        المنصة في وضع <br />
                        <span className="text-primary">الصيانة الدورية</span>
                    </h1>
                    <p className="text-muted text-sm md:text-base leading-relaxed max-w-md mx-auto">
                        نحن بصدد إجراء تحديثات جذرية لضمان أفضل تجربة تعليمية.
                        سنكون متاحين خلال وقت قصير جداً.
                    </p>
                </div>

                {/* Progress Indicator */}
                <div className="flex flex-col items-center gap-4 mb-16">
                    <div className="w-full max-w-[280px] h-2 bg-hover rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-primary rounded-full shadow-sm animate-pulse" />
                    </div>
                    <span className="text-xs font-bold text-primary tracking-label animate-pulse">
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
                        className="inline-flex items-center justify-center bg-primary hover:bg-primary-hover text-on-primary px-14 py-4 rounded-full text-sm md:text-base font-bold tracking-widest shadow-sm transition-all transform hover:scale-[1.03] active:scale-95"
                    >
                        تواصل مع الدعم الفني
                    </a>
                </div>
            )}
        </div>
    );
};
