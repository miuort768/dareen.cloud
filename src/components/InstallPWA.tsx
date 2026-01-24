import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, X, Download, Smartphone, Monitor, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

export const InstallPWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showTrigger, setShowTrigger] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const location = useLocation();

    // Only show on specific public pages
    const isPublicPage = ['/', '/courses', '/about'].includes(location.pathname);

    useEffect(() => {
        // Detect iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIOSDevice);

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
        } else if (isIOSDevice && !(window.navigator as any).standalone) {
            // For iOS, show trigger if not already installed
            setShowTrigger(true);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (isIOS) {
            // For iOS, just show the modal with instructions
            // The modal will display manual steps
            return;
        }

        if (!deferredPrompt) return;

        // Show the prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            // console.log('User accepted the install prompt');
            setShowTrigger(false);
        } else {
            // console.log('User dismissed the install prompt');
        }

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setShowModal(false);
    };

    if (!showTrigger || !isPublicPage) return null;

    return (
        <>
            {/* Pulsing Bell Trigger */}
            <button
                onClick={() => setShowModal(true)}
                className="fixed bottom-4 lg:bottom-5 right-6 z-[100] w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-700 text-white rounded-full shadow-[0_8px_32px_rgba(37,99,235,0.4)] flex items-center justify-center group animate-bounce-slow hover:scale-110 transition-all duration-500"
                title="تثبيت المنصة"
            >
                <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20"></div>
                <Bell size={20} className="relative z-10 group-hover:rotate-12 transition-transform" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Premium Installation Modal */}
            <div className={cn(
                "fixed inset-0 z-[110] flex items-center justify-center p-4 transition-all duration-500",
                showModal ? "opacity-100 pointer-events-auto backdrop-blur-md bg-gray-950/40" : "opacity-0 pointer-events-none"
            )}>
                <div className={cn(
                    "bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-700 transform",
                    showModal ? "translate-y-0 scale-100" : "translate-y-12 scale-95"
                )}>
                    {/* Header with Background Decorative elements */}
                    <div className="relative h-32 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 p-6 flex flex-col justify-end overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl"></div>

                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 left-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <div className="relative z-10 inline-flex items-center gap-2 px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 w-fit mb-2">
                            <Sparkles size={12} className="text-gold" />
                            <span className="text-[9px] font-black uppercase tracking-[0.1em] text-white">تطبيق معهد دارين</span>
                        </div>
                        <h2 className="text-lg md:text-xl font-black text-white leading-tight">تثبيت المنصة على جهازك</h2>
                    </div>

                    <div className="p-5 space-y-4">
                        <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm leading-relaxed font-medium text-right">
                            استمتع بتجربة تعليمية أسرع وأفضل من خلال تثبيت تطبيق معهد دارين. ستحصل على وصول فوري، إشعارات فورية، وأداء أكثر استقراراً.
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100/50 dark:border-blue-800/30 flex flex-col items-center gap-2 text-center">
                                <div className="p-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-blue-600">
                                    <Smartphone size={20} />
                                </div>
                                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">للهواتف</span>
                            </div>
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/30 flex flex-col items-center gap-2 text-center">
                                <div className="p-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-emerald-600">
                                    <Monitor size={20} />
                                </div>
                                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">للكمبيوتر</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                            <ShieldCheck className="text-emerald-500 shrink-0" size={16} />
                            <p className="text-[9px] text-gray-500 font-bold">تطبيق آمن ومعتمد وخفيف المساحة على الذاكرة</p>
                        </div>

                        <div className="flex flex-col gap-2 pt-1">
                            {isIOS ? (
                                <div className="space-y-3">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                                        <p className="text-xs font-bold text-blue-900 dark:text-blue-300 mb-3 text-right">خطوات التثبيت على iPhone/iPad:</p>
                                        <ol className="text-xs text-blue-800 dark:text-blue-400 space-y-2 text-right">
                                            <li className="flex items-start gap-2">
                                                <span className="font-black">1.</span>
                                                <span>اضغط على زر <strong>المشاركة</strong> 📤 في شريط Safari السفلي</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="font-black">2.</span>
                                                <span>اختر <strong>"إضافة إلى الشاشة الرئيسية"</strong> ➕</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="font-black">3.</span>
                                                <span>اضغط <strong>"إضافة"</strong> في الزاوية العلوية ✅</span>
                                            </li>
                                        </ol>
                                    </div>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                                    >
                                        <span>فهمت، شكراً!</span>
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={handleInstall}
                                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Download size={18} />
                                        <span>تثبيت الآن مجاناً</span>
                                    </button>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="w-full py-2 text-gray-400 hover:text-gray-600 font-bold text-[11px] transition-colors"
                                    >
                                        ربما لاحقاً
                                    </button>
                                </>
                            )}
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
