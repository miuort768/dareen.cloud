import { motion } from 'framer-motion';
import { Image } from '../../shared/components/ui';
import { AnimateOnScroll } from '../../components/ui/AnimateOnScroll';
import { Zap, BookOpen, Sparkles, Target } from 'lucide-react';

export const AboutStory = () => (
    <section className="py-6 md:py-8 relative overflow-hidden bg-background">
        <div className="container mx-auto px-4 relative z-10">
            <AnimateOnScroll animation="fadeUp">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 max-w-6xl mx-auto">
                <div className="w-full lg:w-1/2 order-2 lg:order-1">
                    <div className="relative">
                        <div className="absolute top-0 start-0 w-full h-full bg-gradient-to-br from-[var(--bg-primary)]/10 to-[var(--bg-warning)]/10 rounded-[3rem] -rotate-3 scale-105 blur-xl"></div>
                        <div className="relative grid grid-cols-2 gap-4">
                            <div className="pt-8 space-y-4">
                                <div className="h-64 rounded-[2rem] overflow-hidden shadow-2xl">
                                    <Image src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800" className="w-full h-full" alt="تعلم تعاوني" />
                                </div>
                                <div className="h-48 bg-warning rounded-[2rem] p-6 flex flex-col justify-end text-on-warning shadow-xl">
                                    <Sparkles size={24} className="mb-4 text-on-warning/90" />
                                     <p className="font-black text-xl">إبداع مستمر</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-48 bg-primary-hover rounded-[2rem] p-6 flex flex-col justify-end text-on-primary shadow-xl">
                                    <Target size={24} className="mb-4 text-on-primary/90" />
                                    <h4 className="font-black text-xl text-on-primary">أهداف محققة</h4>
                                </div>
                                <div className="h-64 rounded-[2rem] overflow-hidden shadow-2xl">
                                    <Image src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800" className="w-full h-full" alt="تدريس فعال" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-1/2 order-1 lg:order-2 text-start">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-card dark:bg-surface text-on-primary dark:text-main rounded-card mb-4">
                        <span className="text-micro font-black">تعرف عليـــنا</span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black text-main mb-4 font-heading leading-tight md:leading-tight">
                        ريادة في التعليم،<br />
                        <span className="text-primary">نهضة في الفكر</span>
                    </h2>
                    <p className="text-muted text-sm md:text-base leading-relaxed font-medium mb-8 max-w-xl">
                        بدأ دارين السابعة كحلم صغير لتقديم تعليم يختلف عن المألوف، واليوم أصبحنا منارة تعليمية يثق بها الآلاف. نعتمد على استراتيجيات التعلم النشط ونركز على تمكين الطالب من أدوات البحث والابتكار، ليواجه تحديات المستقبل بذكاء وثقة.
                    </p>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={{ visible: { transition: { staggerChildren: 0.12 } } }} className="space-y-4">
                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="flex items-start gap-4 p-6 bg-background dark:bg-card/50 rounded-card hover:bg-surface dark:hover:bg-card transition-colors border border-border">
                            <div className="w-12 h-12 bg-card rounded-card shadow-sm flex items-center justify-center text-primary shrink-0">
                                <Zap size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-main mb-1">رؤية الابتكار</h3>
                                <p className="text-sm text-muted font-medium">أن نكون الخيار الأول للتعليم النوعي المبتكر في المنطقة العربية.</p>
                            </div>
                        </motion.div>
                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="flex items-start gap-4 p-6 bg-background dark:bg-card/50 rounded-card hover:bg-surface dark:hover:bg-card transition-colors border border-border">
                            <div className="w-12 h-12 bg-card rounded-card shadow-sm flex items-center justify-center text-warning shrink-0">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-main mb-1">رسالة التمكين</h3>
                                <p className="text-sm text-muted font-medium">تقديم تجربة تعليمية قيمّة وملهمة تُطلق العنان لإبداع الطالب وتضمن تفوقه.</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
                </div>
            </AnimateOnScroll>
        </div>
    </section>
);
