import { useState, useEffect } from 'react';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Small delay to trigger fade in
    const fadeTimer = setTimeout(() => setIsVisible(true), 100);

    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(onComplete, 500); 
    }, 2000); 

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-white dark:bg-slate-950 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'} ${isFadingOut ? 'opacity-0' : ''}`}
    >
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-32 h-32 md:w-40 md:h-40 mb-8 transform transition-transform duration-1000 ease-out scale-110">
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse"></div>
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="relative w-full h-full object-contain"
          />
        </div>

        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
            دارين <span className="text-red-600">السابعة</span>
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="h-1 w-12 bg-red-500 rounded-full"></div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              التميز التعليمي
            </p>
            <div className="h-1 w-12 bg-green-600 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-16 w-48 h-1 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-red-500 to-green-600 animate-loading-bar"></div>
      </div>
      
      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};
