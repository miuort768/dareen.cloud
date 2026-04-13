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
        <div className="fixed bottom-10 right-4 left-4 md:left-auto md:right-10 z-[500] animate-in slide-in-from-right-20 fade-in duration-1000">
            <div className="bg-yellow-400 dark:bg-yellow-500 border-4 border-gray-950 p-6 md:p-8 max-w-sm shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] relative group overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute -top-10 -left-10 w-24 h-24 bg-black/5 rounded-full blur-2xl group-hover:bg-black/10 transition-all" />
                
                <button 
                    onClick={() => setIsVisible(false)}
                    className="absolute top-2 left-2 p-2 bg-black text-white hover:bg-red-600 transition-colors shadow-[2px_2px_0px_0px_white]"
                >
                    <X size={16} />
                </button>

                <div className="flex flex-col gap-6 text-black">
                    <div className="flex items-center gap-4 border-b-4 border-black pb-4">
                        <div className="w-16 h-16 bg-black text-yellow-400 flex items-center justify-center border-4 border-yellow-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] shrink-0 animate-bounce">
                            {window.innerWidth > 768 ? <Monitor size={32} /> : <Smartphone size={32} />}
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tighter leading-none">تثبيت التطبيق</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-70 italic">DAREEN_NATIVE_EXPERIENCE</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Zap size={20} className="shrink-0 mt-0.5" />
                            <p className="font-extrabold text-sm leading-snug">ثبت التطبيق الآن لسهولة الوصول واستلام التنبيهات الفورية على جهازك</p>
                        </div>
                        
                        <div className="flex items-center gap-3 bg-black/5 p-3 border-2 border-black border-dashed">
                            <Bell size={18} className="animate-pulse" />
                            <span className="text-[10px] font-black uppercase italic">PWA Notifications Enabled</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleInstallClick}
                        className="w-full py-5 bg-black text-yellow-400 font-black uppercase tracking-[0.2em] text-sm shadow-[8px_8px_0px_0px_rgba(255,255,255,0.4)] hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 active:translate-x-1 active:translate-y-1 active:shadow-none"
                    >
                        <Download size={20} />
                        ثبت التطبيق الآن
                    </button>
                    
                    <p className="text-center text-[8px] font-black uppercase opacity-40">أفضل تجربة تصفح للمسؤولين والمعلمين</p>
                </div>
            </div>
        </div>
    );
};
