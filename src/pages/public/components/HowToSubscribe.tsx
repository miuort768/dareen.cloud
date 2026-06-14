import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Users, Star, Sparkles, ArrowLeft, Wifi, Battery, Signal, Heart, Gift, CreditCard, Clock, Hash } from 'lucide-react';
import { useSettingsStore } from '../../../store/settingsStore';

export const HowToSubscribe = () => {
    const { adminPhone } = useSettingsStore();
    const whatsappNumber = adminPhone.replace(/\D/g, '');
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
            title: 'اختر الخدمة',
            desc: 'حدد النظام التعليمي',
            boxBg: 'bg-gradient-to-br from-[#1B1464] to-[#2D1B8E]',
            boxShadow: 'shadow-indigo-900/20',
        },
        {
            num: '02',
            icon: Star,
            title: 'حصة مجانية',
            desc: 'استمتع بالتجريب أولاً',
            boxBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
            boxShadow: 'shadow-emerald-500/20',
        },
        {
            num: '03',
            icon: Sparkles,
            title: 'اشترك الآن',
            desc: 'تواصل لحجز مقعدك',
            boxBg: 'bg-gradient-to-br from-[#6C4BFF] to-[#4A2DDB]',
            boxShadow: 'shadow-purple-500/20',
        },
    ];

    return (
        <section className="relative overflow-hidden bg-[#F8F9FC] dark:bg-slate-900 rounded-3xl shadow-inner dark:shadow-slate-800/50">
            {/* Soft glow background */}
            <div className="absolute top-20 -right-20 w-60 h-60 bg-purple-300/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-40 -left-20 w-72 h-72 bg-indigo-300/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 px-4 py-6">
                {/* Status Bar */}
                <div className="flex items-center justify-between mb-6 px-1">
                    <div className="flex items-center gap-3">
                        <span className="text-[13px] font-black text-indigo-600 dark:text-indigo-400">{formatTime(time)}</span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">بتوقيت أم الدنيا</span>
                        <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Signal size={14} className="text-slate-700 dark:text-slate-300" />
                        <Wifi size={14} className="text-slate-700 dark:text-slate-300" />
                        <Battery size={16} className="text-slate-700 dark:text-slate-300" />
                    </div>
                </div>

                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-l from-[#1B1464] to-[#2D1B8E] rounded-full mb-4 shadow-lg shadow-indigo-900/20">
                    <Zap size={10} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-[9px] font-black text-white">ابدأ رحلتك</span>
                </div>

                {/* Title */}
                <h2 className="text-[22px] font-black text-slate-900 dark:text-white leading-tight mb-1">
                    كيف تشترك في <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#6C4BFF] to-[#4A2DDB]">المعهد؟</span>
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-5 leading-relaxed">
                    اختر الطريقة التي تناسبك وابدأ رحلتك التعليمية معنا
                </p>

                {/* Steps Cards */}
                <div className="grid grid-cols-3 gap-2.5 mb-6">
                    {steps.map((s, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-3.5 flex flex-col items-center text-center relative">
                            {/* Number Badge */}
                            <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-800 dark:bg-slate-600 flex items-center justify-center shadow-md">
                                <span className="text-[7px] font-black text-white">{s.num}</span>
                            </div>
                            {/* Icon Box */}
                            <div className={`w-10 h-10 rounded-xl ${s.boxBg} flex items-center justify-center mb-2.5 shadow-md ${s.boxShadow}`}>
                                <s.icon size={18} className="text-white" />
                            </div>
                            {/* Title */}
                            <h3 className="text-[11px] font-black text-slate-900 dark:text-white mb-0.5">{s.title}</h3>
                            {/* Desc */}
                            <p className="text-[7px] text-slate-400 dark:text-slate-500 font-medium leading-tight">{s.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Mobile perks list under cards */}
                <div className="md:hidden space-y-3 mb-6 px-1">
                    {[
                        { icon: 'CreditCard', title: 'الدفع', desc: 'بوسائل دفع محلية مناسبة' },
                        { icon: 'Clock', title: 'مواعيد مرنة', desc: 'في الوقت المناسب لك' },
                        { icon: 'Hash', title: 'عدد الحصص', desc: 'بالقدر المناسب لك' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#1B1464] to-[#2D1B8E] flex items-center justify-center shadow-sm shrink-0">
                                {item.icon === 'CreditCard' && <CreditCard size={12} className="text-white" />}
                                {item.icon === 'Clock' && <Clock size={12} className="text-white" />}
                                {item.icon === 'Hash' && <Hash size={12} className="text-white" />}
                            </div>
                            <div>
                                <span className="text-[11px] font-black text-slate-900 dark:text-white">{item.title}</span>
                                <p className="text-[9px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Button */}
                <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في حجز حصة تجريبية مجانية')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-gradient-to-l from-[#6C4BFF] to-indigo-700 rounded-2xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all group"
                >
                    <Gift size={16} className="text-white/90" />
                    <span className="text-white text-[13px] font-black">احجز حصتك المجانية الآن</span>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all">
                        <ArrowLeft size={16} className="text-white" />
                    </div>
                </a>
            </div>
        </section>
    );
};
