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
        // iOS / Mac Safari: show step-by-step guide
        if (platform === 'ios-safari' || platform === 'mac-safari') {
            setShowIOSGuide(true);
            return;
        }

        // Try to get the prompt again from window just in case ref was lost
        const globalPrompt2 = (window as unknown as { deferredPrompt?: Event }).deferredPrompt;
        if (globalPrompt2) {
            deferredPromptRef.current = globalPrompt2;
        }

        // Android / Chrome / Edge: use native prompt
        if (deferredPromptRef.current) {
            try {
                const promptEvent = deferredPromptRef.current as Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
                await promptEvent.prompt();
                const { outcome } = await promptEvent.userChoice;
                console.log('User response to install prompt:', outcome);
                
                if (outcome === 'accepted') {
                    setIsVisible(false);
                    localStorage.setItem('pwa_dismissed_permanent', 'true');
                    (window as unknown as { deferredPrompt: null }).deferredPrompt = null;
                }
            } catch (err) {
                console.error('Install prompt failed:', err);
                setShowIOSGuide(true); // Fallback to manual if API fails
            } finally {
                deferredPromptRef.current = null;
            }
            return;
        }

        // Final Fallback: If no native prompt is allowed by browser, show manual guide
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

    if (showIOSGuide) {
        return (
            <div className="fixed inset-0 z-[600] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4">
                <div className="bg-white border-2 border-gray-950 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] w-full max-w-sm animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="bg-yellow-400 border-b-2 border-gray-950 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Smartphone size={18} className="text-black" />
                            <h2 className="font-black text-sm text-black uppercase tracking-tighter text-right">
                                ثبتي التطبيق
                            </h2>
                        </div>
                        <button onClick={handleDismiss} className="p-1 hover:bg-black/10 transition-colors">
                            <X size={16} className="text-black" />
                        </button>
                    </div>

                    <div className="p-4 space-y-3 bg-white text-right">
                        {isIOS ? (
                            <>
                                <p className="text-[11px] font-bold text-gray-500 mb-3">اتبعي هذه الخطوات في Safari:</p>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200">
                                    <span className="w-6 h-6 bg-yellow-400 border border-gray-950 flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                                    <div>
                                        <p className="text-xs font-black text-gray-800 flex items-center gap-1">
                                            اضغطي على زر المشاركة <Share size={12} className="text-blue-500" />
                                        </p>
                                        <p className="text-[10px] text-gray-500">في أسفل شاشة المتصفح</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200">
                                    <span className="w-6 h-6 bg-yellow-400 border border-gray-950 flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                                    <div>
                                        <p className="text-xs font-black text-gray-800">مرري للأسفل</p>
                                        <p className="text-[10px] text-gray-500">في قائمة المشاركة</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200">
                                    <span className="w-6 h-6 bg-yellow-400 border border-gray-950 flex items-center justify-center text-[10px] font-black shrink-0">3</span>
                                    <div>
                                        <p className="text-xs font-black text-gray-800">اضغطي "Add to Home Screen"</p>
                                        <p className="text-[10px] text-gray-500">ثم اضغطي "Add" للتأكيد</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-[11px] font-bold text-gray-500 mb-3">اتبع هذا الدليل للتثبيت:</p>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200">
                                    <span className="w-6 h-6 bg-yellow-400 border border-gray-950 flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                                    <p className="text-xs font-black text-gray-800">اضغط على القائمة ثم "Add to Home Screen"</p>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex border-t-2 border-gray-950">
                        <button onClick={handleDismissPermanent} className="flex-1 py-3 text-[10px] font-black text-gray-500 hover:bg-gray-50 transition-colors border-r border-gray-200">عدم التذكير مجدداً</button>
                        <button onClick={handleDismiss} className="flex-1 py-3 text-[10px] font-black bg-yellow-400 text-black hover:bg-yellow-500 transition-colors">فهمت، شكراً</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`fixed z-[500] animate-in slide-in-from-bottom-5 fade-in duration-500 ${
            isDesktop ? 'bottom-4 right-4' : 'bottom-4 left-3 right-3'
        }`}>
            <div className={`bg-[#064E3B] border border-white/10 backdrop-blur-md flex items-center gap-3 p-2.5 rounded-[20px] ${
                isDesktop ? 'max-w-[280px] ml-auto' : ''
            }`}>
                <div className="w-9 h-9 bg-white/10 text-white flex items-center justify-center rounded-[14px] shrink-0 backdrop-blur-sm border border-white/10">
                    {isDesktop ? <Monitor size={18} /> : <Smartphone size={18} />}
                </div>

                <div className="flex-1 min-w-0 text-right">
                    <h2 className="text-[10px] font-black uppercase text-white leading-tight">ثبتي التطبيق</h2>
                    <p className="font-medium text-[9px] text-white/70 truncate mt-0.5">
                        {isIOS || isMacSafari ? 'اضغطي Share ← Add to Home Screen' : 'أسرع وأسهل — يعمل بدون إنترنت'}
                    </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        onClick={handleInstall}
                        className="px-3 py-1.5 bg-white text-[#064E3B] font-black uppercase text-[9px] rounded-lg hover:bg-gray-100 transition-all flex items-center gap-1.5 active:scale-95"
                    >
                        {isIOS || isMacSafari ? <Share size={10} /> : <Download size={10} />}
                        {isIOS || isMacSafari ? 'كيف؟' : 'تثبيت'}
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="p-1.5 bg-white/10 text-white hover:bg-red-600 hover:text-white transition-colors rounded-full"
                    >
                        <X size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
};
