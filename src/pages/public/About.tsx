import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MobileHeader } from '../../components/public/MobileHeader';
import { PublicFooter } from '../../components/public/PublicFooter';
import { Zap, Shield, BookOpen, Target, Compass, Sparkles, Lightbulb, Award, Users, Heart, ArrowLeft } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { AnimateOnScroll } from '../../components/ui/AnimateOnScroll';

export const About = () => {
    return (
        <div className="min-h-full bg-white dark:bg-slate-950 font-sans text-gray-800 dark:text-slate-100 relative overflow-x-hidden">
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
            <section className="relative pb-8 md:pt-32 md:pb-12 overflow-hidden bg-white dark:bg-slate-950">
                {/* Creative Background Elements - Premium Royal Theme */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none hidden md:block"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none hidden md:block"></div>
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/simple-dashed.png')]"></div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <AnimateOnScroll animation="fadeUp">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50/60 dark:bg-indigo-500/10 backdrop-blur-sm border border-indigo-100 dark:border-indigo-500/20 rounded-full mb-4">
                        <Sparkles size={13} className="text-indigo-600 dark:text-indigo-400" />
                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-300">دارين السابعة | ريادة تعليمية</span>
                    </div>

                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4 font-heading leading-[1.1] md:leading-tight relative">
                        <span className="sr-only">عن دارين السابعة للتعليم والتدريب - أفضل منصة للتعليم عن بعد والدروس الخصوصية في الكويت والخليج</span>
                        <span aria-hidden="true">نحن لا نُدرّس فقط،<br className="md:hidden" /><span className="hidden md:inline"> </span></span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-900 py-1 inline-block" aria-hidden="true">نحن نبني مستقبلاً</span>
                    </h1>

                    <p className="text-xs md:text-base text-gray-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed md:leading-relaxed mb-8 px-4 font-medium">
                        في دارين السابعة، منصة تعليم عن بعد رائدة في السعودية والكويت والخليج، نؤمن بأن كل طالب هو مشروع نجاح بحد ذاته. نجمع بين أصالة القيم العربية وأحدث تقنيات التعليم الرقمي في السعودية، الكويت، الإمارات، قطر وعمان والبحرين لتقديم دروس خصوصية أونلاين، قدرات وتحصيلي، تحفيظ قرآن، وتأسيس أطفال وفق المناهج الخليجية.
                    </p>
                    </AnimateOnScroll>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={{ visible: { transition: { staggerChildren: 0.12 } } }} className="flex flex-wrap justify-center gap-8 md:gap-12">
                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-none flex items-center justify-center text-indigo-600 mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                <Award size={24} />
                            </div>
                            <span className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">10+</span>
                            <span className="text-[10px] text-gray-400 dark:text-slate-500 font-black mt-1">سنوات تميز</span>
                        </motion.div>

                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-none flex items-center justify-center text-indigo-600 mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                <Users size={24} />
                            </div>
                            <span className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">5k+</span>
                            <span className="text-[10px] text-gray-400 dark:text-slate-500 font-black mt-1">طالب فخور</span>
                        </motion.div>

                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-none flex items-center justify-center text-amber-600 mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                <Heart size={24} />
                            </div>
                            <span className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">100%</span>
                            <span className="text-[10px] text-gray-400 dark:text-slate-500 font-black mt-1">ثقة وتفاني</span>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Our Story & Impact */}
            <section className="py-6 md:py-8 relative overflow-hidden bg-white dark:bg-slate-950">
                <div className="container mx-auto px-4 relative z-10">
                    <AnimateOnScroll animation="fadeUp">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 max-w-6xl mx-auto">

                        {/* Interactive Visual Side */}
                        <div className="w-full lg:w-1/2 order-2 lg:order-1">
                            <div className="relative">
                                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-600/10 to-amber-500/10 rounded-[3rem] -rotate-3 scale-105 blur-xl"></div>
                                <div className="relative grid grid-cols-2 gap-4">
                                    <div className="pt-8 space-y-4">
                                        <div className="h-64 rounded-[2rem] overflow-hidden shadow-2xl">
                                            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="تعلم تعاوني" width="400" height="320" loading="lazy" decoding="async" />
                                        </div>
                                        <div className="h-48 bg-amber-500 rounded-[2rem] p-6 flex flex-col justify-end text-white shadow-xl">
                                            <Sparkles size={24} className="mb-4 text-white/90" />
                                            <p className="font-black text-xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">إبداع مستمر</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="h-48 bg-indigo-700 rounded-[2rem] p-6 flex flex-col justify-end text-white shadow-xl">
                                            <Target size={24} className="mb-4 text-white/90" />
                                            <h4 className="font-black text-xl text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">أهداف محققة</h4>
                                        </div>
                                        <div className="h-64 rounded-[2rem] overflow-hidden shadow-2xl">
                                            <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="تدريس فعال" width="400" height="320" loading="lazy" decoding="async" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="w-full lg:w-1/2 order-1 lg:order-2 text-right">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-none mb-4">
                                <span className="text-[10px] font-black ">تعرف عليـــنا</span>
                            </div>
                            <h2 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white mb-4 font-heading leading-tight md:leading-tight">
                                ريادة في التعليم،<br />
                                <span className="text-indigo-600">نهضة في الفكر</span>
                            </h2>
                            <p className="text-gray-600 dark:text-slate-400 text-sm md:text-base leading-relaxed font-medium mb-8 max-w-xl">
                                بدأ دارين السابعة كحلم صغير لتقديم تعليم يختلف عن المألوف، واليوم أصبحنا منارة تعليمية يثق بها الآلاف. نعتمد على استراتيجيات التعلم النشط ونركز على تمكين الطالب من أدوات البحث والابتكار، ليواجه تحديات المستقبل بذكاء وثقة.
                            </p>

                            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={{ visible: { transition: { staggerChildren: 0.12 } } }} className="space-y-4">
                                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-slate-900/50 rounded-none hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors border border-gray-100 dark:border-slate-800">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-none shadow-sm flex items-center justify-center text-indigo-600 shrink-0">
                                        <Zap size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">رؤية الابتكار</h3>
                                        <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">أن نكون الخيار الأول للتعليم النوعي المبتكر في المنطقة العربية.</p>
                                    </div>
                                </motion.div>
                                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-slate-900/50 rounded-none hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors border border-gray-100 dark:border-slate-800">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-none shadow-sm flex items-center justify-center text-amber-600 shrink-0">
                                        <BookOpen size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">رسالة التمكين</h3>
                                        <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">تقديم تجربة تعليمية قيمّة وملهمة تُطلق العنان لإبداع الطالب وتضمن تفوقه.</p>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </div>
                        </div>
                    </AnimateOnScroll>
                </div>
            </section>

            {/* Core Values Section - Enhanced */}
            <section className="py-4 md:py-6 bg-[#fafafa] dark:bg-slate-900/50 relative overflow-hidden">
                {/* Visual Separator */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <AnimateOnScroll animation="fadeUp">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-l from-[#1B1464] to-[#2D1B8E] rounded-full mb-4 shadow-lg shadow-indigo-900/20">
                            <span className="text-[9px] font-black text-white">دستورنا التعليمي</span>
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white mb-4 font-heading">
                            القيم التي <span className="text-indigo-600">تُحدد هويتنا</span>
                        </h2>
                        <div className="h-1 w-20 bg-amber-500 mx-auto mb-6"></div>
                        <p className="text-gray-500 dark:text-slate-400 max-w-none mx-auto text-[9px] md:text-sm leading-relaxed font-medium">
                            الالتزام الراسخ بهذه القيم هو ما يصنع الفرق الحقيقي في رحلة نجاح طلابنا.
                        </p>
                    </div>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
                        {/* Value 1 - Honesty */}
                        <motion.div variants={{ hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="group bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-900 dark:to-indigo-950/20 p-6 md:p-8 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30 hover:border-indigo-300/50 dark:hover:border-indigo-700/50 transition-all duration-500 relative overflow-hidden shadow-sm hover:shadow-lg hover:shadow-indigo-500/10">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/0 via-indigo-600/0 to-indigo-600/5 dark:to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 group-hover:scale-110 transition-all duration-500 shrink-0">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white font-heading">الأمانة</h3>
                            </div>
                            <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400 leading-relaxed font-medium">
                                نلتزم بأعلى معايير النزاهة والصدق في كل تفاعل تعليمي، لنكون الشريك الموثوق لمستقبل أبنائكم.
                            </p>
                        </motion.div>

                        {/* Value 2 - Innovation */}
                        <motion.div variants={{ hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="group bg-gradient-to-br from-white to-amber-50/50 dark:from-slate-900 dark:to-amber-950/20 p-6 md:p-8 rounded-2xl border border-amber-100/50 dark:border-amber-900/30 hover:border-amber-300/50 dark:hover:border-amber-700/50 transition-all duration-500 relative overflow-hidden shadow-sm hover:shadow-lg hover:shadow-amber-500/10">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/0 via-amber-600/0 to-amber-600/5 dark:to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/30 group-hover:scale-110 transition-all duration-500 shrink-0">
                                    <Lightbulb className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white font-heading">الابتكار</h3>
                            </div>
                            <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400 leading-relaxed font-medium">
                                نطور أدواتنا باستمرار لنجعل من رحلة العلم تجربة استثنائية مشوقة تفتح آفاق العقل.
                            </p>
                        </motion.div>

                        {/* Value 3 - Excellence */}
                        <motion.div variants={{ hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="group bg-gradient-to-br from-white to-emerald-50/50 dark:from-slate-900 dark:to-emerald-950/20 p-6 md:p-8 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/30 hover:border-emerald-300/50 dark:hover:border-emerald-700/50 transition-all duration-500 relative overflow-hidden shadow-sm hover:shadow-lg hover:shadow-emerald-500/10">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/0 via-emerald-600/0 to-emerald-600/5 dark:to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/30 group-hover:scale-110 transition-all duration-500 shrink-0">
                                    <Award className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white font-heading">التميز</h3>
                            </div>
                            <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400 leading-relaxed font-medium">
                                لا نرضى بأقل من الجودة الفائقة في كل برنامج نقدمه، لضمان مخرجات تعليمية تليق بطلابنا.
                            </p>
                        </motion.div>

                        {/* Value 4 - Building Generations */}
                        <motion.div variants={{ hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} className="group bg-gradient-to-br from-white to-rose-50/50 dark:from-slate-900 dark:to-rose-950/20 p-6 md:p-8 rounded-2xl border border-rose-100/50 dark:border-rose-900/30 hover:border-rose-300/50 dark:hover:border-rose-700/50 transition-all duration-500 relative overflow-hidden shadow-sm hover:shadow-lg hover:shadow-rose-500/10">
                            <div className="absolute inset-0 bg-gradient-to-br from-rose-600/0 via-rose-600/0 to-rose-600/5 dark:to-rose-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:shadow-rose-500/30 group-hover:scale-110 transition-all duration-500 shrink-0">
                                    <Compass className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white font-heading">بناء الجيل</h3>
                            </div>
                            <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400 leading-relaxed font-medium">
                                نركز على صقل شخصية الطالب ومهاراته القيادية ليكون منارة للتغيير الإيجابي في المجتمع.
                            </p>
                        </motion.div>
                    </motion.div>
                    </AnimateOnScroll>
                </div>
            </section>

            {/* Final Call to Action - Redesigned with Creative Touches */}
            <section className="py-4 md:py-6 bg-white dark:bg-slate-950 relative overflow-hidden">
                {/* Dramatic Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-indigo-600/[0.03] rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2"></div>
                    <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-purple-600/[0.03] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-6xl mx-auto">
                    <AnimateOnScroll animation="fadeUp">
                        {/* The Professional Container */}
                        <div className="relative group overflow-hidden">
                            {/* Animated Border/Glow effect */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-amber-500 to-indigo-600 opacity-20 group-hover:opacity-40 transition-opacity duration-700 blur-sm"></div>
                            
                            <div className="relative bg-[#0a0a0a] p-8 md:p-12 shadow-[0_40px_100px_-15px_rgba(0,0,0,0.6)] border border-white/5">
                                {/* Intricate Background Patterns */}
                                <div className="absolute inset-0 opacity-10 pointer-events-none">
                                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(79,70,229,0.15),transparent_50%)]"></div>
                                    <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,rgba(139,92,246,0.1),transparent_50%)]"></div>
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                                </div>

                                <div className="relative z-20 flex flex-col lg:flex-row items-stretch gap-12">
                                    {/* Content Side */}
                                    <div className="w-full lg:w-[60%] text-center lg:text-right flex flex-col justify-center">
                                        <div className="inline-flex items-center gap-3 px-6 py-2 bg-indigo-600/10 border border-indigo-500/20 mb-8 backdrop-blur-xl">
                                            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                                            <span className="text-xs font-black text-indigo-50">انضم إلى عائلتنا</span>
                                        </div>

                                        <h2 className="text-lg md:text-2xl lg:text-3xl font-black mb-4 font-heading text-white leading-tight md:leading-tight">
                                            هل أنت مستعد لتكون <br />
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-amber-200">جزءاً من حكايتنا؟</span>
                                        </h2>

                                        <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto lg:mx-0 mb-8 font-medium leading-relaxed opacity-80">
                                            انضم إلى آلاف الطلاب الذين بدؤوا رحلتهم نحو التميز الحقيقي مع دارين السابعة. مستقبلك المشرق يبدأ بقرار واحد تتخذه الآن.
                                        </p>

                                        <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                                            <Link
                                                to="/courses"
                                                onClick={() => window.scrollTo(0, 0)}
                                                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-[0_20px_40px_rgba(79,70,229,0.3)] transition-all duration-500 hover:-translate-y-1 flex items-center justify-center gap-4 group"
                                            >
                                                <span>ابدأ رحلتك الآن</span>
                                                <ArrowLeft size={20} className="group-hover:-translate-x-2 transition-transform" />
                                            </Link>

                                            <Link
                                                to="/login"
                                                onClick={() => window.scrollTo(0, 0)}
                                                className="px-10 py-4 bg-white/5 hover:bg-white/10 text-white font-black text-lg border border-white/10 hover:border-white/30 transition-all duration-500 flex items-center justify-center group"
                                            >
                                                <span>تسجيل الدخول</span>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Stats/Graphic Side */}
                                    <div className="w-full lg:w-[40%] relative flex items-center">
                                        <div className="grid grid-cols-2 gap-3 w-full">
                                            <div className="relative p-6 md:p-8 bg-white/[0.03] border border-white/10 backdrop-blur-2xl flex flex-col items-center justify-center text-center transform hover:-translate-y-2 transition-all duration-700 group/card overflow-hidden min-h-[200px]">
                                                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-indigo-600 transition-all duration-500 group-hover/card:w-full group-hover/card:h-full group-hover/card:opacity-20"></div>
                                                
                                                <div className="relative z-10">
                                                    <div className="w-12 h-12 bg-indigo-600/20 text-indigo-500 mb-4 flex items-center justify-center group-hover/card:scale-110 transition-transform duration-500">
                                                        <Users size={24} />
                                                    </div>
                                                    <span className="text-3xl md:text-4xl font-black text-white mb-1 block tracking-tight">5k+</span>
                                                    <span className="text-[10px] md:text-[11px] text-indigo-500/80 font-black">طالب فعال</span>
                                                </div>
                                                
                                                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-indigo-600/10 rounded-full blur-2xl group-hover/card:bg-indigo-600/20 transition-all"></div>
                                            </div>

                                            <div className="relative p-6 md:p-8 bg-white/[0.03] border border-white/10 backdrop-blur-2xl flex flex-col items-center justify-center text-center transition-all duration-700 group/card overflow-hidden min-h-[200px]">
                                                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-500 transition-all duration-500 group-hover/card:w-full group-hover/card:h-full group-hover/card:opacity-20"></div>
                                                
                                                <div className="relative z-10">
                                                    <div className="w-12 h-12 bg-amber-600/20 text-amber-500 mb-4 flex items-center justify-center group-hover/card:scale-110 transition-transform duration-500">
                                                        <Target size={24} />
                                                    </div>
                                                    <span className="text-3xl md:text-4xl font-black text-white mb-1 block tracking-tight">100%</span>
                                                    <span className="text-[10px] md:text-[11px] text-amber-500/80 font-black">نسبة نجاح</span>
                                                </div>

                                                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-amber-600/10 rounded-full blur-2xl group-hover/card:bg-amber-600/20 transition-all"></div>
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 bg-indigo-600/10 blur-[80px] -z-10"></div>
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
