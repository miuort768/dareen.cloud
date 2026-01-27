import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Download, Smartphone, ShieldCheck } from 'lucide-react';
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
            {/* Reverting to the original Pulsing Bell Trigger as requested */}
            <button
                onClick={() => setShowModal(true)}
                className="fixed bottom-6 right-6 z-[100] w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-700 text-white rounded-full shadow-[0_8px_32px_rgba(37,99,235,0.4)] flex items-center justify-center group animate-bounce-slow transition-all duration-500 hover:scale-110"
                title="تثبيت المنصة"
            >
                <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20"></div>
                <Bell size={20} className="relative z-10 group-hover:rotate-12 transition-transform" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Premium Installation Modal */}
            <div className={cn(
                "fixed inset-0 z-[110] flex items-center justify-center p-6 transition-all duration-500",
                showModal ? "opacity-100 pointer-events-auto backdrop-blur-sm bg-gray-950/20" : "opacity-0 pointer-events-none"
            )}>
                <div
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => setShowModal(false)}
                />

                <div className={cn(
                    "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl w-full max-w-[340px] rounded-[2.5rem] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-white/20 dark:border-white/5 transition-all duration-700 transform",
                    showModal ? "translate-y-0 scale-100 rotate-0" : "translate-y-20 scale-90 rotate-2"
                )}>
                    {/* Sleek Header */}
                    <div className="relative p-6 pt-10 flex flex-col items-center text-center overflow-hidden">
                        {/* Decorative background circle */}
                        <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>

                        <div className="relative mb-4">
                            <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 transform -rotate-3 group-hover:rotate-0 transition-transform">
                                <Download size={28} className="text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-gray-800 rounded-lg shadow-md flex items-center justify-center">
                                <ShieldCheck size={14} className="text-emerald-500" />
                            </div>
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-3">
                            <Sparkles size={10} className="text-blue-600" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">تطبيق الموبايل</span>
                        </div>

                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2 leading-tight">تثبيت معهد دارين</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                            استمتع بتجربة أسرع، إشعارات فورية، ووصول دائم لدروسك بلمسة واحدة.
                        </p>
                    </div>

                    <div className="px-6 pb-8 space-y-5">
                        {/* Feature Tags */}
                        <div className="flex flex-wrap justify-center gap-2">
                            {[
                                { icon: Smartphone, label: 'خفيف جداً' },
                                { icon: Bell, label: 'إشعارات' },
                                { icon: ShieldCheck, label: 'آمن تماماً' }
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <feature.icon size={12} className="text-blue-500" />
                                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">{feature.label}</span>
                                </div>
                            ))}
                        </div>

                        {isIOS ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-3xl border border-blue-100 dark:border-blue-800/30 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 opacity-10">
                                        <Smartphone size={40} />
                                    </div>
                                    <p className="text-xs font-black text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2 justify-end">
                                        خطوات التثبيت للآيفون
                                    </p>
                                    <div className="space-y-2.5">
                                        {[
                                            { t: 'اضغط على زر المشاركة', i: '📤' },
                                            { t: 'اختر "إضافة للشاشة الرئيسية"', i: '➕' },
                                            { t: 'اضغط "إضافة" في الأعلى', i: '✅' }
                                        ].map((step, i) => (
                                            <div key={i} className="flex items-center justify-end gap-3 text-[11px] font-bold text-blue-700/80 dark:text-blue-400/80">
                                                <span>{step.t} {step.i}</span>
                                                <span className="w-5 h-5 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-sm text-[9px] font-black">{i + 1}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 text-sm"
                                >
                                    حسناً، بدأت التنفيذ
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleInstall}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] hover:shadow-blue-500/30 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                                >
                                    <Download size={18} />
                                    <span>تثبيت التطبيق الآن</span>
                                </button>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-full py-2 text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-gray-300 font-bold text-xs transition-colors"
                                >
                                    ليس الآن، شكراً
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

const Sparkles = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
);
