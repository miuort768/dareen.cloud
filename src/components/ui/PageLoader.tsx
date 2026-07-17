import { motion } from 'framer-motion';

export const PageLoader = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-white dark:bg-background overflow-hidden">
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

                    <div className="relative w-36 h-36 md:w-44 md:h-44 bg-white dark:bg-primary-active rounded-full flex items-center justify-center shadow-[0_0_50px_rgb(79_70_229_/_0.15)] p-3 border border-border dark:border-white/10 overflow-hidden">
                        <img
                            src="/dareen_logo_new.webp"
                            alt="شعار دارين للتعليم والتدريب"
                            className="w-full h-full object-contain scale-[1.35] drop-shadow-sm"
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
                    <h2 className="text-3xl md:text-4xl font-heading font-medium text-main dark:text-on-primary tracking-tighter">
                        دارين <span className="text-primary dark:text-primary">للتعليم والتدريب</span>
                    </h2>
                    <p className="text-muted dark:text-muted font-medium text-micro md:text-xs tracking-[0.4em] uppercase">
                        Darin of Education & Training
                    </p>
                </div>

                <div className="w-56 h-1 bg-surface dark:bg-primary-active/50 overflow-hidden relative mx-auto border border-border/50 dark:border-border/30">
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--bg-primary)] to-transparent w-full"
                    />
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut", delay: 0.2 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--bg-primary)]/50 to-transparent w-full"
                    />
                </div>

                <div className="flex flex-col items-center gap-2">
                    <span className="text-micro font-medium text-primary dark:text-primary animate-pulse tracking-[0.2em] uppercase">
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
