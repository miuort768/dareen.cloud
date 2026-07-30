import { motion } from 'framer-motion';
import { Sparkles, Award, Users, Heart } from 'lucide-react';
import { AnimateOnScroll } from '../../components/ui/AnimateOnScroll';

export const AboutHero = () => (
    <section className="relative pb-8 md:pt-32 md:pb-12 overflow-hidden bg-white dark:bg-background">
        <div className="absolute top-0 start-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none hidden md:block"></div>
        <div className="absolute bottom-0 end-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none hidden md:block"></div>
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/simple-dashed.png')]"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
            <AnimateOnScroll animation="fadeUp">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-soft/60 dark:bg-primary/10 backdrop-blur-sm border border-primary dark:border-primary/20 rounded-full mb-4">
                <Sparkles size={13} className="text-primary" />
                <span className="text-micro font-black text-primary">دارين السابعة | ريادة تعليمية</span>
            </div>

            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-main mb-4 font-heading leading-none md:leading-tight relative">
                <span className="sr-only">عن دارين السابعة للتعليم والتدريب - أفضل منصة للتعليم عن بعد والدروس الخصوصية في الكويت والخليج</span>
                <span aria-hidden="true">نحن لا نُدرّس فقط،<br className="md:hidden" /><span className="hidden md:inline"> </span></span>
                <span className="text-primary py-1 inline-block" aria-hidden="true">نحن نبني مستقبلاً</span>
            </h1>

            <p className="text-xs md:text-base text-muted max-w-3xl mx-auto leading-relaxed md:leading-relaxed mb-8 px-4 font-medium">
                في دارين السابعة، منصة تعليم عن بعد رائدة في السعودية والكويت والخليج، نؤمن بأن كل طالب هو مشروع نجاح بحد ذاته. نجمع بين أصالة القيم العربية وأحدث تقنيات التعليم الرقمي في السعودية، الكويت، الإمارات، قطر وعمان والبحرين لتقديم دروس خصوصية أونلاين، قدرات وتحصيلي، تحفيظ قرآن، وتأسيس أطفال وفق المناهج الخليجية.
            </p>
            </AnimateOnScroll>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={{ visible: { transition: { staggerChildren: 0.12 } } }} className="flex flex-wrap justify-center gap-8 md:gap-12">
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary-soft dark:bg-card rounded-card flex items-center justify-center text-primary mb-3 shadow-sm group-hover:scale-110 transition-transform">
                        <Award size={24} />
                    </div>
                    <span className="text-xl md:text-2xl font-black text-main">10+</span>
                    <span className="text-micro text-muted font-black mt-1">سنوات تميز</span>
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary-soft dark:bg-card rounded-card flex items-center justify-center text-primary mb-3 shadow-sm group-hover:scale-110 transition-transform">
                        <Users size={24} />
                    </div>
                    <span className="text-xl md:text-2xl font-black text-main">5k+</span>
                    <span className="text-micro text-muted font-black mt-1">طالب فخور</span>
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-warning-light dark:bg-warning/20 rounded-card flex items-center justify-center text-warning mb-3 shadow-sm group-hover:scale-110 transition-transform">
                        <Heart size={24} />
                    </div>
                    <span className="text-xl md:text-2xl font-black text-main">100%</span>
                    <span className="text-micro text-muted font-black mt-1">ثقة وتفاني</span>
                </motion.div>
            </motion.div>
        </div>
    </section>
);
