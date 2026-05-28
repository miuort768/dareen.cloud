import { Users, Star, Zap, ArrowLeft } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface HowItWorksProps {
    whatsappNumber: string;
}

export const HowItWorks = ({ whatsappNumber }: HowItWorksProps) => {
    return (
        <section id="how-it-works" className="py-4 relative overflow-hidden transition-colors duration-500 bg-[#F7F8FC] dark:bg-slate-950 scroll-mt-32">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-indigo-500/[0.05] dark:bg-indigo-500/[0.08] blur-[100px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-emerald-500/[0.03] dark:bg-emerald-500/[0.06] blur-[100px] rounded-full"></div>
                <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 dark:bg-slate-800 text-white rounded-full mb-4 mx-auto scale-90">
                        <Zap size={12} className="text-amber-400" />
                        <span className="text-[10px] font-black ">ابدأ رحلتك</span>
                    </div>
                    <h2 className="text-xl md:text-5xl font-black text-slate-900 dark:text-white font-heading">
                        كيف تشترك في <span className="text-indigo-600 dark:text-indigo-400">المعهد؟</span>
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
                                className="text-slate-200 dark:text-slate-800"
                            />
                            <path d="M195 25 L205 32 L195 39" stroke="currentColor" strokeWidth="2" className="text-slate-200 dark:text-slate-800" />
                        </svg>
                        <svg className="absolute top-[30px] right-[25%] w-[25%] h-[60px]" viewBox="0 0 200 60" fill="none">
                            <path 
                                d="M0 30 C 50 60, 150 60, 200 30" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeDasharray="6 6" 
                                className="text-slate-200 dark:text-slate-800"
                            />
                            <path d="M195 25 L205 32 L195 39" stroke="currentColor" strokeWidth="2" className="text-slate-200 dark:text-slate-800" />
                        </svg>
                    </div>

                    <div className="grid grid-cols-3 gap-2 md:gap-4">
                        {[
                            {
                                id: '01',
                                title: 'اختر الخدمة',
                                desc: 'حدد النظام التعليمي المناسب',
                                icon: <Users className="w-5 h-5 md:w-6 md:h-6" />,
                                color: 'from-slate-900 to-slate-800'
                            },
                            {
                                id: '02',
                                title: 'حصة مجانية',
                                desc: 'استمتع بالتجريب أولاً',
                                icon: <Star className="w-5 h-5 md:w-6 md:h-6" />,
                                color: 'from-emerald-600 to-emerald-500'
                            },
                            {
                                id: '03',
                                title: 'اشترك الآن',
                                desc: 'تواصل لحجز مقعدك',
                                icon: <Zap className="w-5 h-5 md:w-6 md:h-6" />,
                                color: 'from-indigo-600 to-indigo-500'
                            }
                        ].map((step) => (
                            <div key={step.id} className="relative group flex flex-col items-center">
                                <div className={cn(
                                    "w-[55px] h-[55px] md:w-[90px] md:h-[90px] rounded-[30%] flex items-center justify-center text-white shadow-xl mb-4 md:mb-6 relative transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 bg-gradient-to-br",
                                    step.color
                                )}>
                                    <div className="scale-75 md:scale-100">
                                        {step.icon}
                                    </div>
                                    <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-4 h-4 md:w-6 md:h-6 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-full flex items-center justify-center text-[7px] md:text-[9px] font-black shadow-lg border border-slate-100 dark:border-slate-800">
                                        {step.id}
                                    </span>
                                </div>

                                <div className="text-center px-1 md:px-4 w-full">
                                    <div className="text-[12px] md:text-sm font-black text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {step.title}
                                    </div>
                                    <p className="hidden sm:block text-[8px] md:text-[10px] text-slate-500 dark:text-slate-400 leading-tight font-bold">
                                        {step.desc}
                                    </p>
                                </div>
                                
                                <div className="hidden md:block absolute top-[45px] -right-2 w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 group-last:hidden"></div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 flex justify-center">
                        <a
                            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في البدء وحجز حصة تجريبية مجانية')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative px-8 py-3.5 bg-slate-900 dark:bg-slate-800 text-white font-black text-sm rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative flex items-center gap-2">
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
