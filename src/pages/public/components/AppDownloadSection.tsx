import { Smartphone, Store, Monitor, Download, Shield, MonitorDown } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

export const AppDownloadSection = () => {
    const deferredPrompt = useRef<any>(null);
    const [pwaInstalled, setPwaInstalled] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            deferredPrompt.current = e;
        };
        window.addEventListener('beforeinstallprompt', handler);
        window.addEventListener('appinstalled', () => setPwaInstalled(true));
        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('appinstalled', () => setPwaInstalled(true));
        };
    }, []);

    const handlePwaInstall = async () => {
        if (!deferredPrompt.current) return;
        deferredPrompt.current.prompt();
        const result = await deferredPrompt.current.userChoice;
        if (result.outcome === 'accepted') setPwaInstalled(true);
        deferredPrompt.current = null;
    };

    return (
        <>
            {/* Desktop */}
            <section className="hidden md:block pt-4 md:pt-6 pb-6 relative overflow-hidden bg-[#F8F8FC] dark:bg-slate-950 transition-colors duration-500">
                <div className="container mx-auto px-4 md:px-8 relative z-10">
                    <div className="max-w-6xl mx-auto bg-gradient-to-br from-indigo-100 via-indigo-50 to-white dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-2xl shadow-sm border border-indigo-100/80 dark:border-indigo-900/30 overflow-hidden">
                        <div className="flex flex-col items-center justify-center p-6 md:p-10 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 dark:bg-indigo-900/30 border border-indigo-200/50 dark:border-indigo-800 rounded-full mb-4 mx-auto">
                                <Smartphone size={14} className="text-indigo-600 dark:text-indigo-300" />
                                <span className="text-indigo-900 dark:text-indigo-300 font-bold text-xs">تطبيق دارين السابعة</span>
                            </div>
                            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black mb-2 text-black dark:text-white leading-tight font-heading">
                                حمل التطبيق الآن
                            </h2>
                            <p className="text-gray-500 dark:text-slate-400 text-[11px] lg:text-xs leading-relaxed mb-6 max-w-xl mx-auto font-medium">
                                 أفضل مدرسة افتراضية. حمل تطبيق دارين السابعة على هاتفك واستمتع بتجربة تعليمية متكاملة من أي مكان وفي أي وقت.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <a
                                    href="https://play.google.com/store/apps/details?id=com.dareen.app"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-8 py-3.5 bg-indigo-600 text-white font-bold text-sm shadow-lg hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group rounded-xl"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path d="M17.523 12.525c.006 1.718.771 3.293 2.068 4.308a5.14 5.14 0 0 1-.728.944c-.617.652-1.29 1.303-1.938 1.962-.722.733-1.592 1.017-2.607.89-.888-.112-1.69-.471-2.493-.811-.802-.34-1.593-.688-2.43-.86-1.235-.254-2.44-.03-3.556.528-.553.276-1.066.622-1.596.943a1.437 1.437 0 0 1-.442.2c-.315.065-.512-.244-.49-.553.018-.244.165-.444.292-.633.283-.424.586-.836.886-1.247 1.153-1.582 1.64-3.245 1.172-5.124-.386-1.552-1.394-2.542-2.836-3.004-1.013-.324-2.058-.544-3.095-.784-.22-.05-.446-.078-.646-.173-.346-.164-.4-.497-.127-.753.347-.326.743-.601 1.133-.87 1.397-.964 2.896-1.736 4.54-2.098 1.634-.36 3.21-.241 4.682.602.707.405 1.28.949 1.72 1.622.162.247.306.502.485.864h.003zm-9.837-.734c.01.472.15.93.396 1.33a3.18 3.18 0 0 0 2.818 1.45c.89-.022 1.716-.366 2.314-1.016a3.253 3.253 0 0 0 .82-2.553 3.02 3.02 0 0 0-.792-1.527 3.036 3.036 0 0 0-1.445-.92c-1.352-.318-2.648.47-3.234 1.632-.257.51-.384 1.064-.373 1.604h-.504z" />
                                    </svg>
                                    <div className="text-right">
                                        <div className="text-[8px] text-white/70 font-medium leading-tight">حمله من</div>
                                        <div className="text-sm font-black leading-tight -mt-0.5">Google Play</div>
                                    </div>
                                </a>
                                <a
                                    href="https://apps.apple.com/app/dareen-app/id123456789"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-8 py-3.5 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 font-bold text-sm hover:border-indigo-200 dark:hover:border-indigo-700 hover:text-indigo-700 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center justify-center rounded-xl"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                                    </svg>
                                    <div className="text-right">
                                        <div className="text-[8px] text-gray-500 dark:text-slate-400 font-medium leading-tight">حمله من</div>
                                        <div className="text-sm font-black leading-tight -mt-0.5">App Store</div>
                                    </div>
                                </a>
                                {!pwaInstalled && (
                                <button
                                    onClick={handlePwaInstall}
                                    className="hidden md:inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white dark:bg-slate-800 text-gray-700 dark:text-white border border-gray-200 dark:border-slate-700 font-bold text-sm hover:border-indigo-200 dark:hover:border-indigo-700 hover:text-indigo-700 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all rounded-xl"
                                >
                                    <Monitor className="w-5 h-5" />
                                    <div className="text-right">
                                        <div className="text-[8px] text-gray-500 dark:text-white/70 font-medium leading-tight">حمله على</div>
                                        <div className="text-sm font-black leading-tight -mt-0.5">الكمبيوتر</div>
                                    </div>
                                </button>
                                )}
                            </div>
                            <div className="flex items-center justify-center gap-6 mt-6">
                                <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
                                    <Download size={14} />
                                    <span className="text-[9px] font-medium">مجاني</span>
                                </div>
                                <div className="w-px h-4 bg-gray-200 dark:bg-slate-700"></div>
                                <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
                                    <Shield size={14} />
                                    <span className="text-[9px] font-medium">آمن</span>
                                </div>
                                <div className="w-px h-4 bg-gray-200 dark:bg-slate-700"></div>
                                <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
                                    <MonitorDown size={14} />
                                    <span className="text-[9px] font-medium">متوافق مع جميع الأجهزة</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mobile */}
            <section className="block md:hidden relative overflow-hidden bg-[#F8F9FB] dark:bg-slate-950 transition-colors duration-500 pt-2 pb-4">
                <div className="absolute top-40 -left-20 w-64 h-64 bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-40 -right-20 w-80 h-80 bg-purple-400/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="relative z-10 px-5">
                    <div className="flex items-center justify-center mb-5 mt-2">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-indigo-100/80 dark:border-indigo-800/60 rounded-full shadow-sm">
                            <Smartphone size={14} className="text-indigo-600 dark:text-indigo-400" />
                            <span className="text-indigo-700 dark:text-indigo-300 font-bold text-[11px] tracking-wide">تطبيق دارين السابعة</span>
                        </div>
                    </div>
                    <div className="text-center mb-2">
                        <h2 className="text-[26px] leading-[1.2] font-black text-[#1B1B1F] dark:text-white font-heading">
                            حمل التطبيق الآن
                        </h2>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-tight text-center max-w-xs mx-auto mb-6 font-medium">
                        أفضل مدرسة افتراضية. حمل تطبيق دارين السابعة على هاتفك واستمتع بتجربة تعليمية متكاملة من أي مكان وفي أي وقت.
                    </p>
                    <div className="flex flex-col gap-3 items-center mb-7">
                        <a
                            href="https://play.google.com/store/apps/details?id=com.dareen.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full max-w-[320px] py-4 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white font-black text-base shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group rounded-2xl"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M17.523 12.525c.006 1.718.771 3.293 2.068 4.308a5.14 5.14 0 0 1-.728.944c-.617.652-1.29 1.303-1.938 1.962-.722.733-1.592 1.017-2.607.89-.888-.112-1.69-.471-2.493-.811-.802-.34-1.593-.688-2.43-.86-1.235-.254-2.44-.03-3.556.528-.553.276-1.066.622-1.596.943a1.437 1.437 0 0 1-.442.2c-.315.065-.512-.244-.49-.553.018-.244.165-.444.292-.633.283-.424.586-.836.886-1.247 1.153-1.582 1.64-3.245 1.172-5.124-.386-1.552-1.394-2.542-2.836-3.004-1.013-.324-2.058-.544-3.095-.784-.22-.05-.446-.078-.646-.173-.346-.164-.4-.497-.127-.753.347-.326.743-.601 1.133-.87 1.397-.964 2.896-1.736 4.54-2.098 1.634-.36 3.21-.241 4.682.602.707.405 1.28.949 1.72 1.622.162.247.306.502.485.864h.003zm-9.837-.734c.01.472.15.93.396 1.33a3.18 3.18 0 0 0 2.818 1.45c.89-.022 1.716-.366 2.314-1.016a3.253 3.253 0 0 0 .82-2.553 3.02 3.02 0 0 0-.792-1.527 3.036 3.036 0 0 0-1.445-.92c-1.352-.318-2.648.47-3.234 1.632-.257.51-.384 1.064-.373 1.604h-.504z" />
                            </svg>
                            <div className="text-right">
                                <div className="text-[8px] text-white/70 font-medium leading-tight">حمله من</div>
                                <div className="text-sm font-black leading-tight -mt-0.5">Google Play</div>
                            </div>
                        </a>
                        <a
                            href="https://apps.apple.com/app/dareen-app/id123456789"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full max-w-[320px] py-3.5 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-gray-100 dark:border-slate-700 font-bold text-sm hover:border-indigo-200 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all flex items-center justify-center gap-2 rounded-2xl shadow-sm"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                            </svg>
                            <div className="text-right">
                                <div className="text-[8px] text-gray-500 dark:text-slate-400 font-medium leading-tight">حمله من</div>
                                <div className="text-sm font-black leading-tight -mt-0.5">App Store</div>
                            </div>
                        </a>
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-5">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            <Download size={14} />
                            <span className="text-[9px] font-medium">مجاني</span>
                        </div>
                        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            <Shield size={14} />
                            <span className="text-[9px] font-medium">آمن</span>
                        </div>
                        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            <MonitorDown size={14} />
                            <span className="text-[9px] font-medium">متوافق مع جميع الأجهزة</span>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};
