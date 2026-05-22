import { Sparkles } from 'lucide-react';

export const ForumHeader = () => {
    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-900 rounded-none md:rounded-none shadow-sm border border-white/5 px-6 md:px-8 py-6 mx-0 md:mx-6 mt-0 md:mt-6 mb-6">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="max-w-3xl mx-auto flex flex-col items-center text-center relative z-10">
                <div className="w-12 h-12 bg-white/10  rounded-none flex items-center justify-center mb-4 border border-white/10 shadow-sm">
                    <Sparkles size={24} className="text-white" />
                </div>
                <h1 className="text-2xl font-medium text-white uppercase tracking-tighter mb-2">منتدى دارين</h1>
                <p className="text-xs text-white/80 font-normal uppercase tracking-widest leading-relaxed max-w-md">
                    مساحتك الخاصة للنقاش، التعلم، ومشاركة المعرفة مع زملائك ومعلميك في بيئة تعليمية آمنة.
                </p>
            </div>
        </div>
    );
};
