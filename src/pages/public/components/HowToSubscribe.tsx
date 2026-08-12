import { useState, useEffect } from 'react';
import { Zap, Users, Star, Sparkles, ArrowLeft, Wifi, Battery, Signal, Heart, Gift, CreditCard, Clock, Hash } from 'lucide-react';

interface HowToSubscribeProps {
    whatsappNumber: string;
}

export const HowToSubscribe = ({ whatsappNumber }: HowToSubscribeProps) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (d: Date) =>
        d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Africa/Cairo' });

    const steps = [
        {
            num: '01',
            icon: Users,
            title: 'اختر المنهج',
            desc: 'حدد منهجك والمادة',
            boxBg: 'bg-gradient-to-br from-primary to-primary-hover dark:from-primary dark:to-warning',
        },
        {
            num: '02',
            icon: Star,
            title: 'حصة مجانية',
            desc: 'حصة تجريبية مجانية لك',
            boxBg: 'bg-success dark:bg-primary',
        },
        {
            num: '03',
            icon: Sparkles,
            title: 'اشترك الآن',
            desc: 'تواصل لحجز مقعدك',
            boxBg: 'bg-gradient-to-br from-primary to-primary-hover dark:from-primary dark:to-warning',
        },
    ];

    return (
        <section className="relative overflow-hidden bg-surface dark:bg-background rounded-3xl shadow-inner">
            <div className="absolute top-20 -start-20 w-60 h-60 bg-accent/10 dark:bg-primary/[0.08] rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-40 -end-20 w-72 h-72 bg-primary/10 dark:bg-primary/[0.05] rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 px-4 py-6">
                <div className="flex items-center justify-between mb-6 px-1">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-primary dark:text-primary">{formatTime(time)}</span>
                        <span className="text-micro font-bold text-muted dark:text-muted">بتوقيت أم الدنيا</span>
                        <Heart className="w-4 h-4 text-error fill-error" />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Signal size={14} className="text-muted dark:text-muted" />
                        <Wifi size={14} className="text-muted dark:text-muted" />
                        <Battery size={16} className="text-muted dark:text-muted" />
                    </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-l from-primary to-primary-hover dark:from-primary dark:to-warning rounded-full mb-4 shadow-sm">
                    <Zap size={10} className="text-warning dark:text-on-primary fill-warning dark:fill-on-primary" />
                    <span className="text-micro font-black text-on-primary dark:text-on-primary">حصتك المجانية بانتظارك</span>
                </div>

                <h2 className="text-xl font-black text-main dark:text-main leading-tight mb-1">
                    كيف تشترك في <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-primary-hover dark:from-primary dark:to-warning">المعهد؟</span>
                </h2>
                <p className="text-xs text-muted dark:text-muted font-medium mb-5 leading-relaxed">
                    اختر الطريقة التي تناسبك وابدأ رحلتك التعليمية معنا
                </p>

                <div className="grid grid-cols-3 gap-2.5 mb-6">
                    {steps.map((s, i) => (
                        <div key={`step-${i}`} className="bg-card dark:bg-card rounded-2xl border border-border dark:border-primary/30 shadow-sm p-3.5 flex flex-col items-center text-center relative">
                            <div className="absolute -top-2 -start-2 w-5 h-5 rounded-full bg-primary dark:bg-primary flex items-center justify-center shadow-md">
                                <span className="text-micro font-black text-on-primary dark:text-on-primary">{s.num}</span>
                            </div>
                            <div className={`w-10 h-10 rounded-xl ${s.boxBg} flex items-center justify-center mb-2.5 shadow-md`}>
                                <s.icon size={18} className="text-on-primary dark:text-on-primary" />
                            </div>
                            <h3 className="text-xs font-black text-main dark:text-main mb-0.5">{s.title}</h3>
                            <p className="text-micro text-main dark:text-muted font-medium leading-tight">{s.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="md:hidden space-y-3 mb-6 px-1">
                    {[
                        { icon: 'CreditCard', title: 'الدفع وتحصيل الاشتراك', desc: 'بوسائل دفع محلية مناسبة' },
                        { icon: 'Clock', title: 'مواعيد مرنة', desc: 'في الوقت المناسب لك' },
                        { icon: 'Hash', title: 'عدد الحصص', desc: 'بالقدر المناسب لك' },
                    ].map((item, i) => (
                        <div key={`perk-${i}`} className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary-hover dark:from-primary dark:to-warning flex items-center justify-center shadow-sm shrink-0">
                                {item.icon === 'CreditCard' && <CreditCard size={12} className="text-on-primary dark:text-on-primary" />}
                                {item.icon === 'Clock' && <Clock size={12} className="text-on-primary dark:text-on-primary" />}
                                {item.icon === 'Hash' && <Hash size={12} className="text-on-primary dark:text-on-primary" />}
                            </div>
                            <div>
                                <span className="text-xs font-black text-main dark:text-main">{item.title}</span>
                                <p className="text-micro text-muted dark:text-muted">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في حجز حصة تجريبية مجانية')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-gradient-to-l from-primary to-primary-hover dark:from-primary dark:to-warning rounded-2xl shadow-lg dark:shadow-primary/20 hover:brightness-110 hover:-translate-y-0.5 transition-all group"
                >
                    <Gift size={16} className="text-on-primary dark:text-on-primary opacity-90" />
                    <span className="text-on-primary dark:text-on-primary text-sm font-black">احجز حصتك المجانية الآن</span>
                    <div className="w-8 h-8 rounded-full bg-white/20 dark:bg-black/20 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 dark:group-hover:bg-black/30 transition-all">
                        <ArrowLeft size={16} className="text-on-primary dark:text-on-primary" />
                    </div>
                </a>
            </div>
        </section>
    );
};