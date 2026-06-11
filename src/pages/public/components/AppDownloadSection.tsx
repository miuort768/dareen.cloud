import { Smartphone, Store } from 'lucide-react';

export const AppDownloadSection = () => {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 dark:from-slate-900 dark:via-indigo-950 dark:to-purple-950 py-6 md:py-10">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
            </div>
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full mb-3 mx-auto">
                        <Smartphone size={12} className="text-white" />
                        <span className="text-[9px] font-black text-white/90">تطبيق دارين السابعة</span>
                    </div>
                    <h2 className="text-xl md:text-4xl font-black text-white font-heading mb-2">
                        حمل التطبيق الآن
                    </h2>
                    <p className="text-white/70 text-xs md:text-sm leading-relaxed max-w-lg mx-auto mb-6 font-medium">
                        حمل تطبيق دارين السابعة على هاتفك واستمتع بتجربة تعليمية متكاملة من أي مكان وفي أي وقت.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <a
                            href="https://play.google.com/store/apps/details?id=com.dareen.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-slate-900 font-black text-sm rounded-xl shadow-lg hover:bg-gray-100 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M17.523 12.525c.006 1.718.771 3.293 2.068 4.308a5.14 5.14 0 0 1-.728.944c-.617.652-1.29 1.303-1.938 1.962-.722.733-1.592 1.017-2.607.89-.888-.112-1.69-.471-2.493-.811-.802-.34-1.593-.688-2.43-.86-1.235-.254-2.44-.03-3.556.528-.553.276-1.066.622-1.596.943a1.437 1.437 0 0 1-.442.2c-.315.065-.512-.244-.49-.553.018-.244.165-.444.292-.633.283-.424.586-.836.886-1.247 1.153-1.582 1.64-3.245 1.172-5.124-.386-1.552-1.394-2.542-2.836-3.004-1.013-.324-2.058-.544-3.095-.784-.22-.05-.446-.078-.646-.173-.346-.164-.4-.497-.127-.753.347-.326.743-.601 1.133-.87 1.397-.964 2.896-1.736 4.54-2.098 1.634-.36 3.21-.241 4.682.602.707.405 1.28.949 1.72 1.622.162.247.306.502.485.864h.003zm-9.837-.734c.01.472.15.93.396 1.33a3.18 3.18 0 0 0 2.818 1.45c.89-.022 1.716-.366 2.314-1.016a3.253 3.253 0 0 0 .82-2.553 3.02 3.02 0 0 0-.792-1.527 3.036 3.036 0 0 0-1.445-.92c-1.352-.318-2.648.47-3.234 1.632-.257.51-.384 1.064-.373 1.604h-.504z" />
                            </svg>
                            <div className="text-right">
                                <div className="text-[8px] text-slate-500 font-medium leading-tight">حمله من</div>
                                <div className="text-sm font-black leading-tight -mt-0.5">Google Play</div>
                            </div>
                        </a>
                        <a
                            href="https://apps.apple.com/app/dareen-app/id123456789"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-slate-900 font-black text-sm rounded-xl shadow-lg hover:bg-gray-100 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                            </svg>
                            <div className="text-right">
                                <div className="text-[8px] text-slate-500 font-medium leading-tight">حمله من</div>
                                <div className="text-sm font-black leading-tight -mt-0.5">App Store</div>
                            </div>
                        </a>
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-5">
                        <div className="flex items-center gap-1.5 text-white/60">
                            <Store size={14} />
                            <span className="text-[9px] font-medium">مجاني</span>
                        </div>
                        <div className="w-px h-4 bg-white/20"></div>
                        <div className="flex items-center gap-1.5 text-white/60">
                            <Store size={14} />
                            <span className="text-[9px] font-medium">آمن</span>
                        </div>
                        <div className="w-px h-4 bg-white/20"></div>
                        <div className="flex items-center gap-1.5 text-white/60">
                            <Store size={14} />
                            <span className="text-[9px] font-medium">متوافق مع جميع الأجهزة</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
