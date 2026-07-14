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

            <main className="flex-grow pt-4 md:pt-[72px] pb-4 relative flex items-center justify-center">
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-15%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-[var(--bg-primary)]/8 to-[var(--bg-primary)]/8 rounded-full blur-[140px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-[var(--bg-info)]/5 to-[var(--bg-primary)]/5 rounded-full blur-[120px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] opacity-[0.02] dark:opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, var(--bg-info) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center max-w-lg">
                    <picture>
                        <source srcSet="/404.webp" type="image/webp" />
                        <source srcSet="/404.avif" type="image/avif" />
                        <img src="/404.png" alt="صفحة غير موجودة" loading="lazy" className="w-80 md:w-[480px] mx-auto mb-0 md:mb-4 block object-contain max-h-64 md:max-h-96" />
                    </picture>

                    <h2 className="text-xl md:text-3xl font-heading font-black text-main dark:text-dim mb-3 md:mb-4">
                        الصفحة غير موجودة
                    </h2>

                    <p className="text-sm md:text-base text-muted dark:text-muted leading-relaxed md:leading-relaxed mb-6 md:mb-8 max-w-sm mx-auto">
                        عذراً، الصفحة التي تبحث عنها قد تكون انتقلت أو تم حذفها. يمكنك العودة إلى الرئيسية أو تصفح دوراتنا.
                    </p>

                    <div className="flex flex-row items-center justify-center gap-2 md:gap-4">
                        <Link
                            to="/"
                            className="flex items-center gap-2 px-6 md:px-8 py-3 md:py-3.5 bg-primary text-on-primary text-sm md:text-base font-black transition-all hover:bg-primary-hover active:scale-[0.98] rounded-xl shadow-md hover:shadow-lg"
                        >
                            <Home size={16} />
                            العودة للرئيسية
                        </Link>
                        <Link
                            to="/courses"
                            className="flex items-center gap-2 px-6 md:px-8 py-3 md:py-3.5 bg-accent text-on-accent text-sm md:text-base font-black transition-all hover:bg-accent-hover active:scale-[0.98] rounded-xl shadow-md hover:shadow-lg"
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
