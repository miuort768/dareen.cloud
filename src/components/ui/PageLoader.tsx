import { motion } from 'framer-motion';

export const PageLoader = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-slate-950 overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-[120px] animate-pulse" />

            <div className="relative flex flex-col items-center gap-8">
                {/* Logo Container with Modern Framing */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        duration: 0.8,
                        ease: [0.16, 1, 0.3, 1]
                    }}
                    className="relative"
                >
                    {/* Pulsing Rings */}
                    <div className="absolute inset-0 rounded-full bg-primary-500/20 dark:bg-primary-500/30 animate-ping opacity-20" />
                    <div className="absolute inset-[-10px] rounded-full border border-primary-500/10 dark:border-primary-500/20 animate-[spin_10s_linear_infinite]" />

                    <div className="relative w-32 h-32 md:w-40 md:h-40 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-2xl p-2 border border-slate-200 dark:border-white/10 overflow-hidden">
                        <img
                            src="/logo.png"
                            alt="Darin Logo"
                            className="w-full h-full object-contain scale-[1.35]"
                        />
                    </div>
                </motion.div>

                {/* Text and Progress Information */}
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            دارين لتعليم والتدريب
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm md:text-base tracking-widest mt-1 opacity-80 uppercase">
                            Darin of Education
                        </p>
                    </motion.div>

                    {/* Modern Loading Bar */}
                    <div className="w-48 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative mx-auto">
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{
                                repeat: Infinity,
                                duration: 1.5,
                                ease: "easeInOut"
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-600 to-transparent w-full"
                        />
                    </div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-xs font-black text-primary-600 dark:text-teal-400 animate-pulse tracking-[0.2em]"
                    >
                        جاري تهيئة واجهة المستخدم...
                    </motion.p>
                </div>
            </div>

        </div>
    );
};
