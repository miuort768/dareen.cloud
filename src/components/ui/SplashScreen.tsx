import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for fade out animation
    }, 2500); // Show for 2.5 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-white dark:bg-slate-950"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-red-500/10 rounded-full blur-3xl"
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, -90, 0],
                opacity: [0.1, 0.15, 0.1]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-green-600/10 rounded-full blur-3xl"
            />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.16, 1, 0.3, 1],
                delay: 0.2 
              }}
              className="relative w-32 h-32 md:w-40 md:h-40 mb-8"
            >
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse"></div>
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="relative w-full h-full object-contain drop-shadow-2xl"
              />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-center"
            >
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight font-heading">
                دارين <span className="text-red-600">السابعة</span>
              </h1>
              <div className="flex items-center justify-center gap-2">
                <div className="h-1 w-12 bg-red-500 rounded-full"></div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                  التميز التعليمي
                </p>
                <div className="h-1 w-12 bg-green-600 rounded-full"></div>
              </div>
            </motion.div>
          </div>

          {/* Loading Progress Bar */}
          <div className="absolute bottom-16 w-48 h-1 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              transition={{ duration: 2, ease: "easeInOut", delay: 0.3 }}
              className="h-full bg-gradient-to-r from-red-500 to-green-600"
            />
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-8 text-[10px] text-slate-400 font-medium tracking-widest uppercase"
          >
            Powered by Darin Tech
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
