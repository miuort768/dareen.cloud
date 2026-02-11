import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, X, Download, Smartphone, Monitor, Tablet } from 'lucide-react';
import { cn } from '../lib/utils';

export const InstallPWA = () => {
    const location = useLocation();
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showTrigger, setShowTrigger] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        const userAgent = navigator.userAgent.toLowerCase();
        const isIOSDevice =
            /ipad|iphone|ipod/.test(userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

        setIsIOS(!!isIOSDevice);

        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        if (isStandalone) {
            setShowTrigger(false);
        } else {
            setShowTrigger(true);
        }

        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowTrigger(true);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) {
            // Instead of alert, we'll keep the modal open and show instructions
            // which are already rendered based on !deferredPrompt state
            return;
        }

        try {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setShowTrigger(false);
            }
            setDeferredPrompt(null);
            setShowModal(false);
        } catch (err) {
            console.error('Install error:', err);
        }
    };

    const allowedPaths = ['/', '/about', '/courses', '/home'];
    const isVisiblePage = allowedPaths.includes(location.pathname);

    if (!isVisiblePage) return null;


    return (
        <>
            <style>
                {`
                    @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-10px); }
                    }
                    @keyframes shake {
                        0%, 100% { transform: rotate(0deg); }
                        25% { transform: rotate(10deg); }
                        75% { transform: rotate(-10px); }
                    }
                    .animate-float {
                        animation: float 3s ease-in-out infinite;
                    }
                    .animate-shake {
                        animation: shake 0.5s ease-in-out infinite;
                    }
                `}
            </style>

            <div className="fixed bottom-8 right-8 z-[99999] flex flex-col gap-6 items-center">
                {/* Premium PWA Bell Trigger */}
                {showTrigger && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="group relative w-16 h-16 bg-gradient-to-tr from-[#D4AF37] via-[#AA841B] to-[#5C450B] text-white shadow-[0_20px_50px_rgba(212,175,55,0.4)] flex items-center justify-center transition-all duration-700 hover:scale-110 active:scale-95 border-2 border-white/40 overflow-hidden"
                        style={{ borderRadius: '1.5rem', animation: 'float 4s ease-in-out infinite' }}
                        title="تحميل التطبيق"
                    >
                        {/* Shimmer animation */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                        {/* Background Glow */}
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        {/* Animated Ring */}
                        <div className="absolute inset-0 border-2 border-white/20 scale-100 group-hover:scale-150 transition-transform duration-700 rounded-2xl opacity-0 group-hover:opacity-100"></div>

                        <Bell size={28} className="relative z-10 group-hover:animate-shake drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />

                        {/* Status Notification Dot */}
                        <span className="absolute top-3 right-3 w-3.5 h-3.5 bg-red-500 border-2 border-white shadow-xl animate-pulse rounded-full"></span>
                    </button>
                )}

                {/* Universal Installation Modal (Enhanced Glassmorphism) */}
                <div className={cn(
                    "fixed inset-0 z-[100000] flex items-center justify-center p-4 transition-all duration-700",
                    showModal ? "opacity-100 pointer-events-auto bg-black/80" : "opacity-0 pointer-events-none"
                )}>
                    <div className="absolute inset-0"
                        style={{ backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)' }}
                        onClick={() => setShowModal(false)}
                    ></div>

                    <div className={cn(
                        "relative bg-white dark:bg-gray-950 w-full max-w-sm rounded-none border-[4px] border-[#D4AF37] shadow-[0_0_100px_rgba(212,175,55,0.3)] overflow-hidden transition-all duration-700 transform",
                        showModal ? "translate-y-0 scale-100" : "translate-y-32 scale-75 rotate-3"
                    )}>
                        {/* Header with richer graphics */}
                        <div className="relative h-40 bg-gray-950 p-8 flex flex-col justify-end overflow-hidden">
                            <div className="absolute top-0 right-0 w-60 h-60 bg-[#D4AF37]/20 -translate-y-1/2 translate-x-1/2 blur-[80px]"></div>
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-600/10 -translate-x-1/2 translate-y-1/2 blur-[60px]"></div>

                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-6 left-6 p-2.5 bg-white/10 hover:bg-white/20 hover:rotate-90 text-white transition-all duration-300"
                            >
                                <X size={24} />
                            </button>

                            <div className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-none w-fit mb-3">
                                <Sparkles size={14} className="text-[#D4AF37] animate-pulse" />
                                <span className="text-[11px] font-black uppercase tracking-[3px] text-[#D4AF37]">تطبيق معهد دارين</span>
                            </div>
                            <h2 className="text-3xl font-black text-white leading-none uppercase tracking-tighter text-right">ثبت منصتنا الآن</h2>
                        </div>

                        <div className="p-8 space-y-8 bg-white dark:bg-gray-950">
                            <div className="border-r-[6px] border-[#D4AF37] pr-5">
                                <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed font-black text-right">
                                    احصل على أفضل تجربة تعليمية! قم بتثبيت التطبيق للوصول السريع، الإشعارات الفورية، وتجربة سلسة في أي وقت.
                                </p>
                            </div>

                            <div className="flex justify-center gap-10 py-2 text-gray-400 dark:text-gray-600">
                                <Smartphone size={36} strokeWidth={1.5} className="hover:text-[#D4AF37] transition-colors" />
                                <Tablet size={36} strokeWidth={1.5} className="hover:text-[#D4AF37] transition-colors" />
                                <Monitor size={36} strokeWidth={1.5} className="hover:text-[#D4AF37] transition-colors" />
                            </div>

                            <div className="space-y-4 pt-4">
                                <button
                                    onClick={handleInstall}
                                    className="relative overflow-hidden w-full py-6 bg-gray-950 dark:bg-black text-white font-black hover:bg-[#D4AF37] hover:text-black transition-all duration-500 flex items-center justify-center gap-4 group border-b-[6px] border-[#D4AF37] active:transform active:translate-y-1 shadow-lg"
                                >
                                    <Download size={24} className="group-hover:animate-bounce" />
                                    <span className="uppercase tracking-[4px] text-xs">تثبيت التطبيق الآن</span>
                                </button>

                                {!deferredPrompt && (
                                    <p className="text-[10px] text-center text-gray-400 font-bold animate-pulse">
                                        {isIOS ? "اضغط على زر المشاركة ثم إضافة للشاشة الرئيسية" : "سيفتح المتصفح نافذة التثبيت بعد ثوانٍ..."}
                                    </p>
                                )}

                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-full py-4 text-gray-500 hover:text-black dark:hover:text-white font-black text-[11px] uppercase tracking-[4px] transition-colors flex items-center justify-center gap-2"
                                >
                                    إغلاق
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

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
