import { Smartphone, Download, Shield, MonitorDown, Globe, Apple } from 'lucide-react';
import { useSettingsStore } from '../../../store/settingsStore';

export const AppDownloadSection = () => {
    const googlePlayUrl = useSettingsStore(s => s.googlePlayUrl);
    const appStoreUrl = useSettingsStore(s => s.appStoreUrl);

    return (
        <>
            {/* Desktop */}
            <section className="hidden md:block pt-4 md:pt-6 pb-6 relative overflow-hidden bg-surface dark:bg-card transition-colors duration-500">
                <div className="absolute top-0 end-0 w-64 h-64 bg-accent/5 dark:bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 start-0 w-48 h-48 bg-primary/5 dark:bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="container mx-auto px-4 md:px-8 relative z-10">
                    <div className="max-w-6xl mx-auto bg-primary-soft dark:bg-card border border-primary/30 dark:border-primary/30 rounded-2xl shadow-sm overflow-hidden">
                        <div className="flex flex-col items-center justify-center p-6 md:p-10 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 dark:bg-primary-soft border border-primary/50 dark:border-primary rounded-full mb-4 mx-auto">
                                <Smartphone size={14} className="text-primary" />
                                <span className="text-primary font-bold text-xs">تطبيق دارين السابعة</span>
                            </div>
                            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black mb-2 text-main dark:text-main leading-tight font-heading">
                                حمل التطبيق الآن
                            </h2>
                            <p className="text-muted dark:text-muted text-xs lg:text-xs leading-relaxed mb-6 max-w-xl mx-auto font-medium">
                                 أفضل مدرسة افتراضية. حمل تطبيق دارين السابعة على هاتفك واستمتع بتجربة تعليمية متكاملة من أي مكان وفي أي وقت.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <a
                                    href={googlePlayUrl || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-black dark:bg-gray-900 text-inverse font-bold text-sm shadow-lg hover:bg-gray-800 dark:hover:bg-gray-800 hover:-translate-y-0.5 transition-all rounded-xl border border-gray-700 dark:border-gray-700 w-full sm:w-auto"
                                >
                                    <Globe className="w-5 h-5 shrink-0 text-white" />
                                    <div className="text-start">
                                        <div className="text-micro text-white font-medium leading-tight opacity-60">حمله على</div>
                                        <div className="text-sm font-black text-white leading-tight -mt-0.5">Google Play</div>
                                    </div>
                                </a>
                                <a
                                    href={appStoreUrl || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-black dark:bg-gray-900 text-inverse font-bold text-sm shadow-lg hover:bg-gray-800 dark:hover:bg-gray-800 hover:-translate-y-0.5 transition-all rounded-xl border border-gray-700 dark:border-gray-700 w-full sm:w-auto"
                                >
                                    <Apple className="w-5 h-5 shrink-0 text-white" />
                                    <div className="text-start">
                                        <div className="text-micro text-inverse font-medium leading-tight opacity-60">حمله على</div>
                                        <div className="text-sm font-black leading-tight -mt-0.5">App Store</div>
                                    </div>
                                </a>
                            </div>
                            <div className="flex items-center justify-center gap-6 mt-6">
                                <div className="flex items-center gap-1.5 text-muted dark:text-muted">
                                    <Download size={14} />
                                    <span className="text-micro font-medium">مجاني</span>
                                </div>
                                <div className="w-px h-4 bg-border"></div>
                                <div className="flex items-center gap-1.5 text-muted dark:text-muted">
                                    <Shield size={14} />
                                    <span className="text-micro font-medium">آمن</span>
                                </div>
                                <div className="w-px h-4 bg-border"></div>
                                <div className="flex items-center gap-1.5 text-muted dark:text-muted">
                                    <MonitorDown size={14} />
                                    <span className="text-micro font-medium">متوافق مع جميع الأجهزة</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mobile */}
            <section className="block md:hidden relative overflow-hidden bg-surface dark:bg-card transition-colors duration-500 pt-2 pb-4">
                <div className="absolute top-40 -end-20 w-64 h-64 bg-accent/10 dark:bg-accent/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-40 -start-20 w-80 h-80 bg-primary/10 dark:bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="relative z-10 px-5">
                    <div className="flex items-center justify-center mb-5 mt-2">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 dark:bg-primary-soft border border-primary/50 dark:border-primary rounded-full shadow-sm">
                            <Smartphone size={14} className="text-primary" />
                            <span className="text-primary font-bold text-xs tracking-wide">تطبيق دارين السابعة</span>
                        </div>
                    </div>
                    <div className="text-center mb-2">
                        <h2 className="text-2xl leading-tight font-black text-main dark:text-main font-heading">
                            حمل التطبيق الآن
                        </h2>
                    </div>
                    <p className="text-muted dark:text-muted text-micro leading-tight text-center max-w-xs mx-auto mb-6 font-medium">
                        أفضل مدرسة افتراضية. حمل تطبيق دارين السابعة على هاتفك واستمتع بتجربة تعليمية متكاملة من أي مكان وفي أي وقت.
                    </p>
                    <div className="flex flex-col gap-4 items-center mb-7">
                        <a
                            href={googlePlayUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full max-w-[320px] flex items-center justify-center gap-3 px-6 py-4 bg-black dark:bg-gray-900 text-inverse font-black text-base shadow-lg hover:bg-gray-800 dark:hover:bg-gray-800 hover:-translate-y-0.5 transition-all rounded-2xl border border-gray-700 dark:border-gray-700"
                        >
                            <Globe className="w-5 h-5 shrink-0 text-white" />
                            <span className="text-white">حمله على Google Play</span>
                        </a>
                        <a
                            href={appStoreUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full max-w-[320px] flex items-center justify-center gap-3 px-6 py-4 bg-black dark:bg-gray-900 text-inverse font-black text-base shadow-lg hover:bg-gray-800 dark:hover:bg-gray-800 hover:-translate-y-0.5 transition-all rounded-2xl border border-gray-700 dark:border-gray-700"
                        >
                            <Apple className="w-5 h-5 shrink-0 text-white" />
                            <span className="text-white">حمله على App Store</span>
                        </a>
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-5">
                        <div className="flex items-center gap-1.5 text-muted dark:text-muted">
                            <Download size={14} />
                            <span className="text-micro font-medium">مجاني</span>
                        </div>
                        <div className="w-px h-4 bg-border"></div>
                        <div className="flex items-center gap-1.5 text-muted dark:text-muted">
                            <Shield size={14} />
                            <span className="text-micro font-medium">آمن</span>
                        </div>
                        <div className="w-px h-4 bg-border"></div>
                        <div className="flex items-center gap-1.5 text-muted dark:text-muted">
                            <MonitorDown size={14} />
                            <span className="text-micro font-medium">متوافق مع جميع الأجهزة</span>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};