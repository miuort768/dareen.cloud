
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
                <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 flex items-center justify-center p-4" dir="rtl">
                    <div className="bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 max-w-lg w-full p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-5 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center">
                            <span className="text-2xl">!</span>
                        </div>
                        <h1 className="text-xl font-heading font-black text-slate-900 dark:text-slate-50 mb-2">
                            عذراً، حدث خطأ غير متوقع
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                            حدثت مشكلة أثناء تشغيل التطبيق. يرجى تحديث الصفحة أو المحاولة لاحقاً.
                        </p>
                        <pre className="text-xs text-red-600 dark:text-red-400 mb-4 text-left max-h-40 overflow-auto bg-red-50 dark:bg-red-900/20 p-3 border border-red-200 dark:border-red-800">
                            {this.state.error?.name}: {this.state.error?.message}
                            {'\n\n'}
                            {this.state.error?.stack}
                        </pre>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 text-sm font-black transition-all hover:bg-slate-800 dark:hover:bg-slate-200 active:scale-[0.98]"
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
