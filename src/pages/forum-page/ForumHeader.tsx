import { Sparkles } from 'lucide-react';

export const ForumHeader = () => (
    <div className="bg-primary rounded-card shadow-soft px-6 py-8 mx-4 mt-4 mb-6">
        <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-primary-soft rounded-card flex items-center justify-center mb-4">
                <Sparkles size={26} className="text-on-primary" />
            </div>
            <h1 className="text-3xl font-bold text-on-primary leading-tight mb-2">منتدى دارين</h1>
            <p className="text-sm text-on-primary/80 font-medium leading-relaxed max-w-md">
                مساحة آمنة للنقاش وتبادل الأفكار بين الطلاب والمعلمات وأولياء الأمور.
            </p>
        </div>
    </div>
);
