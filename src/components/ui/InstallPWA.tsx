import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Zap, Bell, Monitor } from 'lucide-react';

export const InstallPWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            
            // Check if not installed
            if (!window.matchMedia('(display-mode: standalone)').matches) {
                // Show after 2 seconds to ensure visibility
                setTimeout(() => setIsVisible(true), 2000);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Fallback for debugging/testing
        // setTimeout(() => setIsVisible(true), 3000);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            // If prompt is missing but user clicked, show helpful alert
            alert('خاصية التثبيت متوفرة في متصفح Chrome أو Edge. يرجى استخدام القائمة الجانبية للمتصفح (Install App).');
            return;
        }
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') setIsVisible(false);
        setDeferredPrompt(null);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-[500] animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="bg-yellow-400 dark:bg-yellow-500 border-2 border-gray-950 p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative flex items-center justify-between gap-3 max-w-sm ml-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black text-yellow-400 flex items-center justify-center border-2 border-yellow-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] shrink-0">
                        {window.innerWidth > 768 ? <Monitor size={20} /> : <Smartphone size={20} />}
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-sm font-black uppercase tracking-tighter leading-none text-black">تثبيت التطبيق</h2>
                        <p className="font-bold text-[10px] leading-snug text-black/80 mt-1">تنبيهات فورية ووصول أسرع</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button 
                        onClick={handleInstallClick}
                        className="px-3 py-2 bg-black text-yellow-400 font-black uppercase text-[10px] shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)] hover:bg-white hover:text-black transition-all flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    >
                        <Download size={14} />
                        تثبيت
                    </button>
                    <button 
                        onClick={() => setIsVisible(false)}
                        className="p-2 bg-black/10 text-black hover:bg-red-600 hover:text-white transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};
