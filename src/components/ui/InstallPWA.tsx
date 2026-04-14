import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

export const InstallPWA = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Initial check for standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        
        if (!isStandalone) {
            // Check if dismissed before
            const isDismissed = sessionStorage.getItem('pwa_dismissed');
            if (!isDismissed) {
                // Show after 1 second for better UX and catch initial load
                const timer = setTimeout(() => setIsVisible(true), 1200);
                return () => clearTimeout(timer);
            }
        }
    }, []);

    const handleInstallClick = async () => {
        const deferredPrompt = (window as any).deferredPrompt;
        
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') setIsVisible(false);
            (window as any).deferredPrompt = null;
        } else {
            // Help for manual install if prompt wasn't fired yet
            alert('لتثبيت التطبيق على جهازك:\n- على Android/Chrome: اضغط على الثلاث نقاط بالأعلى ثم اختر "Install App".\n- على iPhone/Safari: اضغط على زر "Share" ثم اختر "Add to Home Screen".');
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-[500] animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="bg-yellow-400 dark:bg-yellow-500 border-2 border-gray-950 p-2 shadow-[2px_2px_0px_0px_black] relative flex items-center justify-between gap-3 max-w-[280px] ml-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-black text-yellow-400 flex items-center justify-center border-2 border-yellow-800 shadow-[1px_1px_0px_0px_black] shrink-0">
                        {window.innerWidth > 768 ? <Monitor size={16} /> : <Smartphone size={16} />}
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-[11px] font-black uppercase text-black leading-tight">ثبت التطبيق</h2>
                        <p className="font-bold text-[8px] text-black/80">أسرع وأسهل للاستخدام</p>
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <button 
                        onClick={handleInstallClick}
                        className="px-2 py-1.5 bg-black text-yellow-400 font-extrabold uppercase text-[9px] shadow-[1px_1px_0px_0px_gray] hover:bg-white hover:text-black transition-all flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5"
                    >
                        <Download size={12} />
                        تثبيت
                    </button>
                    <button 
                        onClick={() => {
                            setIsVisible(false);
                            sessionStorage.setItem('pwa_dismissed', 'true');
                        }}
                        className="p-1.5 bg-black/10 text-black hover:bg-red-600 hover:text-white transition-colors"
                    >
                        <X size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
};
