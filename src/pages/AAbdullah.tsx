import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code, Target, Heart, MessageSquare, Send, Award, Star, Sparkles, Rocket, Zap, GraduationCap } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import { MobileHeader } from '../components/public/MobileHeader';
import { PublicFooter } from '../components/public/PublicFooter';

export const AAbdullah = () => {
    const { adminPhone, telegramHandle } = useSettingsStore();

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (e.button === 2) {
                e.preventDefault();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const tgHandle = typeof telegramHandle === 'string' ? telegramHandle : '';

    const values = [
        { icon: Award, title: 'الجودة', desc: 'نقدم الأفضل دايماً', color: '#052C63' },
        { icon: Sparkles, title: 'المتعة', desc: 'التعليم مو ممل', color: '#0A6356' },
        { icon: Star, title: 'الفائدة', desc: 'كل دقيقة تفرق', color: '#AD8C2D' },
        { icon: Code, title: 'الابتكار', desc: 'إبداعنا ما له حدود', color: '#61969D' },
        { icon: Heart, title: 'خدمة عملائنا', desc: 'هم أساس كل شي', color: '#0A6356' },
        { icon: Target, title: 'التميز', desc: 'نسعى للأفضل دايماً', color: '#052C63' },
    ];

    const cardClass = 'bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200/60 space-y-4';
    const sectionDelay = (i: number) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.1 } });

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#F5F7FA' }} dir="rtl">
            <style>{`@media print { body { display: none !important; } }`}</style>
            <MobileHeader />

            <div className="max-w-4xl mx-auto px-4 pt-4 md:pt-36 pb-4 space-y-6">

                {/* ═══════════════ HERO ═══════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row items-center md:items-start gap-4"
                >
                    <div
                        className="hidden md:flex w-16 h-16 shrink-0 rounded-2xl items-center justify-center shadow-xl"
                        style={{ backgroundColor: '#052C63', boxShadow: '0 10px 30px -5px rgba(5,44,99,0.3)' }}
                    >
                        <Code size={28} color="#FFFFFF" />
                    </div>
                    <div className="text-center md:text-start">
                        <h1 className="text-2xl md:text-3xl font-black inline-flex items-center gap-2" style={{ color: '#052C63' }}>
                            <span
                                className="md:hidden w-8 h-8 rounded-lg inline-flex items-center justify-center"
                                style={{ backgroundColor: '#052C63' }}
                            >
                                <Code size={16} color="#FFFFFF" />
                            </span>
                            مستر احمد عبدالله
                        </h1>
                        <p className="text-xs md:text-base font-bold mt-1" style={{ color: '#0A6356' }}>
                            مؤسس منصة دارين السابعة
                        </p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto md:ms-auto justify-center md:justify-end">
                        <a
                            href={`https://wa.me/${adminPhone?.replace(/\D/g, '') || '965000000000'}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 md:gap-3 text-white px-5 md:px-8 py-2.5 md:py-3.5 text-sm md:text-lg font-bold shadow-lg active:scale-95 transition-all rounded-full"
                            style={{ backgroundColor: '#0A6356' }}
                        >
                            <MessageSquare size={16} />
                            واتساب
                        </a>
                        <a
                            href={tgHandle.startsWith('http') ? tgHandle : `https://t.me/${tgHandle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 md:gap-3 text-white px-5 md:px-8 py-2.5 md:py-3.5 text-sm md:text-lg font-bold shadow-lg active:scale-95 transition-all rounded-full"
                            style={{ backgroundColor: '#61969D' }}
                        >
                            <Send size={16} />
                            تيليجرام
                        </a>
                    </div>
                </motion.div>

                {/* ═══════════════ نبدة تعريفية ═══════════════ */}
                <motion.div {...sectionDelay(1)} className={cardClass}>
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black" style={{ color: '#052C63' }}>
                            نبدة تعريفية
                        </h2>
                        <Rocket size={18} color="#0A6356" className="inline" />
                        <Zap size={16} color="#AD8C2D" className="inline" />
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>
                        خريج كلية التربية — جامعة الأزهر. مدرس عشق البرمجة،
                        ومؤمن إن التكنولوجيا هي المفتاح لتطوير التعليم العربي
                        وتخليه أكثر متعة وفايدة.
                    </p>
                </motion.div>

                {/* ═══════════════ الرؤية ═══════════════ */}
                <motion.div
                    {...sectionDelay(2)}
                    className="rounded-3xl p-6 md:p-8 shadow-xl text-white relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, #052C63 0%, #06153A 100%)',
                        boxShadow: '0 10px 40px -5px rgba(5,44,99,0.4)',
                    }}
                >
                    <div className="absolute top-[-30px] left-[-30px] w-32 h-32 rounded-full" style={{ backgroundColor: 'rgba(173,140,45,0.12)' }} />
                    <div className="absolute bottom-[-20px] right-[30%] w-24 h-24 rounded-full" style={{ backgroundColor: 'rgba(173,140,45,0.08)' }} />
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm"
                                style={{ backgroundColor: 'rgba(173,140,45,0.2)' }}
                            >
                                <Target size={20} color="#AD8C2D" />
                            </div>
                            <h2 className="text-lg font-black" style={{ color: '#AD8C2D' }}>الرؤية</h2>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)' }}>
                            "دارين السابعة مو مجرد منصة، هي أداة تساعد الطلاب وأولياء الأمور.
                            {' '}هدفنا إنا نصير أكبر منصة تعليمية عربية نقدم محتوى مفيد وممتع،
                            {' '}وتساعد في بناء جيل واعي ومتعلم."
                        </p>
                    </div>
                </motion.div>

                {/* ═══════════════ القيم ═══════════════ */}
                <motion.div {...sectionDelay(3)} className="space-y-4">
                    <h2 className="text-xl font-black" style={{ color: '#052C63' }}>القيم</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {values.map((v, i) => {
                            const Icon = v.icon;
                            return (
                                <div
                                    key={i}
                                    className="bg-white rounded-2xl p-4 shadow-sm text-center space-y-2"
                                    style={{ borderColor: 'rgba(0,0,0,0.06)', borderWidth: 1 }}
                                >
                                    <div
                                        className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: v.color }}
                                    >
                                        <Icon size={18} color="#FFFFFF" />
                                    </div>
                                    <h3 className="text-sm font-bold" style={{ color: '#06153A' }}>{v.title}</h3>
                                    <p className="text-xs" style={{ color: '#6B7280' }}>{v.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* ═══════════════ رسالة إلى أولياء الأمور والمعلمين ═══════════════ */}
                <motion.div
                    {...sectionDelay(4)}
                    className="bg-white rounded-3xl p-6 md:p-8 shadow-sm space-y-4"
                    style={{ borderRight: '4px solid #AD8C2D' }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(173,140,45,0.15)' }}
                        >
                            <Heart size={20} color="#AD8C2D" />
                        </div>
                        <h2 className="text-lg font-black" style={{ color: '#052C63' }}>رسالة إلى أولياء الأمور والمعلمين</h2>
                    </div>
                    <div className="space-y-3" style={{ paddingInlineStart: '1rem' }}>
                        <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>
                            "الإتقان أساس النجاح والتطوير.
                        </p>
                        <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>
                            الإنسان لازم يبدي بأفضل ما عنده،
                            {' '}مع التوكل على الله أول وأخير،
                            {' '}ويلتزم بالأخلاق في كل خطوة.
                        </p>
                        <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>
                            لأن النجاح الحقيقي مو بس في النتيجة،
                            {' '}لكن في الطريق والأخلاق اللي نمشي فيها."
                        </p>
                    </div>
                </motion.div>

                {/* ═══════════════ رسالتي لكم ═══════════════ */}
                <motion.div
                    {...sectionDelay(5)}
                    className="rounded-3xl p-6 md:p-8 shadow-xl text-white relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, #052C63 0%, #06153A 100%)',
                        boxShadow: '0 10px 50px -8px rgba(5,44,99,0.5)',
                    }}
                >
                    <div
                        className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full"
                        style={{ backgroundColor: 'rgba(173,140,45,0.08)' }}
                    />
                    <div
                        className="absolute bottom-[-30px] left-[20%] w-36 h-36 rounded-full"
                        style={{ backgroundColor: 'rgba(173,140,45,0.05)' }}
                    />
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
                        style={{ backgroundColor: 'rgba(173,140,45,0.03)' }}
                    />
                    <div className="relative z-10 space-y-5">
                        <div
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide"
                            style={{ backgroundColor: 'rgba(173,140,45,0.15)', color: '#AD8C2D', border: '1px solid rgba(173,140,45,0.3)' }}
                        >
                            <Heart size={14} color="#AD8C2D" className="fill-current" />
                            <span>رسالتي لكم</span>
                            <Heart size={14} color="#AD8C2D" className="fill-current" />
                        </div>
                        <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.92)' }}>
                            <p>
                                كن إيجابيًا، واجعل الاجتهاد طريقك إلى النجاح.
                            </p>
                            <p>
                                الحياة لا تمنح الفرص لمن ينتظر، بل لمن يسعى ويجتهد. قد تواجه صعوبات وعقبات، لكن تذكّر أن كل تحدٍ هو خطوة نحو القوة والخبرة. حافظ على تفكيرك الإيجابي، فالإيجابية تمنحك الأمل، والأمل يمنحك الدافع للاستمرار.
                            </p>
                            <p>
                                اجتهد في عملك، وأخلص فيما تقوم به، ولا تقارن بدايتك بنهاية الآخرين. فالنجاح الحقيقي هو أن تصبح اليوم أفضل مما كنت عليه بالأمس. ثق بقدراتك، وواصل التعلم، ولا تجعل الفشل يوقفك، بل اجعله درسًا يقودك إلى النجاح.
                            </p>
                            <p>
                                ابدأ يومك بابتسامة، واعمل بإصرار، وتحلَّ بالصبر، فكل جهد تبذله اليوم سيكون ثمرةً تفتخر بها غدًا.
                            </p>
                            <p className="font-bold" style={{ color: '#AD8C2D' }}>
                                تذكّر دائمًا: الإيجابية تصنع العقلية، والاجتهاد يصنع الإنجاز، والاستمرار يصنع النجاح.
                            </p>
                        </div>
                        <div className="w-16 h-0.5 rounded-full" style={{ backgroundColor: 'rgba(173,140,45,0.4)' }} />
                    </div>
                </motion.div>

            </div>

            <PublicFooter />
        </div>
    );
};

export default AAbdullah;
