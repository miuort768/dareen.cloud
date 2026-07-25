import { motion } from 'framer-motion';
import { Image } from '../../shared/components/ui';

export const PageLoader = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-surface dark:bg-background overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 dark:bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 dark:bg-primary/20 rounded-full blur-[120px] animate-pulse" />

            {/* Center - Logo */}
            <div className="flex-1 flex items-center justify-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative"
                >
                    <div className="absolute inset-0 rounded-full bg-primary/30 dark:bg-primary/40 animate-ping opacity-20" />
                    <div className="absolute inset-[-15px] rounded-full border-2 border-primary/5 dark:border-primary/10 animate-[spin_8s_linear_infinite]" />
                    <div className="absolute inset-[-30px] rounded-full border border-primary/5 dark:border-primary/10 animate-[spin_12s_linear_reverse_infinite]" />

                    <div className="relative w-44 h-44 md:w-52 md:h-52 bg-white dark:bg-card rounded-full flex items-center justify-center shadow-[var(--shadow-glow)] p-3 border border-border dark:border-white/10 overflow-hidden">
                        <Image
                            src="/bbook.webp"
                            alt="بوابة دارين التعليمية"
                            className="w-full h-full"
                            imgClassName="object-contain"
                            loading="eager"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
                    </div>
                </motion.div>
            </div>

            {/* Bottom - Brand text + Loading */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="pb-16 md:pb-20 text-center space-y-6"
            >
                <div className="space-y-1">
                    <h2 className="text-3xl md:text-4xl font-heading font-medium text-main dark:text-main tracking-tighter">
                        دارين <span className="text-primary dark:text-primary">للتعليم والتدريب</span>
                    </h2>
                    <p className="text-muted dark:text-muted font-medium text-micro md:text-xs tracking-label uppercase">
                        Darin of Education & Training
                    </p>
                </div>

                <div className="w-56 h-1 bg-surface dark:bg-surface overflow-hidden relative mx-auto border border-border/50 dark:border-border/30">
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent w-full"
                    />
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut", delay: 0.2 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent w-full"
                    />
                </div>

                <div className="flex flex-col items-center gap-2">
                    <span className="text-micro font-medium text-primary dark:text-primary animate-pulse tracking-label uppercase">
                        جاري تهيئة النظام
                    </span>
                    <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={`dot-${i}`}
                                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                className="w-1 h-1 bg-primary rounded-full"
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
