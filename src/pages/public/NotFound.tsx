import { Link } from 'react-router-dom';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { SEO } from '../../components/SEO';
import { Home, ArrowLeft, Search } from 'lucide-react';

export const NotFound = () => {
    return (
        <div className="min-h-full bg-[#fafafa] dark:bg-slate-950 font-sans text-gray-800 dark:text-slate-100 relative flex flex-col">
            <SEO title="الصفحة غير موجودة | دارين السابعة" description="عذراً، الصفحة التي تبحث عنها غير موجودة. يمكنك العودة إلى الصفحة الرئيسية أو تصفح دوراتنا التعليمية." url="https://dareen.cloud/404" />

            <PublicNavbar />

            <main className="flex-grow pt-24 md:pt-32 pb-24 relative flex items-center justify-center">
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-15%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-indigo-500/8 to-purple-500/8 rounded-full blur-[140px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-sky-500/5 to-indigo-500/5 rounded-full blur-[120px]" />
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center max-w-lg">
                    <div className="w-20 h-20 mx-auto mb-6 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center">
                        <Search size={36} className="text-indigo-500" />
                    </div>

                    <h1 className="text-7xl md:text-9xl font-heading font-black text-slate-900 dark:text-slate-50 leading-none mb-4">
                        404
                    </h1>

                    <h2 className="text-xl md:text-2xl font-heading font-black text-slate-800 dark:text-slate-100 mb-3">
                        الصفحة غير موجودة
                    </h2>

                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-sm mx-auto">
                        عذراً، الصفحة التي تبحث عنها قد تكون انتقلت أو تم حذفها. يمكنك العودة إلى الرئيسية أو تصفح دوراتنا.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            to="/"
                            className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 text-sm font-black transition-all hover:bg-slate-800 dark:hover:bg-slate-200 active:scale-[0.98]"
                        >
                            <Home size={16} />
                            العودة للرئيسية
                        </Link>
                        <Link
                            to="/courses"
                            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-black transition-all hover:border-slate-900/30 dark:hover:border-slate-100/30 active:scale-[0.98]"
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
