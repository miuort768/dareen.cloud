import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export const InstallPWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            
            // Only show if not already installed (checking if app is in standalone mode)
            if (!window.matchMedia('(display-mode: standalone)').matches) {
                setIsVisible(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
            setIsVisible(false);
        }
        
        setDeferredPrompt(null);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-[200] animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="bg-white dark:bg-slate-900 border border-gold/30 rounded-2xl shadow-2xl p-4 max-w-sm flex items-center gap-4 relative overflow-hidden group">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-gold/10 transition-colors" />
                
                <div className="bg-gold/10 p-3 rounded-xl text-gold shrink-0">
                    <Smartphone size={24} />
                </div>
                
                <div className="flex-1">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white leading-tight">تثبيت تطبيق المنصة</h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mt-0.5">ثبت التطبيق الآن لسهولة الوصول واستلام التنبيهات الفورية</p>
                </div>

                <div className="flex flex-col gap-2">
                    <button 
                        onClick={handleInstallClick}
                        className="bg-gold text-white text-[11px] font-black px-4 py-2 rounded-lg hover:bg-gold/90 transition-all shadow-md shadow-gold/20 active:scale-95 flex items-center gap-2"
                    >
                        <Download size={14} />
                        تثبيت
                    </button>
                    <button 
                        onClick={() => setIsVisible(false)}
                        className="absolute -top-1 -right-1 bg-white dark:bg-slate-800 p-1 rounded-full shadow-sm text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <X size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
};
