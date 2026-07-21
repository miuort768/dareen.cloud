
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props { children?: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background dark:bg-background flex items-center justify-center p-4" dir="rtl">
                    <div className="bg-card border border-error/30 max-w-lg w-full p-8 text-center rounded-card">
                        <div className="w-16 h-16 mx-auto mb-5 bg-error-soft border border-error/20 flex items-center justify-center rounded-card">
                            <span className="text-2xl">!</span>
                        </div>
                        <h1 className="text-xl font-heading font-bold text-main dark:text-main mb-2">
                            عذراً، حدث خطأ غير متوقع
                        </h1>
                        <p className="text-sm text-muted dark:text-muted mb-6 leading-relaxed">
                            حدثت مشكلة أثناء تشغيل التطبيق. يرجى تحديث الصفحة أو المحاولة لاحقاً.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-primary-active dark:bg-surface text-on-primary dark:text-main text-sm font-bold transition-all hover:bg-primary-active dark:hover:bg-surface active:scale-[0.98]"
                        >
                            إعادة تحميل الصفحة
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
