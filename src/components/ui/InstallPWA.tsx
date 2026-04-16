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
        // Already installed as standalone app - don't show
        if (isStandaloneMode()) return;

        // Already permanently dismissed
        if (localStorage.getItem('pwa_dismissed_permanent')) return;

        const detectedPlatform = detectPlatform();
        setPlatform(detectedPlatform);

        // Listen for native install prompt (Android / Chrome / Edge / Windows)
        const handleBeforeInstall = (e: Event) => {
            e.preventDefault();
            deferredPromptRef.current = e;
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstall as EventListener);

        // Show banner for ALL non-installed platforms after short delay
        const dismissed = sessionStorage.getItem('pwa_dismissed_session');
        if (!dismissed) {
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => {
                clearTimeout(timer);
                window.removeEventListener('beforeinstallprompt', handleBeforeInstall as EventListener);
            };
        }

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
            deferredPromptRef.current.prompt();
            const { outcome } = await deferredPromptRef.current.userChoice;
            if (outcome === 'accepted') {
                setIsVisible(false);
                localStorage.setItem('pwa_dismissed_permanent', 'true');
            }
            deferredPromptRef.current = null;
        }
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
                <div className="bg-white dark:bg-gray-900 border-2 border-gray-950 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] w-full max-w-sm animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-yellow-400 border-b-2 border-gray-950 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Smartphone size={18} className="text-black" />
                            <h2 className="font-black text-sm text-black uppercase tracking-tighter">
                                تثبيت تطبيق دارين
                            </h2>
                        </div>
                        <button onClick={handleDismiss} className="p-1 hover:bg-black/10 transition-colors">
                            <X size={16} className="text-black" />
                        </button>
                    </div>

                    {/* Steps */}
                    <div className="p-4 space-y-3">
                        {isIOS ? (
                            <>
                                <p className="text-[11px] font-bold text-gray-500 mb-3">اتبعي هذه الخطوات في Safari:</p>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <span className="w-6 h-6 bg-yellow-400 border border-gray-950 flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                                    <div>
                                        <p className="text-xs font-black text-gray-800 dark:text-white flex items-center gap-1">
                                            اضغطي على زر المشاركة <Share size={12} className="text-blue-500" />
                                        </p>
                                        <p className="text-[10px] text-gray-500">في أسفل شاشة المتصفح</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <span className="w-6 h-6 bg-yellow-400 border border-gray-950 flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                                    <div>
                                        <p className="text-xs font-black text-gray-800 dark:text-white">مرري للأسفل</p>
                                        <p className="text-[10px] text-gray-500">في قائمة المشاركة</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <span className="w-6 h-6 bg-yellow-400 border border-gray-950 flex items-center justify-center text-[10px] font-black shrink-0">3</span>
                                    <div>
                                        <p className="text-xs font-black text-gray-800 dark:text-white">اضغطي "Add to Home Screen"</p>
                                        <p className="text-[10px] text-gray-500">ثم اضغطي "Add" للتأكيد</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-[11px] font-bold text-gray-500 mb-3">اتبع هذه الخطوات في Safari (Mac):</p>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <span className="w-6 h-6 bg-yellow-400 border border-gray-950 flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                                    <p className="text-xs font-black text-gray-800 dark:text-white">اضغط على القائمة File ثم "Add to Dock"</p>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <span className="w-6 h-6 bg-yellow-400 border border-gray-950 flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                                    <p className="text-xs font-black text-gray-800 dark:text-white">أو استخدم Chrome/Edge للتثبيت التلقائي</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex border-t-2 border-gray-950">
                        <button
                            onClick={handleDismissPermanent}
                            className="flex-1 py-3 text-[10px] font-black text-gray-500 hover:bg-gray-50 transition-colors border-r border-gray-200"
                        >
                            عدم التذكير مجدداً
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="flex-1 py-3 text-[10px] font-black bg-yellow-400 text-black hover:bg-yellow-500 transition-colors"
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
            <div className={`bg-yellow-400 dark:bg-yellow-500 border-2 border-gray-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 p-3 ${
                isDesktop ? 'max-w-[300px] ml-auto' : ''
            }`}>
                <div className="w-9 h-9 bg-black text-yellow-400 flex items-center justify-center border-2 border-gray-950 shrink-0">
                    {isDesktop ? <Monitor size={18} /> : <Smartphone size={18} />}
                </div>

                <div className="flex-1 min-w-0">
                    <h2 className="text-[12px] font-black uppercase text-black leading-tight">ثبتي التطبيق</h2>
                    <p className="font-bold text-[9px] text-black/70 truncate">
                        {platform === 'ios-safari' || platform === 'mac-safari'
                            ? 'اضغطي Share ← Add to Home Screen'
                            : 'أسرع وأسهل — يعمل بدون إنترنت'}
                    </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={handleInstall}
                        className="px-3 py-2 bg-black text-yellow-400 font-black uppercase text-[9px] hover:bg-gray-900 transition-all flex items-center gap-1 active:translate-y-0.5 shadow-[2px_2px_0px_0px_gray]"
                    >
                        {isIOS || isMacSafari ? <Share size={11} /> : <Download size={11} />}
                        {isIOS || isMacSafari ? 'كيف؟' : 'تثبيت'}
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="p-2 bg-black/10 text-black hover:bg-red-600 hover:text-white transition-colors"
                    >
                        <X size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
};
