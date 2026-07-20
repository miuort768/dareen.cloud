import { motion } from 'framer-motion';
import { Users, Star, Zap, ArrowLeft, Gift } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface HowItWorksProps {
    whatsappNumber: string;
}

export const HowItWorks = ({ whatsappNumber }: HowItWorksProps) => {
    return (
        <section id="how-it-works" className="py-4 relative overflow-hidden transition-colors duration-500 bg-surface dark:bg-background scroll-mt-32">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-primary/[0.05] dark:bg-primary/[0.08] blur-[100px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-success/[0.03] dark:bg-success/[0.06] blur-[100px] rounded-full"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-active dark:bg-primary-active text-on-primary rounded-full mb-4 mx-auto scale-90">
                        <Zap size={12} className="text-warning" />
                        <span className="text-micro font-black ">ابدأ رحلتك</span>
                    </div>
                    <h2 className="text-xl md:text-5xl font-black text-main dark:text-main font-heading">
                        كيف تشترك في <span className="text-primary dark:text-primary">المعهد؟</span>
                    </h2>
                </div>
                
                <div className="max-w-4xl mx-auto relative pt-4">
                    <div className="hidden md:block absolute inset-0 pointer-events-none overflow-visible">
                        <svg className="absolute top-[30px] left-[25%] w-[25%] h-[60px]" viewBox="0 0 200 60" fill="none">
                            <path 
                                d="M0 30 C 50 0, 150 0, 200 30" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeDasharray="6 6" 
                                className="text-dim dark:text-main"
                            />
                            <path d="M195 25 L205 32 L195 39" stroke="currentColor" strokeWidth="2" className="text-dim dark:text-main" />
                        </svg>
                        <svg className="absolute top-[30px] right-[25%] w-[25%] h-[60px]" viewBox="0 0 200 60" fill="none">
                            <path 
                                d="M0 30 C 50 60, 150 60, 200 30" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeDasharray="6 6" 
                                className="text-dim dark:text-main"
                            />
                            <path d="M195 25 L205 32 L195 39" stroke="currentColor" strokeWidth="2" className="text-dim dark:text-main" />
                        </svg>
                    </div>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="grid grid-cols-3 gap-2 md:gap-4">
                        {[
                            {
                                id: '01',
                                title: 'اختر الخدمة',
                                desc: 'حدد النظام التعليمي المناسب',
                                icon: <Users className="w-5 h-5 md:w-6 md:h-6" />,
                                color: 'from-primary-active to-primary-active'
                            },
                            {
                                id: '02',
                                title: 'حصة مجانية',
                                desc: 'حصة تجريبية مجانية لك',
                                icon: <Star className="w-5 h-5 md:w-6 md:h-6" />,
                                color: 'from-success to-success'
                            },
                            {
                                id: '03',
                                title: 'اشترك الآن',
                                desc: 'تواصل لحجز مقعدك',
                                icon: <Zap className="w-5 h-5 md:w-6 md:h-6" />,
                                color: 'from-primary to-primary'
                            }
                        ].map((step) => (
                            <motion.div key={step.id} variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5 }} className="relative group flex flex-col items-center">
                                <div className={cn(
                                    "w-[55px] h-[55px] md:w-[90px] md:h-[90px] rounded-[30%] flex items-center justify-center text-on-primary shadow-xl mb-4 md:mb-6 relative transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 bg-gradient-to-br",
                                    step.color
                                )}>
                                    <div className="scale-75 md:scale-100">
                                        {step.icon}
                                    </div>
                                    <span className="absolute -top-1 -start-1 md:-top-2 md:-start-2 w-4 h-4 md:w-6 md:h-6 bg-surface dark:bg-card text-main dark:text-main rounded-full flex items-center justify-center text-micro md:text-micro font-black shadow-lg border border-border dark:border-border">
                                        {step.id}
                                    </span>
                                </div>

                                <div className="text-center px-1 md:px-4 w-full">
                                    <div className="text-xs md:text-sm font-black text-main dark:text-main mb-1 group-hover:text-primary dark:group-hover:text-primary transition-colors">
                                        {step.title}
                                    </div>
                                    <p className="hidden sm:block text-micro md:text-micro text-muted dark:text-muted leading-tight font-bold">
                                        {step.desc}
                                    </p>
                                </div>
                                
                                <div className="hidden md:block absolute top-[45px] -start-2 w-1.5 h-1.5 rounded-full bg-surface dark:bg-primary-active group-last:hidden"></div>
                            </motion.div>
                        ))}
                    </motion.div>

                    <div className="mt-10 flex justify-center">
                        <a
                            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في البدء وحجز حصة تجريبية مجانية')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative px-8 py-3.5 bg-primary dark:bg-primary text-on-primary font-black text-sm rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative flex items-center gap-2">
                                <Gift size={16} />
                                <span>احجز حصتك المجانية الآن</span>
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};
