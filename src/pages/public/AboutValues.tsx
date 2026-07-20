import { motion } from 'framer-motion';
import { AnimateOnScroll } from '../../components/ui/AnimateOnScroll';
import { Shield, Lightbulb, Award, Compass } from 'lucide-react';

export const AboutValues = () => (
    <section className="py-4 md:py-6 bg-background dark:bg-card/50 relative overflow-hidden">
        <div className="absolute top-0 end-0 w-full h-px bg-gradient-to-r from-transparent via-surface to-transparent"></div>

        <div className="container mx-auto px-4 relative z-10">
            <AnimateOnScroll animation="fadeUp">
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-l from-primary to-primary-hover rounded-full mb-4 shadow-lg shadow-primary/20">
                    <span className="text-micro font-black text-on-primary">دستورنا التعليمي</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-black text-main dark:text-main mb-4 font-heading">
                    القيم التي <span className="text-primary">تُحدد هويتنا</span>
                </h2>
                <div className="h-1 w-20 bg-warning mx-auto mb-6"></div>
                <p className="text-muted dark:text-muted max-w-none mx-auto text-micro md:text-sm leading-relaxed font-medium">
                    الالتزام الراسخ بهذه القيم هو ما يصنع الفرق الحقيقي في رحلة نجاح طلابنا.
                </p>
            </div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
                <motion.div variants={{ hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="bg-gradient-to-br from-white to-[var(--bg-primary)]/50 dark:from-[var(--bg-card)] dark:to-[var(--bg-primary)]/20 p-6 md:p-8 rounded-card border border-primary/50 dark:border-primary/30 relative overflow-hidden shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-card bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-primary)] text-on-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg md:text-xl font-black text-main dark:text-main font-heading">الأمانة</h3>
                    </div>
                    <p className="text-xs md:text-sm text-muted dark:text-muted leading-relaxed font-medium">نلتزم بأعلى معايير النزاهة والصدق في كل تفاعل تعليمي، لنكون الشريك الموثوق لمستقبل أبنائكم.</p>
                </motion.div>

                <motion.div variants={{ hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="bg-gradient-to-br from-white to-[var(--bg-warning)]/50 dark:from-[var(--bg-card)] dark:to-[var(--bg-warning)]/20 p-6 md:p-8 rounded-2xl border border-warning/50 dark:border-warning/30 relative overflow-hidden shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-card bg-gradient-to-br from-[var(--bg-warning)] to-[var(--bg-warning)] text-on-primary flex items-center justify-center shadow-lg shadow-warning/20 shrink-0">
                            <Lightbulb className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg md:text-xl font-black text-main dark:text-main font-heading">الابتكار</h3>
                    </div>
                    <p className="text-xs md:text-sm text-muted dark:text-muted leading-relaxed font-medium">نطور أدواتنا باستمرار لنجعل من رحلة العلم تجربة استثنائية مشوقة تفتح آفاق العقل.</p>
                </motion.div>

                <motion.div variants={{ hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="bg-gradient-to-br from-white to-[var(--bg-success)]/50 dark:from-[var(--bg-card)] dark:to-[var(--bg-success)]/20 p-6 md:p-8 rounded-2xl border border-success/50 dark:border-success/30 relative overflow-hidden shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-card bg-gradient-to-br from-[var(--bg-success)] to-[var(--bg-success)] text-on-primary flex items-center justify-center shadow-lg shadow-success/20 shrink-0">
                            <Award className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg md:text-xl font-black text-main dark:text-main font-heading">التميز</h3>
                    </div>
                    <p className="text-xs md:text-sm text-muted dark:text-muted leading-relaxed font-medium">لا نرضى بأقل من الجودة الفائقة في كل برنامج نقدمه، لضمان مخرجات تعليمية تليق بطلابنا.</p>
                </motion.div>

                <motion.div variants={{ hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="bg-gradient-to-br from-white to-[var(--bg-error)]/50 dark:from-[var(--bg-card)] dark:to-[var(--bg-error)]/20 p-6 md:p-8 rounded-2xl border border-error/50 dark:border-error/30 relative overflow-hidden shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-card bg-gradient-to-br from-[var(--bg-error)] to-[var(--bg-error)] text-on-primary flex items-center justify-center shadow-lg shadow-error/20 shrink-0">
                            <Compass className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg md:text-xl font-black text-main dark:text-main font-heading">بناء الجيل</h3>
                    </div>
                    <p className="text-xs md:text-sm text-muted dark:text-muted leading-relaxed font-medium">نركز على صقل شخصية الطالب ومهاراته القيادية ليكون منارة للتغيير الإيجابي في المجتمع.</p>
                </motion.div>
            </motion.div>
            </AnimateOnScroll>
        </div>
    </section>
);
