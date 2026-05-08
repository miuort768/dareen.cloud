import { motion } from 'framer-motion';

export const PageLoader = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-slate-950 overflow-hidden">
            {/* Background Accents - Premium Sharp Identity */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 dark:bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 dark:bg-purple-500/20 rounded-full blur-[120px] animate-pulse" />

            <div className="relative flex flex-col items-center gap-10">
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
                    {/* Pulsing Rings with New Colors */}
                    <div className="absolute inset-0 rounded-full bg-indigo-500/30 dark:bg-indigo-500/40 animate-ping opacity-20" />
                    <div className="absolute inset-[-15px] rounded-full border-2 border-indigo-500/5 dark:border-indigo-500/10 animate-[spin_8s_linear_infinite]" />
                    <div className="absolute inset-[-30px] rounded-full border border-purple-500/5 dark:border-purple-500/10 animate-[spin_12s_linear_reverse_infinite]" />

                    <div className="relative w-36 h-36 md:w-44 md:h-44 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.15)] p-3 border border-slate-200 dark:border-white/10 overflow-hidden">
                        <img
                            src="/dareen_logo_new.jpg"
                            alt="Darin Logo"
                            className="w-full h-full object-contain scale-[1.35] drop-shadow-2xl"
                        />
                        {/* Internal Glass Reflection */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
                    </div>
                </motion.div>

                {/* Text and Progress Information */}
                <div className="text-center space-y-6">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-1"
                    >
                        <h2 className="text-3xl md:text-4xl font-heading font-black text-slate-900 dark:text-white tracking-tighter">
                            دارين <span className="text-indigo-600 dark:text-indigo-400">للتعليم والتدريب</span>
                        </h2>
                        <p className="text-slate-400 dark:text-slate-500 font-black text-[10px] md:text-xs tracking-[0.4em] uppercase">
                            Darin of Education & Training
                        </p>
                    </motion.div>

                    {/* Modern Loading Bar - Sharp Indigo Gradient */}
                    <div className="w-56 h-1 bg-slate-100 dark:bg-slate-800/50 rounded-none overflow-hidden relative mx-auto border border-slate-200/50 dark:border-slate-700/30">
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{
                                repeat: Infinity,
                                duration: 1.8,
                                ease: "easeInOut"
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-600 to-transparent w-full"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{
                                repeat: Infinity,
                                duration: 1.8,
                                ease: "easeInOut",
                                delay: 0.2
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent w-full"
                        />
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col items-center gap-2"
                    >
                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 animate-pulse tracking-[0.2em] uppercase">
                            جاري تهيئة النظام
                        </span>
                        <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{ 
                                        scale: [1, 1.5, 1],
                                        opacity: [0.3, 1, 0.3]
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1,
                                        delay: i * 0.2
                                    }}
                                    className="w-1 h-1 bg-indigo-500 rounded-full"
                                />
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

        </div>
    );
};
