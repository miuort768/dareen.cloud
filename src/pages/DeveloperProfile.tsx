import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Code, Target, Heart, MessageSquare, Send, Award, Star, Sparkles } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import { MobileHeader } from '../components/public/MobileHeader';
import { PublicFooter } from '../components/public/PublicFooter';

export const DeveloperProfile = () => {
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
        { icon: Award, title: 'الجودة', desc: 'نقدم الأفضل دائماً' },
        { icon: Sparkles, title: 'المتعة', desc: 'التعليم مش ممل' },
        { icon: Star, title: 'الفائدة', desc: 'كل دقيقة بتفرق' },
        { icon: Code, title: 'الابتكار', desc: 'نفكر خارج الصندوق' },
        { icon: Heart, title: 'خدمة الطالب وولي الأمر', desc: 'هم الأساس' },
    ];

    return (
        <div className="min-h-screen bg-primary-light dark:bg-background font-sans overflow-x-hidden select-none" dir="rtl">
            <style>{`@media print { body { display: none !important; } }`}</style>
            {/* Mobile Header (same as Home) */}
            <MobileHeader />

            <div className="max-w-4xl mx-auto px-4 pt-28 md:pt-36 pb-4 space-y-6">

                {/* ═══════════════ HERO ═══════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4"
                >
                    <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-primary)] flex items-center justify-center shadow-xl shadow-primary dark:shadow-primary">
                        <Code size={28} className="text-on-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-main dark:text-on-primary">
                            مستر احمد عبدالله
                        </h1>
                        <p className="text-sm md:text-base font-bold text-primary dark:text-primary">
                            مؤسس منصة دارين السابعة
                        </p>
                    </div>
                    <div className="flex gap-3 mr-auto">
                        <a
                            href={`https://wa.me/${adminPhone?.replace(/\D/g, '') || '965000000000'}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-success text-on-primary px-5 py-2.5 rounded-full text-sm font-bold shadow-lg hover:bg-success active:scale-95 transition-all"
                        >
                            <MessageSquare size={16} />
                            واتساب
                        </a>
                        <a
                            href={tgHandle.startsWith('http') ? tgHandle : `https://t.me/${tgHandle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-info text-on-primary px-5 py-2.5 rounded-full text-sm font-bold shadow-lg hover:bg-info active:scale-95 transition-all"
                        >
                            <Send size={16} />
                            تيليجرام
                        </a>
                    </div>
                </motion.div>

                {/* ═══════════════ النشأة ═══════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-primary-active rounded-3xl p-6 md:p-8 shadow-sm border border-border dark:border-border space-y-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from--[var(--bg-warning)] to--[var(--bg-warning)] flex items-center justify-center">
                            <GraduationCap size={20} className="text-on-primary" />
                        </div>
                        <h2 className="text-lg font-black text-main dark:text-on-primary">النشأة</h2>
                    </div>
                    <p className="text-sm text-muted dark:text-muted leading-relaxed">
                        خريج كلية التربية — جامعة الأزهر. مدرس شغوف بالبرمجة،
                        آمن بأن التكنولوجيا هي المفتاح لتطوير التعليم العربي
                        وجعله أكثر متعة وفائدة.
                    </p>
                </motion.div>

                {/* ═══════════════ الرؤية ═══════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-primary)] rounded-3xl p-6 md:p-8 shadow-xl shadow-primary dark:shadow-primary text-on-primary relative overflow-hidden"
                >
                    <div className="absolute top-[-30px] left-[-30px] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute bottom-[-20px] right-[30%] w-24 h-24 bg-white/10 rounded-full blur-xl" />
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                <Target size={20} className="text-on-primary" />
                            </div>
                            <h2 className="text-lg font-black">الرؤية</h2>
                        </div>
                        <p className="text-sm leading-relaxed text-on-primary/90">
                            "دارين السابعة ليست مجرد منصة، إنها أداة لمساعدة الطلاب وأولياء الأمور.
                            {' '}هدفنا أن نكون أكبر منصة تعليمية عربية تقدم محتوى مفيد وممتع،
                            {' '}وتساهم في بناء جيل واعٍ ومتعلم."
                        </p>
                    </div>
                </motion.div>

                {/* ═══════════════ القيم ═══════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                >
                    <h2 className="text-lg font-black text-main dark:text-on-primary">القيم</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {values.map((v, i) => {
                            const Icon = v.icon;
                            return (
                                <div
                                    key={i}
                                    className="bg-white dark:bg-primary-active rounded-2xl p-4 shadow-sm border border-border dark:border-border text-center space-y-2"
                                >
                                    <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from--[var(--bg-warning)] to--[var(--bg-warning)] flex items-center justify-center">
                                        <Icon size={18} className="text-on-primary" />
                                    </div>
                                    <h3 className="text-sm font-bold text-main dark:text-on-primary">{v.title}</h3>
                                    <p className="text-[10px] text-muted dark:text-muted">{v.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* ═══════════════ رسالة ═══════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-primary-active rounded-3xl p-6 md:p-8 shadow-sm border border-border dark:border-border space-y-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--bg-error)] to--[var(--bg-primary)] flex items-center justify-center">
                            <Heart size={20} className="text-on-primary" />
                        </div>
                        <h2 className="text-lg font-black text-main dark:text-on-primary">رسالة إلى أولياء الأمور والمعلمين</h2>
                    </div>
                    <div className="border-r-4 border-error pr-4 space-y-3">
                        <p className="text-sm text-muted dark:text-muted leading-relaxed">
                            "الإتقان أساس النجاح والتطوير.
                        </p>
                        <p className="text-sm text-muted dark:text-muted leading-relaxed">
                            يجب على الإنسان أن يبدأ بتقديم أفضل ما لديه،
                            {' '}مع الثقة بالله أولاً وأخيراً،
                            {' '}وأن يتحلى بالأخلاق في كل خطوة.
                        </p>
                        <p className="text-sm text-muted dark:text-muted leading-relaxed">
                            لأن النجاح الحقيقي مش بس في النتيجة،
                            {' '}لكن في الطريق والأخلاق اللي تمشينا فيها."
                        </p>
                    </div>
                </motion.div>

                {/* ═══════════════ التواصل ═══════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-br from--[var(--bg-warning)] to--[var(--bg-warning)] rounded-3xl p-6 md:p-8 shadow-xl shadow-warning dark:shadow-warning text-on-primary relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-[50px] pointer-events-none" />
                    <div className="relative z-10 text-center space-y-4">
                        <h3 className="text-xl font-black">تواصل معي</h3>
                        <p className="text-sm text-on-primary/80">سأكون سعيداً بالتواصل معك</p>
                        <div className="flex justify-center gap-3 pt-2">
                            <a
                                href={`https://wa.me/${adminPhone?.replace(/\D/g, '') || '965000000000'}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-white text-warning px-5 py-3 rounded-full text-sm font-bold shadow-lg hover:bg-warning-light active:scale-95 transition-all"
                            >
                                <MessageSquare size={16} />
                                واتساب
                            </a>
                            <a
                                href={tgHandle.startsWith('http') ? tgHandle : `https://t.me/${tgHandle}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-on-primary px-5 py-3 rounded-full text-sm font-bold border border-white/30 hover:bg-white/30 active:scale-95 transition-all"
                            >
                                <Send size={16} />
                                تيليجرام
                            </a>
                        </div>
                    </div>
                </motion.div>

            </div>

            {/* Footer */}
            <PublicFooter />
        </div>
    );
};

export default DeveloperProfile;
