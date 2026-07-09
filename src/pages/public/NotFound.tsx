import { Link } from 'react-router-dom';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { SEO } from '../../components/SEO';
import { Home, ArrowLeft, Search } from 'lucide-react';

export const NotFound = () => {
    return (
        <div className="min-h-full bg-background dark:bg-background font-sans text-main dark:text-main relative flex flex-col">
            <SEO title="الصفحة غير موجودة | دارين السابعة" description="عذراً، الصفحة التي تبحث عنها غير موجودة. يمكنك العودة إلى الصفحة الرئيسية أو تصفح دوراتنا التعليمية." url="https://dareen.cloud/404" noindex />

            <PublicNavbar />

            <main className="flex-grow pt-20 md:pt-28 pb-4 relative flex items-center justify-center">
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-15%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-[var(--bg-primary)]/8 to-[var(--bg-primary)]/8 rounded-full blur-[140px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-[var(--bg-info)]/5 to-[var(--bg-primary)]/5 rounded-full blur-[120px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] opacity-[0.02] dark:opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, var(--bg-info) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center max-w-lg">
                    <div className="w-24 h-24 md:w-28 md:h-28 mx-auto mb-6 bg-gradient-to-br from-[var(--bg-primary)]/15 to-[var(--bg-accent)]/10 dark:from-[var(--bg-primary)]/20 dark:to-[var(--bg-accent)]/10 border border-[var(--bg-primary)]/20 dark:border-[var(--bg-primary)]/30 flex items-center justify-center shadow-xl shadow-[var(--bg-primary)]/10">
                        <Search size={40} className="text-primary" />
                    </div>

                    <h1 className="text-7xl md:text-9xl font-heading font-black leading-none mb-4 bg-gradient-to-br from-primary via-primary-hover to-primary bg-clip-text text-transparent">
                        404
                    </h1>

                    <h2 className="text-xl md:text-2xl font-heading font-black text-main dark:text-dim mb-3">
                        الصفحة غير موجودة
                    </h2>

                    <p className="text-sm text-muted dark:text-muted leading-relaxed mb-6 max-w-sm mx-auto">
                        عذراً، الصفحة التي تبحث عنها قد تكون انتقلت أو تم حذفها. يمكنك العودة إلى الرئيسية أو تصفح دوراتنا.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            to="/"
                            className="flex items-center gap-2 px-6 py-3 bg-primary-active dark:bg-surface text-on-primary dark:text-main text-sm font-black transition-all hover:bg-primary-active dark:hover:bg-surface active:scale-[0.98] rounded-xl shadow-md hover:shadow-lg"
                        >
                            <Home size={16} />
                            العودة للرئيسية
                        </Link>
                        <Link
                            to="/courses"
                            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-primary-active border border-border dark:border-border text-main dark:text-on-primary text-sm font-black transition-all hover:border-border/30 dark:hover:border-border/30 active:scale-[0.98] rounded-xl shadow-md hover:shadow-lg"
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
