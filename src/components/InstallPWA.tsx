import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, X, Download, Smartphone, Monitor, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

export const InstallPWA = () => {
    const location = useLocation();
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showTrigger, setShowTrigger] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    // Show only on specific public pages as requested
    const allowedPaths = ['/', '/home', '/about', '/courses', '/login'];
    const isPublicPage = allowedPaths.includes(location.pathname);

    useEffect(() => {
        // Advanced iOS/iPadOS detection
        const isIOSDevice =
            /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        setIsIOS(!!isIOSDevice);

        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowTrigger(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
            setShowTrigger(false);
        } else if (isIOSDevice) {
            // For iOS, show trigger if not already installed
            setShowTrigger(true);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (isIOS) {
            // Modal shows manual steps
            return;
        }

        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowTrigger(false);
        }
        setDeferredPrompt(null);
        setShowModal(false);
    };

    if (!showTrigger) return null;

    return (
        <>
            {/* Sharp Pulsing Bell Trigger */}
            <button
                onClick={() => setShowModal(true)}
                className="fixed bottom-4 right-4 z-[100] w-12 h-12 bg-[#D4AF37] text-white shadow-2xl flex items-center justify-center group hover:scale-110 transition-all duration-300 border-2 border-white/20"
                style={{ borderRadius: '0' }} // Explicitly sharp
                title="تثبيت المنصة"
            >
                <div className="absolute inset-0 bg-white animate-ping opacity-20"></div>
                <Bell size={20} className="relative z-10 group-hover:rotate-12 transition-transform" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 border border-white"></span>
            </button>

            {/* Sharp Premium Installation Modal */}
            <div className={cn(
                "fixed inset-0 z-[110] flex items-center justify-center p-4 transition-all duration-500",
                showModal ? "opacity-100 pointer-events-auto bg-gray-950/60" : "opacity-0 pointer-events-none"
            )}>
                {/* Backdrop with Safari support */}
                <div className="absolute inset-0 -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);" onClick={() => setShowModal(false)}></div>

                <div className={cn(
                    "relative bg-white dark:bg-gray-900 w-full max-w-sm rounded-none border-4 border-[#D4AF37] shadow-[0_0_50px_rgba(212,175,55,0.3)] overflow-hidden transition-all duration-500 transform",
                    showModal ? "translate-y-0 scale-100" : "translate-y-12 scale-95"
                )}>
                    {/* Header */}
                    <div className="relative h-28 bg-gray-900 p-6 flex flex-col justify-end">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 left-4 p-2 bg-white/5 hover:bg-white/10 text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="relative z-10 inline-flex items-center gap-2 px-2 py-1 bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-none w-fit mb-2">
                            <Monitor size={10} className="text-[#D4AF37]" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37]">تطبيق منصة دارين الجاهز</span>
                        </div>
                        <h2 className="text-xl font-black text-white leading-tight uppercase tracking-tighter">تثبيت التطبيق الفوري</h2>
                    </div>

                    <div className="p-6 space-y-5">
                        <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed font-bold text-right border-r-4 border-[#D4AF37] pr-4">
                            هل تود تثبيت المنصة على جهازك؟ ستحصل على سرعة فائقة في التصفح وإشعارات فورية لآخر التحديثات.
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-none border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-2 text-center group hover:bg-[#D4AF37]/5 transition-colors">
                                <Smartphone size={24} className="text-[#D4AF37]" />
                                <span className="text-[10px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">للهواتف</span>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-none border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-2 text-center group hover:bg-[#D4AF37]/5 transition-colors">
                                <Monitor size={24} className="text-[#D4AF37]" />
                                <span className="text-[10px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">للكمبيوتر</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {isIOS ? (
                                <div className="bg-[#D4AF37]/5 p-5 border border-[#D4AF37]/20">
                                    <p className="text-xs font-black text-gray-900 dark:text-white mb-4 text-center bg-white dark:bg-gray-800 py-2 shadow-sm uppercase tracking-tighter">خطوات التثبيت (آيفون/آيباد)</p>
                                    <ol className="text-[11px] text-gray-700 dark:text-gray-300 space-y-3 text-right font-bold">
                                        <li className="flex items-center gap-3">
                                            <span className="w-5 h-5 bg-[#D4AF37] text-white flex items-center justify-center text-[10px]">1</span>
                                            <span>اضغط على أيقونة <strong>المشاركة</strong> 📤</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <span className="w-5 h-5 bg-[#D4AF37] text-white flex items-center justify-center text-[10px]">2</span>
                                            <span>اختر <strong>إضافة للشاشة الرئيسية</strong> ➕</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <span className="w-5 h-5 bg-[#D4AF37] text-white flex items-center justify-center text-[10px]">3</span>
                                            <span>اضغط على <strong>إضافة</strong> بالزاوية ✅</span>
                                        </li>
                                    </ol>
                                </div>
                            ) : (
                                <button
                                    onClick={handleInstall}
                                    className="w-full py-4 bg-gray-900 text-white font-black hover:bg-black transition-all flex items-center justify-center gap-3 group border-b-4 border-[#D4AF37] active:translate-y-1"
                                >
                                    <Download size={20} className="group-hover:animate-bounce" />
                                    <span className="uppercase tracking-[0.2em] text-xs">تثبيت الآن مجاناً</span>
                                </button>
                            )}

                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full py-3 text-gray-400 hover:text-gray-900 font-black text-[10px] uppercase tracking-widest transition-colors"
                            >
                                إغلاق النافذة
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
