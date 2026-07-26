
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

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
                <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
                    <div className="bg-card border border-error/30 max-w-lg w-full p-8 text-center rounded-card shadow-soft">
                        <div className="w-16 h-16 mx-auto mb-5 bg-error-soft border border-error/20 flex items-center justify-center rounded-card">
                            <AlertTriangle size={28} className="text-error" />
                        </div>
                        <h1 className="text-xl font-bold text-main mb-2">
                            عذراً، حدث خطأ غير متوقع
                        </h1>
                        <p className="text-sm text-muted mb-6 leading-relaxed">
                            حدثت مشكلة أثناء تشغيل التطبيق. يرجى تحديث الصفحة أو المحاولة لاحقاً.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-5 py-2.5 bg-surface border border-border text-main text-sm font-bold rounded-xl transition-all hover:bg-hover active:scale-[0.98] inline-flex items-center gap-2"
                            >
                                <RotateCcw size={14} /> إعادة المحاولة
                            </button>
                            <button
                                onClick={() => { window.location.href = '/'; }}
                                className="px-5 py-2.5 bg-primary text-on-primary text-sm font-bold rounded-xl transition-all hover:bg-primary-hover active:scale-[0.98] inline-flex items-center gap-2"
                            >
                                <Home size={14} /> الصفحة الرئيسية
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
