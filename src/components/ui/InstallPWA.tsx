import { useState, useEffect, useRef } from 'react';
import { Download, X, Smartphone, Monitor, Share } from 'lucide-react';

type Platform = 'android-chrome' | 'ios-safari' | 'windows-edge' | 'mac-safari' | 'desktop-chrome' | 'other';

const detectPlatform = (): Platform => {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
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
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://');

export const InstallPWA = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [platform, setPlatform] = useState<Platform>('other');
    const [showIOSGuide, setShowIOSGuide] = useState(false);
    const deferredPromptRef = useRef<Event | null>(null);

    useEffect(() => {
        if (isStandaloneMode()) return;
        if (localStorage.getItem('pwa_dismissed_permanent')) return;

        const detectedPlatform = detectPlatform();
        setPlatform(detectedPlatform);

        const globalPrompt = (window as unknown as { deferredPrompt?: Event }).deferredPrompt;
        if (globalPrompt) {
            deferredPromptRef.current = globalPrompt;
            setIsVisible(true);
        }

        const handleBeforeInstall = (e: Event) => {
            e.preventDefault();
            deferredPromptRef.current = e;
            (window as unknown as { deferredPrompt: Event }).deferredPrompt = e;
            setIsVisible(true);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstall as EventListener);

        const timer = setTimeout(() => {
            if (!isStandaloneMode()) {
                setIsVisible(true);
            }
        }, 1000);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall as EventListener);
        };
    }, []);

    const handleInstall = async () => {
        if (platform === 'ios-safari' || platform === 'mac-safari') {
            setShowIOSGuide(true);
            return;
        }

        const globalPrompt2 = (window as unknown as { deferredPrompt?: Event }).deferredPrompt;
        if (globalPrompt2) {
            deferredPromptRef.current = globalPrompt2;
        }

        if (deferredPromptRef.current) {
            try {
                const promptEvent = deferredPromptRef.current as Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
                await promptEvent.prompt();
                const { outcome } = await promptEvent.userChoice;

                if (outcome === 'accepted') {
                    setIsVisible(false);
                    localStorage.setItem('pwa_dismissed_permanent', 'true');
                    (window as unknown as { deferredPrompt: null }).deferredPrompt = null;
                }
            } catch {
                setShowIOSGuide(true);
            } finally {
                deferredPromptRef.current = null;
            }
            return;
        }

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

    if (showIOSGuide) {
        return (
            <div className="fixed inset-0 z-[600] flex items-end justify-center bg-black/40 p-4">
                <div className="bg-card border-2 border-border shadow-elevation-3 w-full max-w-sm animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="bg-warning border-b-2 border-border px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Smartphone size={18} className="text-main" />
                            <h2 className="font-medium text-sm text-main uppercase tracking-tighter text-start">
                                ثبتي التطبيق
                            </h2>
                        </div>
                        <button onClick={handleDismiss} className="p-1 hover:bg-black/10 transition-colors">
                            <X size={16} className="text-main" />
                        </button>
                    </div>

                    <div className="p-4 space-y-3 bg-surface text-start">
                        {isIOS ? (
                            <>
                                <p className="text-xs font-normal text-muted mb-3">اتبعي هذه الخطوات في Safari:</p>
                                <div className="flex items-start gap-3 p-3 bg-background border border-border">
                                    <span className="w-6 h-6 bg-warning border border-border flex items-center justify-center text-micro font-medium shrink-0">1</span>
                                    <div>
                                        <p className="text-xs font-medium text-main flex items-center gap-1">
                                            اضغطي على زر المشاركة <Share size={12} className="text-info" />
                                        </p>
                                        <p className="text-micro text-muted">في أسفل شاشة المتصفح</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-background border border-border">
                                    <span className="w-6 h-6 bg-warning border border-border flex items-center justify-center text-micro font-medium shrink-0">2</span>
                                    <div>
                                        <p className="text-xs font-medium text-main">مرري للأسفل</p>
                                        <p className="text-micro text-muted">في قائمة المشاركة</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-background border border-border">
                                    <span className="w-6 h-6 bg-warning border border-border flex items-center justify-center text-micro font-medium shrink-0">3</span>
                                    <div>
                                        <p className="text-xs font-medium text-main">اضغطي "Add to Home Screen"</p>
                                        <p className="text-micro text-muted">ثم اضغطي "Add" للتأكيد</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-xs font-normal text-muted mb-3">اتبع هذا الدليل للتثبيت:</p>
                                <div className="flex items-start gap-3 p-3 bg-background border border-border">
                                    <span className="w-6 h-6 bg-warning border border-border flex items-center justify-center text-micro font-medium shrink-0">1</span>
                                    <p className="text-xs font-medium text-main">اضغط على القائمة ثم "Add to Home Screen"</p>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex border-t-2 border-border">
                        <button onClick={handleDismissPermanent} className="flex-1 py-3 text-micro font-medium text-muted hover:bg-surface transition-colors border-s border-border">عدم التذكير مجدداً</button>
                        <button onClick={handleDismiss} className="flex-1 py-3 text-micro font-medium bg-warning text-main hover:bg-warning transition-colors">فهمت، شكراً</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`fixed z-[500] animate-in slide-in-from-bottom-5 fade-in duration-500 ${
            isDesktop ? 'bottom-4 start-4' : 'bottom-4 end-3 start-3'
        }`}>
            <div className={`bg-success border border-white/10 flex items-center gap-3 p-2.5 rounded-[20px] ${
                isDesktop ? 'max-w-[280px] me-auto' : ''
            }`}>
                <div className="w-9 h-9 bg-white/10 text-on-success flex items-center justify-center rounded-[14px] shrink-0 border border-white/10">
                    {isDesktop ? <Monitor size={18} /> : <Smartphone size={18} />}
                </div>

                <div className="flex-1 min-w-0 text-start">
                    <h2 className="text-micro font-medium uppercase text-on-success leading-tight">ثبتي التطبيق</h2>
                    <p className="font-medium text-micro text-on-success/70 truncate mt-0.5">
                        {isIOS ? 'اضغطي Share ← Add to Home Screen' : 'أسرع وأسهل — يعمل بدون إنترنت'}
                    </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        onClick={handleInstall}
                        className="px-3 py-1.5 bg-success-soft text-success-dark font-medium uppercase text-micro rounded-lg hover:bg-success/20 transition-all flex items-center gap-1.5 active:scale-95"
                    >
                        {isIOS ? <Share size={10} /> : <Download size={10} />}
                        {isIOS ? 'كيف؟' : 'تثبيت'}
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="p-1.5 bg-white/10 text-on-success hover:bg-error hover:text-on-error transition-colors rounded-full"
                        aria-label="إغلاق"
                    >
                        <X size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
};
