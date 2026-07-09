import { Link } from 'react-router-dom';
import { MobileHeader } from '../../components/public/MobileHeader';
import { PublicFooter } from '../../components/public/PublicFooter';
import { SEO } from '../../components/SEO';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
    return (
        <div className="min-h-full bg-background dark:bg-background font-sans text-main dark:text-main relative flex flex-col">
            <SEO title="الصفحة غير موجودة | دارين السابعة" description="عذراً، الصفحة التي تبحث عنها غير موجودة. يمكنك العودة إلى الصفحة الرئيسية أو تصفح دوراتنا التعليمية." url="https://dareen.cloud/404" noindex />

            <MobileHeader />

            <main className="flex-grow pt-14 md:pt-28 pb-4 relative flex items-center justify-center">
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-15%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-[var(--bg-primary)]/8 to-[var(--bg-primary)]/8 rounded-full blur-[140px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-[var(--bg-info)]/5 to-[var(--bg-primary)]/5 rounded-full blur-[120px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] opacity-[0.02] dark:opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, var(--bg-info) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center max-w-lg">
                    <h1 className="text-7xl md:text-9xl font-heading font-black leading-none mb-4 md:mb-12 md:mt-8 flex items-center justify-center gap-0">
                        <span className="bg-gradient-to-br from-primary via-primary-hover to-primary bg-clip-text text-transparent">4</span>
                        <svg className="h-[1em] w-[0.88em] md:h-[1em] md:w-[0.88em] inline-block" viewBox="0 0 100 100" style={{ overflow: 'visible' }} aria-hidden="true">
                            <defs>
                                <linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="var(--primary)" />
                                    <stop offset="50%" stopColor="var(--primary-hover)" />
                                    <stop offset="100%" stopColor="var(--primary)" />
                                </linearGradient>
                            </defs>
                            <path d="M50 92 C15 92 5 70 5 50 C5 28 15 8 50 8 C85 8 95 28 95 50 C95 70 85 92 50 92 Z" fill="url(#bookGrad)" />
                            <path d="M50 80 C25 80 18 65 18 50 C18 35 25 20 50 20" fill="none" stroke="var(--bg-background)" strokeWidth="1.5" opacity="0.5" />
                            <path d="M50 80 C75 80 82 65 82 50 C82 35 75 20 50 20" fill="none" stroke="var(--bg-background)" strokeWidth="1.5" opacity="0.5" />
                            <line x1="50" y1="8" x2="50" y2="92" stroke="var(--bg-background)" strokeWidth="1.8" opacity="0.4" />
                            <line x1="22" y1="40" x2="46" y2="40" stroke="var(--bg-background)" strokeWidth="1.2" opacity="0.35" />
                            <line x1="20" y1="50" x2="46" y2="50" stroke="var(--bg-background)" strokeWidth="1.2" opacity="0.35" />
                            <line x1="22" y1="60" x2="46" y2="60" stroke="var(--bg-background)" strokeWidth="1.2" opacity="0.35" />
                            <line x1="54" y1="40" x2="78" y2="40" stroke="var(--bg-background)" strokeWidth="1.2" opacity="0.35" />
                            <line x1="54" y1="50" x2="80" y2="50" stroke="var(--bg-background)" strokeWidth="1.2" opacity="0.35" />
                            <line x1="54" y1="60" x2="78" y2="60" stroke="var(--bg-background)" strokeWidth="1.2" opacity="0.35" />
                            <path d="M50 92 L50 100 L47 97 L50 94 L53 97 Z" fill="url(#bookGrad)" />
                        </svg>
                        <span className="bg-gradient-to-br from-primary via-primary-hover to-primary bg-clip-text text-transparent">4</span>
                    </h1>

                    <h2 className="text-xl md:text-2xl font-heading font-black text-main dark:text-dim mb-3">
                        الصفحة غير موجودة
                    </h2>

                    <p className="text-sm text-muted dark:text-muted leading-relaxed mb-6 max-w-sm mx-auto">
                        عذراً، الصفحة التي تبحث عنها قد تكون انتقلت أو تم حذفها. يمكنك العودة إلى الرئيسية أو تصفح دوراتنا.
                    </p>

                    <div className="flex flex-row items-center justify-center gap-2">
                        <Link
                            to="/"
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary text-sm font-black transition-all hover:bg-primary-hover active:scale-[0.98] rounded-xl shadow-md hover:shadow-lg"
                        >
                            <Home size={16} />
                            العودة للرئيسية
                        </Link>
                        <Link
                            to="/courses"
                            className="flex items-center gap-2 px-6 py-3 bg-accent text-on-accent text-sm font-black transition-all hover:bg-accent-hover active:scale-[0.98] rounded-xl shadow-md hover:shadow-lg"
                        >
                            <ArrowLeft size={16} />
                            تصفح الدورات
                        </Link>
                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
};
