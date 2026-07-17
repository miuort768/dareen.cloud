import { motion } from 'framer-motion';
import { Sparkles, Building2 } from 'lucide-react';

export const JobsHeroBanner = () => (
    <section className="relative pt-2 md:pt-28 pb-4 md:pb-12 overflow-hidden bg-primary">
        <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-10 max-w-5xl mx-auto">
                <div className="flex-1 text-center md:text-start">
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 bg-white/15 rounded-card mb-3 md:mb-4">
                        <Sparkles size={12} className="text-warning" />
                        <span className="text-xs md:text-sm font-bold text-on-primary">خطوة لتكون من العائلة</span>
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="text-2xl md:text-5xl font-bold font-heading text-on-primary mb-2 md:mb-3 leading-tight">
                        فرصة للانضمام <span className="text-warning">إلى دارين السابعة</span>
                    </motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="text-on-primary/70 text-xs md:text-lg max-w-lg leading-relaxed mb-4 md:mb-0">
                        نبحث عن <span className="inline-block px-3 py-1 bg-warning text-on-warning rounded-card">معلمات متميزات</span> للتدريس أون لاين.<br /> انضمي إلى بيئة تعليمية مبتكرة تقدر الإبداع والتميز.
                    </motion.p>
                </div>
                <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
                    className="hidden md:block shrink-0">
                    <div className="w-40 h-40 md:w-52 md:h-52 bg-white/15 rounded-card flex items-center justify-center">
                        <div className="text-center">
                            <Building2 size={56} className="text-warning mx-auto mb-2" />
                            <span className="text-on-primary/70 text-xs font-bold block">نحن ننتظرك</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
        <div className="absolute bottom-0 end-0 w-full h-10 md:h-16 bg-gradient-to-t from-background to-transparent" />
    </section>
);
