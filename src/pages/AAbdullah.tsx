import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { VCodeBracket, VTargetArrow, VHeart, VChatBubble, VTelegram, VAward, VStar, VSparkles, VRocket, VBolt } from '../components/vectors';
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
        { icon: VAward, title: 'الجودة', desc: 'نقدم الأفضل دايماً', bgClass: 'bg-primary' },
        { icon: VSparkles, title: 'المتعة', desc: 'التعليم مو ممل', bgClass: 'bg-success' },
        { icon: VStar, title: 'الفائدة', desc: 'كل دقيقة تفرق', bgClass: 'bg-accent' },
        { icon: VCodeBracket, title: 'الابتكار', desc: 'إبداعنا ما له حدود', bgClass: 'bg-info' },
        { icon: VHeart, title: 'خدمة عملائنا', desc: 'هم أساس كل شي', bgClass: 'bg-success' },
        { icon: VTargetArrow, title: 'التميز', desc: 'نسعى للأفضل دايماً', bgClass: 'bg-primary' },
    ];

    const cardClass = 'bg-white dark:bg-card rounded-3xl p-6 md:p-8 shadow-sm border border-border dark:border-border space-y-4';
    const sectionDelay = (i: number) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.1 } });

    return (
        <div className="min-h-screen bg-surface dark:bg-background" dir="rtl">
            <style>{`@media print { body { display: none !important; } }`}</style>
            <MobileHeader />

            <div className="max-w-4xl mx-auto px-4 pt-4 md:pt-36 pb-4 space-y-6">

                {/* ═══════════════ HERO ═══════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center gap-3"
                >
                    <div className="flex flex-row items-center justify-center md:justify-start gap-2.5 md:gap-3">
                        <div
                            className="flex w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-2xl items-center justify-center shadow-xl bg-primary dark:bg-primary"
                            style={{ boxShadow: '0 10px 30px -5px rgb(5_44_99 / 0.3)' }}
                        >
                            <VCodeBracket size={22} className="text-on-primary" />
                        </div>
                        <div className="text-start">
                            <h1 className="text-xl md:text-3xl font-black leading-tight text-[var(--text-primary)]">
                                مستر احمد عبدالله
                            </h1>
                            <p className="text-[11px] md:text-base font-bold leading-tight text-[var(--text-success)]" style={{ marginTop: '1px' }}>
                                مؤسس منصة دارين السابعة
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 justify-center md:justify-end md:ms-auto">
                        <a
                            href={`https://wa.me/${adminPhone?.replace(/\D/g, '') || '965000000000'}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 md:gap-3 text-on-primary px-5 md:px-8 py-2.5 md:py-3.5 text-sm md:text-lg font-bold shadow-lg active:scale-95 transition-all rounded-full bg-success"
                        >
                            <VChatBubble size={16} />
                            واتساب
                        </a>
                        <a
                            href={tgHandle.startsWith('http') ? tgHandle : `https://t.me/${tgHandle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 md:gap-3 text-on-primary px-5 md:px-8 py-2.5 md:py-3.5 text-sm md:text-lg font-bold shadow-lg active:scale-95 transition-all rounded-full bg-primary"
                        >
                            <VTelegram size={16} />
                            تيليجرام
                        </a>
                    </div>
                </motion.div>

                {/* ═══════════════ نبدة تعريفية ═══════════════ */}
                <motion.div {...sectionDelay(1)} className={cardClass}>
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black text-[var(--text-primary)]">
                            نبدة تعريفية
                        </h2>
                        <VRocket size={18} className="inline text-[var(--text-success)]" />
                        <VBolt size={16} className="inline text-[var(--text-accent)]" />
                    </div>
                    <p className="text-sm leading-relaxed text-muted dark:text-muted">
                        خريج كلية التربية — جامعة الأزهر. مدرس عشق البرمجة،
                        ومؤمن إن التكنولوجيا هي المفتاح لتطوير التعليم العربي
                        وتخليه أكثر متعة وفايدة.
                    </p>
                </motion.div>

                {/* ═══════════════ الرؤية ═══════════════ */}
                <motion.div
                    {...sectionDelay(2)}
                    className="rounded-3xl p-6 md:p-8 shadow-xl text-on-primary relative overflow-hidden bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-primary-active)]"
                >
                    <div className="absolute top-[-30px] left-[-30px] w-32 h-32 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-accent) 12%, transparent)' }} />
                    <div className="absolute bottom-[-20px] right-[30%] w-24 h-24 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-accent) 8%, transparent)' }} />
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm"
                                style={{ backgroundColor: 'color-mix(in srgb, var(--bg-accent) 20%, transparent)' }}
                            >
                                <VTargetArrow size={20} className="text-[var(--text-accent)]" />
                            </div>
                            <h2 className="text-lg font-black text-[var(--text-accent)]">الرؤية</h2>
                        </div>
                        <p className="text-sm leading-relaxed text-on-primary/90">
                            "دارين السابعة مو مجرد منصة، هي أداة تساعد الطلاب وأولياء الأمور.
                            {' '}هدفنا إنا نصير أكبر منصة تعليمية عربية نقدم محتوى مفيد وممتع،
                            {' '}وتساعد في بناء جيل واعي ومتعلم."
                        </p>
                    </div>
                </motion.div>

                {/* ═══════════════ القيم ═══════════════ */}
                <motion.div {...sectionDelay(3)} className="space-y-4">
                    <h2 className="text-xl font-black text-[var(--text-primary)]">القيم</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {values.map((v, i) => {
                            const Icon = v.icon;
                            return (
                                <div
                                    key={i}
                                    className="bg-white dark:bg-card rounded-2xl p-4 shadow-sm text-center space-y-2"
                                    style={{ border: '1px solid rgb(0_0_0 / 0.06)' }}
                                >
                                    <div
                                        className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center ${v.bgClass}`}
                                    >
                                        <Icon size={18} className="text-on-primary" />
                                    </div>
                                    <h3 className="text-sm font-bold text-main dark:text-on-primary">{v.title}</h3>
                                    <p className="text-xs text-muted dark:text-muted">{v.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* ═══════════════ رسالة إلى أولياء الأمور والمعلمين ═══════════════ */}
                <motion.div
                    {...sectionDelay(4)}
                    className="bg-white dark:bg-card rounded-none p-6 md:p-8 shadow-sm space-y-4 border-s-4 border-accent"
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-accent) 15%, transparent)' }}
                        >
                            <VHeart size={20} className="text-[var(--text-accent)]" />
                        </div>
                        <h2 className="text-lg font-black text-[var(--text-primary)]">رسالة إلى أولياء الأمور والمعلمين</h2>
                    </div>
                    <div className="space-y-3" style={{ paddingInlineStart: '1rem' }}>
                        <p className="text-sm leading-relaxed text-muted dark:text-muted">
                            "الإتقان أساس النجاح والتطوير.
                        </p>
                        <p className="text-sm leading-relaxed text-muted dark:text-muted">
                            الإنسان لازم يبدي بأفضل ما عنده،
                            {' '}مع التوكل على الله أول وأخير،
                            {' '}ويلتزم بالأخلاق في كل خطوة.
                        </p>
                        <p className="text-sm leading-relaxed text-muted dark:text-muted">
                            لأن النجاح الحقيقي مو بس في النتيجة،
                            {' '}لكن في الطريق والأخلاق اللي نمشي فيها."
                        </p>
                    </div>
                </motion.div>

                {/* ═══════════════ رسالتي لكم ═══════════════ */}
                <motion.div
                    {...sectionDelay(5)}
                    className="rounded-3xl p-6 md:p-8 shadow-xl text-on-primary relative overflow-hidden bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-primary-active)]"
                >
                    <div
                        className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full"
                        style={{ backgroundColor: 'color-mix(in srgb, var(--bg-accent) 8%, transparent)' }}
                    />
                    <div
                        className="absolute bottom-[-30px] left-[20%] w-36 h-36 rounded-full"
                        style={{ backgroundColor: 'color-mix(in srgb, var(--bg-accent) 5%, transparent)' }}
                    />
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
                        style={{ backgroundColor: 'color-mix(in srgb, var(--bg-accent) 3%, transparent)' }}
                    />
                    <div className="relative z-10 space-y-5">
                        <div
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide bg-accent/15 text-accent border border-accent/30"
                        >
                            <VHeart size={14} className="fill-current text-accent" />
                            <span>رسالتي لكم</span>
                            <VHeart size={14} className="fill-current text-accent" />
                        </div>
                        <div className="space-y-4 text-sm leading-relaxed text-on-primary/90">
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
                            <p className="font-bold text-[var(--text-accent)]">
                                تذكّر دائمًا: الإيجابية تصنع العقلية، والاجتهاد يصنع الإنجاز، والاستمرار يصنع النجاح.
                            </p>
                        </div>
                        <div className="w-16 h-0.5 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-accent) 40%, transparent)' }} />
                    </div>
                </motion.div>

            </div>

            <PublicFooter />
        </div>
    );
};

export default AAbdullah;
