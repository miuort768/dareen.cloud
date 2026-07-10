import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MobileHeader } from '../../components/public/MobileHeader';
import { PublicFooter } from '../../components/public/PublicFooter';
import { Image } from '../../shared/components/ui';
import { Zap, Shield, BookOpen, Target, Compass, Sparkles, Lightbulb, Award, Users, Heart, ArrowLeft } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { AnimateOnScroll } from '../../components/ui/AnimateOnScroll';

export const About = () => {
    return (
        <div className="min-h-full bg-white dark:bg-background font-sans text-main dark:text-main relative overflow-x-hidden">
            <SEO title="من نحن | دارين السابعة - منصة تعليم عن بعد رائدة في الكويت والخليج" description="منصة دارين السابعة للتعليم عن بعد في الكويت، السعودية، قطر، الإمارات وعمان والبحرين. نوفر دروس خصوصية أونلاين في الدوحة والريان ومسقط وصلالة والمنامة والمحرق، تحفيظ قرآن، تأسيس أطفال، ومراجعات للمناهج الخليجية والبحرينية مع أفضل المعلمين المعتمدين. احجز حصة تجريبية مجانية." url="https://dareen.cloud/about" image="/dareen_logo_new.jpg" breadcrumbs={[{ name: 'الرئيسية', item: '/' }, { name: 'من نحن', item: '/about' }]} />
            <script type="application/ld+json">
                {JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'AboutPage',
                    name: 'من نحن - دارين السابعة',
                    description: 'منصة دارين السابعة للتعليم عن بعد في الكويت والخليج',
                    mainEntity: { '@type': 'EducationalOrganization', name: 'دارين السابعة', url: 'https://dareen.cloud' }
                })}
            </script>
            <MobileHeader />

            {/* Hero Section */}
            <section className="relative pb-8 md:pt-32 md:pb-12 overflow-hidden bg-white dark:bg-background">
                {/* Creative Background Elements - Premium Royal Theme */}
                <div className="absolute top-0 start-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none hidden md:block"></div>
                <div className="absolute bottom-0 end-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none hidden md:block"></div>
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/simple-dashed.png')]"></div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <AnimateOnScroll animation="fadeUp">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-soft/60 dark:bg-primary/10 backdrop-blur-sm border border-primary dark:border-primary/20 rounded-full mb-4">
                        <Sparkles size={13} className="text-primary dark:text-primary" />
                        <span className="text-micro font-black text-primary dark:text-primary">دارين السابعة | ريادة تعليمية</span>
                    </div>

                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-main dark:text-on-primary mb-4 font-heading leading-[1.1] md:leading-tight relative">
                        <span className="sr-only">عن دارين السابعة للتعليم والتدريب - أفضل منصة للتعليم عن بعد والدروس الخصوصية في الكويت والخليج</span>
                        <span aria-hidden="true">نحن لا نُدرّس فقط،<br className="md:hidden" /><span className="hidden md:inline"> </span></span>
                        <span className="text-primary py-1 inline-block" aria-hidden="true">نحن نبني مستقبلاً</span>
                    </h1>

                    <p className="text-xs md:text-base text-muted dark:text-muted max-w-3xl mx-auto leading-relaxed md:leading-relaxed mb-8 px-4 font-medium">
                        في دارين السابعة، منصة تعليم عن بعد رائدة في السعودية والكويت والخليج، نؤمن بأن كل طالب هو مشروع نجاح بحد ذاته. نجمع بين أصالة القيم العربية وأحدث تقنيات التعليم الرقمي في السعودية، الكويت، الإمارات، قطر وعمان والبحرين لتقديم دروس خصوصية أونلاين، قدرات وتحصيلي، تحفيظ قرآن، وتأسيس أطفال وفق المناهج الخليجية.
                    </p>
                    </AnimateOnScroll>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={{ visible: { transition: { staggerChildren: 0.12 } } }} className="flex flex-wrap justify-center gap-8 md:gap-12">
                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-primary-soft dark:bg-primary-active/20 rounded-none flex items-center justify-center text-primary mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                <Award size={24} />
                            </div>
                            <span className="text-xl md:text-2xl font-black text-main dark:text-on-primary">10+</span>
                            <span className="text-micro text-muted dark:text-muted font-black mt-1">سنوات تميز</span>
                        </motion.div>

                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-primary-soft dark:bg-primary-active/20 rounded-none flex items-center justify-center text-primary mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                <Users size={24} />
                            </div>
                            <span className="text-xl md:text-2xl font-black text-main dark:text-on-primary">5k+</span>
                            <span className="text-micro text-muted dark:text-muted font-black mt-1">طالب فخور</span>
                        </motion.div>

                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-warning-light dark:bg-warning/20 rounded-none flex items-center justify-center text-warning mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                <Heart size={24} />
                            </div>
                            <span className="text-xl md:text-2xl font-black text-main dark:text-on-primary">100%</span>
                            <span className="text-micro text-muted dark:text-muted font-black mt-1">ثقة وتفاني</span>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Our Story & Impact */}
            <section className="py-6 md:py-8 relative overflow-hidden bg-white dark:bg-background">
                <div className="container mx-auto px-4 relative z-10">
                    <AnimateOnScroll animation="fadeUp">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 max-w-6xl mx-auto">

                        {/* Interactive Visual Side */}
                        <div className="w-full lg:w-1/2 order-2 lg:order-1">
                            <div className="relative">
                                <div className="absolute top-0 start-0 w-full h-full bg-gradient-to-br from-[var(--bg-primary)]/10 to-[var(--bg-warning)]/10 rounded-[3rem] -rotate-3 scale-105 blur-xl"></div>
                                <div className="relative grid grid-cols-2 gap-4">
                                    <div className="pt-8 space-y-4">
                                        <div className="h-64 rounded-[2rem] overflow-hidden shadow-2xl">
                                            <Image src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800" className="w-full h-full" alt="تعلم تعاوني" />
                                        </div>
                                        <div className="h-48 bg-warning rounded-[2rem] p-6 flex flex-col justify-end text-on-primary shadow-xl">
                                            <Sparkles size={24} className="mb-4 text-on-primary/90" />
                                            <p className="font-black text-xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.30)]">إبداع مستمر</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="h-48 bg-primary-hover rounded-[2rem] p-6 flex flex-col justify-end text-on-primary shadow-xl">
                                            <Target size={24} className="mb-4 text-on-primary/90" />
                                            <h4 className="font-black text-xl text-on-primary drop-shadow-[0_1px_2px_rgba(0,0,0,0.30)]">أهداف محققة</h4>
                                        </div>
                                        <div className="h-64 rounded-[2rem] overflow-hidden shadow-2xl">
                                            <Image src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800" className="w-full h-full" alt="تدريس فعال" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="w-full lg:w-1/2 order-1 lg:order-2 text-start">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-card dark:bg-surface text-on-primary dark:text-main rounded-none mb-4">
                                <span className="text-micro font-black">تعرف عليـــنا</span>
                            </div>
                            <h2 className="text-2xl md:text-4xl font-black text-main dark:text-on-primary mb-4 font-heading leading-tight md:leading-tight">
                                ريادة في التعليم،<br />
                                <span className="text-primary">نهضة في الفكر</span>
                            </h2>
                            <p className="text-muted dark:text-muted text-sm md:text-base leading-relaxed font-medium mb-8 max-w-xl">
                                بدأ دارين السابعة كحلم صغير لتقديم تعليم يختلف عن المألوف، واليوم أصبحنا منارة تعليمية يثق بها الآلاف. نعتمد على استراتيجيات التعلم النشط ونركز على تمكين الطالب من أدوات البحث والابتكار، ليواجه تحديات المستقبل بذكاء وثقة.
                            </p>

                            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={{ visible: { transition: { staggerChildren: 0.12 } } }} className="space-y-4">
                                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="flex items-start gap-4 p-6 bg-background dark:bg-card/50 rounded-none hover:bg-surface dark:hover:bg-card transition-colors border border-border dark:border-border">
                                    <div className="w-12 h-12 bg-white dark:bg-card rounded-none shadow-sm flex items-center justify-center text-primary shrink-0">
                                        <Zap size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-main dark:text-on-primary mb-1">رؤية الابتكار</h3>
                                        <p className="text-sm text-muted dark:text-muted font-medium">أن نكون الخيار الأول للتعليم النوعي المبتكر في المنطقة العربية.</p>
                                    </div>
                                </motion.div>
                                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="flex items-start gap-4 p-6 bg-background dark:bg-card/50 rounded-none hover:bg-surface dark:hover:bg-card transition-colors border border-border dark:border-border">
                                    <div className="w-12 h-12 bg-white dark:bg-card rounded-none shadow-sm flex items-center justify-center text-warning shrink-0">
                                        <BookOpen size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-main dark:text-on-primary mb-1">رسالة التمكين</h3>
                                        <p className="text-sm text-muted dark:text-muted font-medium">تقديم تجربة تعليمية قيمّة وملهمة تُطلق العنان لإبداع الطالب وتضمن تفوقه.</p>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </div>
                        </div>
                    </AnimateOnScroll>
                </div>
            </section>

            {/* Core Values Section - Enhanced */}
            <section className="py-4 md:py-6 bg-background dark:bg-card/50 relative overflow-hidden">
                {/* Visual Separator */}
                <div className="absolute top-0 end-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--bg-surface)] to-transparent"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <AnimateOnScroll animation="fadeUp">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-l from-[var(--bg-primary)] to-[var(--bg-primary-hover)] rounded-full mb-4 shadow-lg shadow-primary/20">
                            <span className="text-micro font-black text-on-primary">دستورنا التعليمي</span>
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black text-main dark:text-on-primary mb-4 font-heading">
                            القيم التي <span className="text-primary">تُحدد هويتنا</span>
                        </h2>
                        <div className="h-1 w-20 bg-warning mx-auto mb-6"></div>
                        <p className="text-muted dark:text-muted max-w-none mx-auto text-micro md:text-sm leading-relaxed font-medium">
                            الالتزام الراسخ بهذه القيم هو ما يصنع الفرق الحقيقي في رحلة نجاح طلابنا.
                        </p>
                    </div>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
                        {/* Value 1 - Honesty */}
                        <motion.div variants={{ hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="bg-gradient-to-br from-white to-[var(--bg-primary)]/50 dark:from-[var(--bg-card)] dark:to-[var(--bg-primary)]/20 p-6 md:p-8 rounded-card border border-primary/50 dark:border-primary/30 relative overflow-hidden shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-card bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-primary)] text-on-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg md:text-xl font-black text-main dark:text-on-primary font-heading">الأمانة</h3>
                            </div>
                            <p className="text-xs md:text-sm text-muted dark:text-muted leading-relaxed font-medium">
                                نلتزم بأعلى معايير النزاهة والصدق في كل تفاعل تعليمي، لنكون الشريك الموثوق لمستقبل أبنائكم.
                            </p>
                        </motion.div>

                        {/* Value 2 - Innovation */}
                        <motion.div variants={{ hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="bg-gradient-to-br from-white to-[var(--bg-warning)]/50 dark:from-[var(--bg-card)] dark:to-[var(--bg-warning)]/20 p-6 md:p-8 rounded-2xl border border-warning/50 dark:border-warning/30 relative overflow-hidden shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-card bg-gradient-to-br from-[var(--bg-warning)] to-[var(--bg-warning)] text-on-primary flex items-center justify-center shadow-lg shadow-warning/20 shrink-0">
                                    <Lightbulb className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg md:text-xl font-black text-main dark:text-on-primary font-heading">الابتكار</h3>
                            </div>
                            <p className="text-xs md:text-sm text-muted dark:text-muted leading-relaxed font-medium">
                                نطور أدواتنا باستمرار لنجعل من رحلة العلم تجربة استثنائية مشوقة تفتح آفاق العقل.
                            </p>
                        </motion.div>

                        {/* Value 3 - Excellence */}
                        <motion.div variants={{ hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="bg-gradient-to-br from-white to-[var(--bg-success)]/50 dark:from-[var(--bg-card)] dark:to-[var(--bg-success)]/20 p-6 md:p-8 rounded-2xl border border-success/50 dark:border-success/30 relative overflow-hidden shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-card bg-gradient-to-br from-[var(--bg-success)] to-[var(--bg-success)] text-on-primary flex items-center justify-center shadow-lg shadow-success/20 shrink-0">
                                    <Award className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg md:text-xl font-black text-main dark:text-on-primary font-heading">التميز</h3>
                            </div>
                            <p className="text-xs md:text-sm text-muted dark:text-muted leading-relaxed font-medium">
                                لا نرضى بأقل من الجودة الفائقة في كل برنامج نقدمه، لضمان مخرجات تعليمية تليق بطلابنا.
                            </p>
                        </motion.div>

                        {/* Value 4 - Building Generations */}
                        <motion.div variants={{ hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="bg-gradient-to-br from-white to-[var(--bg-error)]/50 dark:from-[var(--bg-card)] dark:to-[var(--bg-error)]/20 p-6 md:p-8 rounded-2xl border border-error/50 dark:border-error/30 relative overflow-hidden shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-card bg-gradient-to-br from-[var(--bg-error)] to-[var(--bg-error)] text-on-primary flex items-center justify-center shadow-lg shadow-error/20 shrink-0">
                                    <Compass className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg md:text-xl font-black text-main dark:text-on-primary font-heading">بناء الجيل</h3>
                            </div>
                            <p className="text-xs md:text-sm text-muted dark:text-muted leading-relaxed font-medium">
                                نركز على صقل شخصية الطالب ومهاراته القيادية ليكون منارة للتغيير الإيجابي في المجتمع.
                            </p>
                        </motion.div>
                    </motion.div>
                    </AnimateOnScroll>
                </div>
            </section>

            {/* ── Image Banner ── */}
            <section className="py-4 md:py-6 bg-white dark:bg-background relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <picture>
                            <source srcSet="/dareen8.webp" type="image/webp" />
                            <source srcSet="/dareen8.avif" type="image/avif" />
                            <img src="/dareen8.png" alt="دارين السابعة" width="1983" height="793" loading="lazy"
                                className="w-full max-w-[400px] md:max-w-full mx-auto h-auto block" />
                        </picture>
                    </div>
                </div>
            </section>

            {/* ── Join Our Family - Standalone Section ── */}
            <section className="py-6 md:py-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0b0f1a 0%, #1a1035 40%, #2d1b4e 70%, #1a1035 100%)' }}>
                {/* Warm ambient glows */}
                <div className="absolute top-0 start-0 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)' }} />
                <div className="absolute bottom-0 end-0 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 70%)' }} />
                <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)' }} />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <AnimateOnScroll animation="fadeUp">
                            <div className="relative group overflow-hidden rounded-3xl" style={{ boxShadow: '0 40px 100px -15px rgba(0,0,0,0.50)' }}>
                                {/* Animated border glow */}
                                <div className="absolute -inset-[2px] opacity-50 group-hover:opacity-80 transition-opacity duration-1000 rounded-3xl pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.4), rgba(245,158,11,0.1), rgba(139,92,246,0.3), rgba(245,158,11,0.4))' }} />
                                
                                <div className="relative rounded-3xl p-8 md:p-14 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f1320 0%, #1a1140 50%, #0f1320 100%)' }}>
                                    {/* Decorative pattern overlay */}
                                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0L60 30L30 60L0 30Z\' fill=\'none\' stroke=\'%23f59e0b\' stroke-width=\'0.5\'/%3E%3C/svg%3E")', backgroundSize: '60px 60px' }} />

                                    <div className="relative z-20 flex flex-col lg:flex-row items-stretch gap-10 lg:gap-16">
                                        {/* Content Side */}
                                        <div className="w-full lg:w-[58%] text-center lg:text-start flex flex-col justify-center">
                                            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full mb-6 lg:mb-8 mx-auto lg:mx-0" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
                                                <Sparkles size={14} className="text-amber-400" />
                                                <span className="text-xs font-black text-amber-400 tracking-wider">انضم إلى عائلتنا</span>
                                            </div>

                                            <h2 className="text-xl md:text-3xl lg:text-4xl font-black mb-4 leading-tight text-white">
                                                هل أنت مستعد لتكون <br />
                                                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)' }}>جزءاً من حكايتنا؟</span>
                                            </h2>

                                            <p className="text-sm md:text-base max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                                انضم إلى آلاف الطلاب الذين بدؤوا رحلتهم نحو التميز الحقيقي مع دارين السابعة. مستقبلك المشرق يبدأ بقرار واحد تتخذه الآن.
                                            </p>

                                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                                <Link
                                                    to="/courses"
                                                    onClick={() => window.scrollTo(0, 0)}
                                                    className="group relative px-10 py-4 font-black text-base rounded-xl overflow-hidden transition-all duration-500 hover:-translate-y-1 flex items-center justify-center gap-3"
                                                    style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#0b0f1a', boxShadow: '0 8px 32px rgba(245,158,11,0.30)' }}
                                                >
                                                    <span className="relative z-10">ابدأ رحلتك الآن</span>
                                                    <ArrowLeft size={18} className="relative z-10 group-hover:-translate-x-1.5 transition-transform" />
                                                </Link>

                                                <Link
                                                    to="/login"
                                                    onClick={() => window.scrollTo(0, 0)}
                                                    className="px-10 py-4 font-black text-base rounded-xl transition-all duration-500 flex items-center justify-center group border backdrop-blur-sm hover:-translate-y-1"
                                                    style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)' }}
                                                >
                                                    <span>تسجيل الدخول</span>
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Stats Side */}
                                        <div className="w-full lg:w-[42%] relative flex items-center">
                                            <div className="grid grid-cols-2 gap-3 w-full">
                                                <div className="relative p-6 md:p-8 rounded-2xl flex flex-col items-center justify-center text-center transform hover:-translate-y-1.5 transition-all duration-500 group/card overflow-hidden min-h-[180px] backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                    <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(245,158,11,0.06), transparent 70%)' }} />
                                                    
                                                    <div className="relative z-10">
                                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover/card:scale-110 transition-transform duration-500" style={{ background: 'rgba(245,158,11,0.15)' }}>
                                                            <Users size={22} className="text-amber-400" />
                                                        </div>
                                                        <span className="text-3xl md:text-4xl font-black text-white mb-1 block tracking-tight">5k+</span>
                                                        <span className="text-micro text-amber-400/70 font-black">طالب فعال</span>
                                                    </div>
                                                </div>

                                                <div className="relative p-6 md:p-8 rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-500 group/card overflow-hidden min-h-[180px] backdrop-blur-sm hover:-translate-y-1.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                    <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(139,92,246,0.06), transparent 70%)' }} />
                                                    
                                                    <div className="relative z-10">
                                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover/card:scale-110 transition-transform duration-500" style={{ background: 'rgba(139,92,246,0.15)' }}>
                                                            <Target size={22} className="text-violet-400" />
                                                        </div>
                                                        <span className="text-3xl md:text-4xl font-black text-white mb-1 block tracking-tight">97.3%</span>
                                                        <span className="text-micro text-violet-400/70 font-black">نسبة نجاح</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </AnimateOnScroll>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
};
