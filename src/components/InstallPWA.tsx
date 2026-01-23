import { useState, useEffect } from 'react';
import { Bell, X, Download, Smartphone, Monitor, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

export const InstallPWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showTrigger, setShowTrigger] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            setShowTrigger(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setShowTrigger(false);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        // Show the prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
            setShowTrigger(false);
        } else {
            console.log('User dismissed the install prompt');
        }

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setShowModal(false);
    };

    if (!showTrigger) return null;

    return (
        <>
            {/* Pulsing Bell Trigger */}
            <button
                onClick={() => setShowModal(true)}
                className="fixed bottom-24 lg:bottom-8 right-6 z-[100] w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-700 text-white rounded-full shadow-[0_8px_32px_rgba(37,99,235,0.4)] flex items-center justify-center group animate-bounce-slow hover:scale-110 transition-all duration-500"
                title="تثبيت المنصة"
            >
                <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20"></div>
                <Bell size={24} className="relative z-10 group-hover:rotate-12 transition-transform" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Premium Installation Modal */}
            <div className={cn(
                "fixed inset-0 z-[110] flex items-center justify-center p-4 transition-all duration-500",
                showModal ? "opacity-100 pointer-events-auto backdrop-blur-md bg-gray-950/40" : "opacity-0 pointer-events-none"
            )}>
                <div className={cn(
                    "bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-700 transform",
                    showModal ? "translate-y-0 scale-100" : "translate-y-12 scale-95"
                )}>
                    {/* Header with Background Decorative elements */}
                    <div className="relative h-44 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 p-8 flex flex-col justify-end overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>

                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-6 left-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="relative z-10 inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 w-fit mb-4">
                            <Sparkles size={14} className="text-gold" />
                            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-white">تطبيق معهد دارين</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">تثبيت المنصة على جهازك</h2>
                    </div>

                    <div className="p-8 space-y-6">
                        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base leading-relaxed font-medium text-right">
                            استمتع بتجربة تعليمية أسرع وأفضل من خلال تثبيت تطبيق معهد دارين. ستحصل على وصول فوري، إشعارات فورية، وأداء أكثر استقراراً.
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100/50 dark:border-blue-800/30 flex flex-col items-center gap-3 text-center">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-blue-600">
                                    <Smartphone size={24} />
                                </div>
                                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">متوافق مع الهواتف</span>
                            </div>
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl border border-emerald-100/50 dark:border-emerald-800/30 flex flex-col items-center gap-3 text-center">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-emerald-600">
                                    <Monitor size={24} />
                                </div>
                                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">متوافق مع الكمبيوتر</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
                            <p className="text-[10px] text-gray-500 font-bold">تطبيق آمن ومعتمد وخفيف المساحة على ذاكرة الجهاز</p>
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                            <button
                                onClick={handleInstall}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3"
                            >
                                <Download size={20} />
                                <span>تثبيت الآن مجاناً</span>
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full py-4 text-gray-400 hover:text-gray-600 font-bold text-sm transition-colors"
                            >
                                ربما لاحقاً
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// Helper for icons used in the modal
const Sparkles = ({ size, className }: { size: number, className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="m5 3 1 1" />
        <path d="m19 17 1 1" />
        <path d="m19 3 1 1" />
        <path d="m5 17 1 1" />
    </svg>
);
