import { useState, useEffect } from 'react';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Small delay to trigger fade in
    const fadeTimer = setTimeout(() => setIsVisible(true), 100);

    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(onComplete, 600); 
    }, 3500); 

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-all duration-700 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'} ${isFadingOut ? 'opacity-0 scale-105 blur-sm' : 'scale-100 blur-0'}`}
    >
      {/* Premium Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]"></div>
        
        {/* Sharp Lines - Brutalist Style */}
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] dark:opacity-[0.05]">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-indigo-500 -rotate-45"></div>
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-purple-500 rotate-45"></div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Container with Enhanced Animations */}
        <div className="relative w-48 h-48 md:w-64 md:h-64 mb-10 transform transition-all duration-1000 ease-out group">
          <div className="absolute inset-4 bg-gradient-to-br from-indigo-500/30 to-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute inset-0 border border-indigo-500/20 rounded-full animate-spin-slow"></div>
          <div className="absolute inset-8 border border-dashed border-purple-500/20 rounded-full animate-reverse-spin-slow"></div>
          
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="relative w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(79,70,229,0.3)] animate-float"
          />
        </div>

        {/* Brand Typography */}
        <div className="text-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
          <h1 className="text-4xl md:text-6xl font-heading font-medium text-slate-900 dark:text-white mb-4 tracking-tighter">
            دارين <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">السابعة</span>
          </h1>
          
          <div className="flex flex-col items-center gap-3">
            <p className="text-[10px] md:text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.4em] translate-x-[0.2em]">
              للتعليم والتدريب
            </p>
            <div className="flex items-center gap-1">
              <div className="h-[2px] w-8 bg-gradient-to-r from-transparent to-indigo-500"></div>
              <div className="h-1 w-1 bg-indigo-500 rounded-full animate-ping"></div>
              <div className="h-[2px] w-8 bg-gradient-to-l from-transparent to-indigo-500"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator - High-end style */}
      <div className="absolute bottom-20 w-64 md:w-80">
        <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden border border-white/5">
          <div className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-loading-bar-smooth shadow-[0_0_15px_rgba(79,70,229,0.5)]"></div>
        </div>
        <div className="mt-3 flex justify-between items-center text-[8px] font-medium text-slate-400 dark:text-slate-600 uppercase tracking-widest px-1">
          <span>جاري التحميل</span>
          <span className="animate-pulse">يرجى الانتظار</span>
        </div>
      </div>
      
      <style>{`
        @keyframes loading-bar-smooth {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes reverse-spin-slow {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-loading-bar-smooth {
          animation: loading-bar-smooth 2s infinite ease-in-out;
        }
        .animate-float {
          animation: float 4s infinite ease-in-out;
        }
        .animate-spin-slow {
          animation: spin-slow 12s infinite linear;
        }
        .animate-reverse-spin-slow {
          animation: reverse-spin-slow 15s infinite linear;
        }
      `}</style>
    </div>
  );
};
