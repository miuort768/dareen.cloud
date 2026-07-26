import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export const RouteErrorBoundary = () => {
    const error = useRouteError();
    const navigate = useNavigate();

    let title = 'عذراً، حدث خطأ غير متوقع';
    let message = 'حدثت مشكلة أثناء تحميل هذه الصفحة. يرجى المحاولة مرة أخرى.';

    if (isRouteErrorResponse(error)) {
        if (error.status === 404) {
            title = 'الصفحة غير موجودة';
            message = 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.';
        } else {
            title = `خطأ ${error.status}`;
            message = error.statusText || 'حدث خطأ في الخادم.';
        }
    } else if (error instanceof Error) {
        message = error.message;
    }

    return (
        <div className="min-h-full flex items-center justify-center p-4" dir="rtl">
            <div className="bg-card border border-error/30 max-w-lg w-full p-8 text-center rounded-card shadow-soft">
                <div className="w-16 h-16 mx-auto mb-5 bg-error-soft border border-error/20 flex items-center justify-center rounded-card">
                    <AlertTriangle size={28} className="text-error" />
                </div>
                <h1 className="text-xl font-bold text-main mb-2">{title}</h1>
                <p className="text-sm text-muted mb-6 leading-relaxed">{message}</p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-5 py-2.5 bg-surface border border-border text-main text-sm font-bold rounded-xl transition-all hover:bg-hover active:scale-[0.98] inline-flex items-center gap-2"
                    >
                        <RotateCcw size={14} /> العودة
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="px-5 py-2.5 bg-primary text-on-primary text-sm font-bold rounded-xl transition-all hover:bg-primary-hover active:scale-[0.98] inline-flex items-center gap-2"
                    >
                        <Home size={14} /> الصفحة الرئيسية
                    </button>
                </div>
            </div>
        </div>
    );
};
