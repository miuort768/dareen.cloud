import { useState, useEffect } from 'react';
import { Bell, X, Download, Smartphone, Monitor } from 'lucide-react';
import { cn } from '../lib/utils';

export const InstallPWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showTrigger, setShowTrigger] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isFirefox, setIsFirefox] = useState(false);

    useEffect(() => {
        // Advanced Browser Detection
        const userAgent = navigator.userAgent.toLowerCase();

        const isIOSDevice =
            /ipad|iphone|ipod/.test(userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

        setIsIOS(!!isIOSDevice);
        setIsFirefox(userAgent.includes('firefox'));

        // Check if already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

        if (isStandalone) {
            setShowTrigger(false);
        } else {
            // SHOW BY DEFAULT on all browsers/devices if not installed
            setShowTrigger(true);
        }

        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // If beforeinstallprompt fires, we definitely want to show it (Chrome/Edge/Android)
            setShowTrigger(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (isIOS || (isFirefox && !deferredPrompt)) {
            // Manual instructions shown in modal
            return;
        }

        if (!deferredPrompt) {
            // Fallback for browsers without prompt: just guide them in the modal
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

    if (!showTrigger) return null;

    return (
        <>
            {/* Universal Sharp Pulsing Bell Trigger */}
            <button
                onClick={() => setShowModal(true)}
                className="fixed bottom-4 right-4 z-[100] w-12 h-12 bg-[#D4AF37] text-white shadow-2xl flex items-center justify-center group hover:scale-[1.15] transition-all duration-300 border-2 border-white/30"
                style={{ borderRadius: '0' }}
                title="تثبيت المنصة"
            >
                <div className="absolute inset-0 bg-white animate-ping opacity-25"></div>
                <Bell size={24} className="relative z-10 group-hover:rotate-12 transition-transform" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 border-2 border-white"></span>
            </button>

            {/* Universal Installation Modal */}
            <div className={cn(
                "fixed inset-0 z-[110] flex items-center justify-center p-4 transition-all duration-500",
                showModal ? "opacity-100 pointer-events-auto bg-black/70" : "opacity-0 pointer-events-none"
            )}>
                {/* Backdrop blur with Safari support */}
                <div className="absolute inset-0"
                    style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
                    onClick={() => setShowModal(false)}
                ></div>

                <div className={cn(
                    "relative bg-white dark:bg-gray-900 w-full max-w-sm rounded-none border-[3px] border-[#D4AF37] shadow-[0_0_60px_rgba(212,175,55,0.4)] overflow-hidden transition-all duration-500 transform",
                    showModal ? "translate-y-0 scale-100" : "translate-y-20 scale-90"
                )}>
                    {/* Header */}
                    <div className="relative h-32 bg-gray-950 p-6 flex flex-col justify-end">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/10 -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                        <div className="absolute top-0 left-0 w-20 h-20 bg-blue-600/5 -translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 left-4 p-2 bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="relative z-10 inline-flex items-center gap-2 px-3 py-1 bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-none w-fit mb-2">
                            <Sparkles size={12} className="text-[#D4AF37]" />
                            <span className="text-[10px] font-black uppercase tracking-[2px] text-[#D4AF37]">تطبيق معهد دارين</span>
                        </div>
                        <h2 className="text-2xl font-black text-white leading-none uppercase tracking-tighter">تثبيت التطبيق الفوري</h2>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="border-r-4 border-[#D4AF37] pr-4">
                            <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed font-bold text-right">
                                يمكنك الآن الوصول للمنصة بضغطة واحدة من خلال تثبيتها على جهازك كأي تطبيق آخر.
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-1 font-medium text-right uppercase">
                                يدعم جميع المتصفحات والأجهزة حول العالم
                            </p>
                        </div>

                        {/* Device Icons */}
                        <div className="flex justify-center gap-8 py-2 grayscale opacity-60">
                            <Smartphone size={32} strokeWidth={1} />
                            <Monitor size={32} strokeWidth={1} />
                        </div>

                        <div className="space-y-4">
                            {isIOS ? (
                                /* iOS Specific Instructions */
                                <div className="bg-gray-50 dark:bg-white/5 p-5 border border-gray-100 dark:border-white/10">
                                    <p className="text-[11px] font-black text-gray-900 dark:text-white mb-4 text-center bg-[#D4AF37] text-white py-2 uppercase tracking-widest">متصفح Safari (iOS)</p>
                                    <ol className="text-[11px] text-gray-700 dark:text-gray-400 space-y-4 text-right font-bold">
                                        <li className="flex items-center justify-end gap-3">
                                            <span>اضغط على أيقونة <strong>المشاركة</strong> بالأسفل 📤</span>
                                            <span className="w-5 h-5 border border-gray-900 dark:border-white flex items-center justify-center text-[9px]">1</span>
                                        </li>
                                        <li className="flex items-center justify-end gap-3">
                                            <span>اختر <strong>إضافة للشاشة الرئيسية</strong> ➕</span>
                                            <span className="w-5 h-5 border border-gray-900 dark:border-white flex items-center justify-center text-[9px]">2</span>
                                        </li>
                                        <li className="flex items-center justify-end gap-3">
                                            <span>اضغط على <strong>إضافة</strong> في الأعلى ✅</span>
                                            <span className="w-5 h-5 border border-gray-900 dark:border-white flex items-center justify-center text-[9px]">3</span>
                                        </li>
                                    </ol>
                                </div>
                            ) : isFirefox || !deferredPrompt ? (
                                /* Firefox or Other Manual Browsers (Desktop Safari, Firefox Android, etc.) */
                                <div className="bg-gray-50 dark:bg-white/5 p-5 border border-gray-100 dark:border-white/10">
                                    <p className="text-[11px] font-black text-gray-900 dark:text-white mb-4 text-center bg-gray-800 text-white py-2 uppercase tracking-widest">طريقة التثبيت اليدوي</p>
                                    <p className="text-[10px] text-gray-600 dark:text-gray-400 mb-4 text-center leading-relaxed">متصفحك الحالي يتطلب خطوة واحدة:</p>
                                    <ol className="text-[11px] text-gray-700 dark:text-gray-400 space-y-4 text-right font-bold">
                                        <li className="flex items-center justify-end gap-3">
                                            <span>افتح <strong>قائمة المتصفح</strong> (3 نقاط أو خطوط) ☰</span>
                                            <span className="w-6 h-6 bg-gray-100 dark:bg-white/10 flex items-center justify-center text-[9px]">1</span>
                                        </li>
                                        <li className="flex items-center justify-end gap-3">
                                            <span>اختر <strong>"تثبيت التطبيق"</strong> أو <strong>"إضافة للهاتف"</strong> 📲</span>
                                            <span className="w-6 h-6 bg-gray-100 dark:bg-white/10 flex items-center justify-center text-[9px]">2</span>
                                        </li>
                                    </ol>
                                </div>
                            ) : (
                                /* Standard Chrome/Android/Edge (Official Prompt) */
                                <button
                                    onClick={handleInstall}
                                    className="w-full py-5 bg-gray-900 text-white font-black hover:bg-black transition-all flex items-center justify-center gap-4 group border-b-[5px] border-[#D4AF37] active:transform active:translate-y-1"
                                >
                                    <Download size={22} className="group-hover:animate-bounce" />
                                    <span className="uppercase tracking-[3px] text-xs">تثبيت التطبيق مجاناً</span>
                                </button>
                            )}

                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full py-3 text-gray-400 hover:text-black dark:hover:text-white font-black text-[10px] uppercase tracking-[3px] transition-colors"
                            >
                                ربما في وقت لاحق
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
