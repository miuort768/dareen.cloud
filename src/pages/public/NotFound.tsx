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

            <main className="flex-grow pt-24 md:pt-32 pb-24 relative flex items-center justify-center">
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-15%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-[var(--bg-primary)]/8 to-[var(--bg-primary)]/8 rounded-full blur-[140px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-[var(--bg-info)]/5 to-[var(--bg-primary)]/5 rounded-full blur-[120px]" />
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center max-w-lg">
                    <div className="w-20 h-20 mx-auto mb-6 bg-primary-soft dark:bg-primary/10 border border-primary dark:border-primary/20 flex items-center justify-center">
                        <Search size={36} className="text-primary" />
                    </div>

                    <h1 className="text-7xl md:text-9xl font-heading font-black text-main dark:text-main leading-none mb-4">
                        404
                    </h1>

                    <h2 className="text-xl md:text-2xl font-heading font-black text-main dark:text-dim mb-3">
                        الصفحة غير موجودة
                    </h2>

                    <p className="text-sm text-muted dark:text-muted leading-relaxed mb-8 max-w-sm mx-auto">
                        عذراً، الصفحة التي تبحث عنها قد تكون انتقلت أو تم حذفها. يمكنك العودة إلى الرئيسية أو تصفح دوراتنا.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            to="/"
                            className="flex items-center gap-2 px-6 py-3 bg-primary-active dark:bg-surface text-on-primary dark:text-main text-sm font-black transition-all hover:bg-primary-active dark:hover:bg-surface active:scale-[0.98]"
                        >
                            <Home size={16} />
                            العودة للرئيسية
                        </Link>
                        <Link
                            to="/courses"
                            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-primary-active border border-border dark:border-border text-main dark:text-dim text-sm font-black transition-all hover:border-border/30 dark:hover:border-border/30 active:scale-[0.98]"
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
