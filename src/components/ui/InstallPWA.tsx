import { useState, useEffect, useRef } from 'react';
import { Download, X, Smartphone, Monitor, Share } from 'lucide-react';

type Platform = 'android-chrome' | 'ios-safari' | 'windows-edge' | 'mac-safari' | 'desktop-chrome' | 'other';

const detectPlatform = (): Platform => {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isAndroid = /Android/.test(ua);
    const isMac = /Macintosh/.test(ua) && !isIOS;
    const isWindows = /Windows/.test(ua);
    const isChrome = /Chrome/.test(ua) && !/Edge|Edg/.test(ua);
    const isEdge = /Edg/.test(ua);
    const isSafari = /Safari/.test(ua) && !isChrome && !isEdge;

    if (isIOS) return 'ios-safari';
    if (isAndroid && isChrome) return 'android-chrome';
    if (isWindows && isEdge) return 'windows-edge';
    if (isWindows && isChrome) return 'desktop-chrome';
    if (isMac && isSafari) return 'mac-safari';
    if (isMac && isChrome) return 'desktop-chrome';
    return 'other';
};

const isStandaloneMode = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://');

export const InstallPWA = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [platform, setPlatform] = useState<Platform>('other');
    const [showIOSGuide, setShowIOSGuide] = useState(false);
    const deferredPromptRef = useRef<any>(null);

    useEffect(() => {
        // Already installed as standalone app
        if (isStandaloneMode()) return;

        // Already permanently dismissed
        if (localStorage.getItem('pwa_dismissed_permanent')) return;

        const detectedPlatform = detectPlatform();
        setPlatform(detectedPlatform);

        // ✅ KEY FIX: Use the early-captured prompt from main.tsx
        if ((window as any).deferredPrompt) {
            deferredPromptRef.current = (window as any).deferredPrompt;
        }

        // Also listen for future beforeinstallprompt events
        const handleBeforeInstall = (e: Event) => {
            e.preventDefault();
            deferredPromptRef.current = e;
            (window as any).deferredPrompt = e;
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstall as EventListener);

        // Show banner for all non-installed platforms
        // Reduced delay for better visibility
        const timer = setTimeout(() => setIsVisible(true), 500);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall as EventListener);
        };


        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall as EventListener);
        };
    }, []);

    const handleInstall = async () => {
        // iOS / Mac Safari: show step-by-step guide
        if (platform === 'ios-safari' || platform === 'mac-safari') {
            setShowIOSGuide(true);
            return;
        }

        // Android / Chrome / Edge: use native prompt
        if (deferredPromptRef.current) {
            try {
                deferredPromptRef.current.prompt();
                const { outcome } = await deferredPromptRef.current.userChoice;
                if (outcome === 'accepted') {
                    setIsVisible(false);
                    localStorage.setItem('pwa_dismissed_permanent', 'true');
                }
            } catch (err) {
                console.error('Install prompt failed:', err);
            } finally {
                deferredPromptRef.current = null;
            }
            return;
        }

        // Fallback for any platform without native prompt
        setShowIOSGuide(true);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        setShowIOSGuide(false);
        sessionStorage.setItem('pwa_dismissed_session', 'true');
    };

    const handleDismissPermanent = () => {
        setIsVisible(false);
        setShowIOSGuide(false);
        localStorage.setItem('pwa_dismissed_permanent', 'true');
    };

    if (!isVisible) return null;

    const isDesktop = platform === 'desktop-chrome' || platform === 'windows-edge';
    const isIOS = platform === 'ios-safari';
    const isMacSafari = platform === 'mac-safari';

    // iOS / Mac Safari Step-by-step guide
    if (showIOSGuide) {
        return (
            <div className="fixed inset-0 z-[600] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-slate-900 border-2 border-gray-950 dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_#4f46e5] w-full max-w-sm animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-yellow-400 dark:bg-indigo-600 border-b-2 border-gray-950 dark:border-white px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Smartphone size={18} className="text-black dark:text-white" />
                            <h2 className="font-black text-sm text-black dark:text-white uppercase tracking-tighter">
                                تطبيق دارين
                            </h2>
                        </div>
                        <button onClick={handleDismiss} className="p-1 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                            <X size={16} className="text-black dark:text-white" />
                        </button>
                    </div>

                    {/* Steps */}
                    <div className="p-4 space-y-3 dark:bg-slate-900">
                        {isIOS ? (
                            <>
                                <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-3">اتبعي هذه الخطوات في Safari:</p>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                                    <span className="w-6 h-6 bg-yellow-400 dark:bg-indigo-600 border border-gray-950 dark:border-white flex items-center justify-center text-[10px] font-black shrink-0 dark:text-white">1</span>
                                    <div>
                                        <p className="text-xs font-black text-gray-800 dark:text-slate-100 flex items-center gap-1">
                                            اضغطي على زر المشاركة <Share size={12} className="text-blue-500" />
                                        </p>
                                        <p className="text-[10px] text-gray-500 dark:text-slate-400">في أسفل شاشة المتصفح</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                                    <span className="w-6 h-6 bg-yellow-400 dark:bg-indigo-600 border border-gray-950 dark:border-white flex items-center justify-center text-[10px] font-black shrink-0 dark:text-white">2</span>
                                    <div>
                                        <p className="text-xs font-black text-gray-800 dark:text-slate-100">مرري للأسفل</p>
                                        <p className="text-[10px] text-gray-500 dark:text-slate-400">في قائمة المشاركة</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                                    <span className="w-6 h-6 bg-yellow-400 dark:bg-indigo-600 border border-gray-950 dark:border-white flex items-center justify-center text-[10px] font-black shrink-0 dark:text-white">3</span>
                                    <div>
                                        <p className="text-xs font-black text-gray-800 dark:text-slate-100">اضغطي "Add to Home Screen"</p>
                                        <p className="text-[10px] text-gray-500 dark:text-slate-400">ثم اضغطي "Add" للتأكيد</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-3">اتبع هذا الدليل للتثبيت:</p>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                                    <span className="w-6 h-6 bg-yellow-400 dark:bg-indigo-600 border border-gray-950 dark:border-white flex items-center justify-center text-[10px] font-black shrink-0 dark:text-white">1</span>
                                    <p className="text-xs font-black text-gray-800 dark:text-slate-100">اضغطي على القائمة ثم "Add to Home Screen"</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex border-t-2 border-gray-950 dark:border-slate-700">
                        <button
                            onClick={handleDismissPermanent}
                            className="flex-1 py-3 text-[10px] font-black text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border-r border-gray-200 dark:border-slate-700"
                        >
                            عدم التذكير مجدداً
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="flex-1 py-3 text-[10px] font-black bg-yellow-400 dark:bg-indigo-600 text-black dark:text-white hover:bg-yellow-500 dark:hover:bg-indigo-700 transition-colors"
                        >
                            فهمت، شكراً
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Standard install banner (Android, Chrome, Edge)
    return (
        <div className={`fixed z-[500] animate-in slide-in-from-bottom-5 fade-in duration-500 ${
            isDesktop
                ? 'bottom-4 right-4'
                : 'bottom-4 left-2 right-2'
        }`}>
            <div className={`bg-yellow-400 dark:bg-slate-900/95 dark:backdrop-blur-xl border-2 border-gray-950 dark:border-indigo-500/50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#4f46e5] flex items-center gap-3 p-3 ${
                isDesktop ? 'max-w-[300px] ml-auto' : ''
            }`}>
                <div className="w-9 h-9 bg-black dark:bg-indigo-600 text-yellow-400 dark:text-white flex items-center justify-center border-2 border-gray-950 dark:border-white shrink-0">
                    {isDesktop ? <Monitor size={18} /> : <Smartphone size={18} />}
                </div>

                <div className="flex-1 min-w-0">
                    <h2 className="text-[12px] font-black uppercase text-black dark:text-white leading-tight">تطبيق دارين</h2>
                    <p className="font-bold text-[9px] text-black/70 dark:text-slate-400 truncate">
                        {platform === 'ios-safari' || platform === 'mac-safari'
                            ? 'اضغطي Share ← Add to Home Screen'
                            : 'أسرع وأسهل — مجاني'}
                    </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={handleInstall}
                        className="px-3 py-2 bg-black dark:bg-indigo-600 text-yellow-400 dark:text-white font-black uppercase text-[10px] hover:bg-gray-900 dark:hover:bg-indigo-700 transition-all flex items-center gap-1 active:translate-y-0.5 shadow-[2px_2px_0px_0px_gray] dark:shadow-none"
                    >
                        {isIOS || isMacSafari ? <Share size={11} /> : <Download size={11} />}
                        {isIOS || isMacSafari ? 'كيف؟' : 'تثبيت'}
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="p-2 bg-black/10 dark:bg-white/10 text-black dark:text-white hover:bg-red-600 hover:text-white transition-colors"
                    >
                        <X size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
};
