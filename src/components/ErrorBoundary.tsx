
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-full bg-gray-50 flex items-center justify-center p-4 text-right" dir="rtl">
                    <div className="bg-white p-8 rounded-none shadow-sm max-w-2xl w-full border border-red-100">
                        <h1 className="text-2xl font-normal text-red-600 mb-4">
                            عذراً، حدث خطأ غير متوقع
                        </h1>
                        <p className="text-gray-600 mb-6">
                            حدثت مشكلة أثناء تشغيل التطبيق. يرجى التقاط صورة لهذه الشاشة وإرسالها للدعم الفني.
                        </p>

                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-left" dir="ltr">
                            <p className="font-mono font-normal text-red-400 mb-2">
                                {this.state.error?.toString()}
                            </p>
                            <pre className="font-mono text-xs opacity-75 whitespace-pre-wrap">
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
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
