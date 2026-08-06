import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
  compact?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[SectionErrorBoundary${this.props.name ? `:${this.props.name}` : ''}]`, error, info);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      if (this.props.compact) {
        return (
          <div
            className={cn(
              'flex items-center justify-center gap-3 rounded-2xl border border-error/20',
              'bg-error/5 p-6 text-center'
            )}
            dir="rtl"
          >
            <div>
              <AlertTriangle size={20} className="text-error mx-auto mb-2" />
              <p className="text-sm font-bold text-muted">حدث خطأ في هذا القسم</p>
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 text-xs font-bold text-error hover:text-error transition-colors rounded-xl hover:bg-error/10"
              >
                <RotateCcw size={12} /> إعادة المحاولة
              </button>
            </div>
          </div>
        );
      }

      return (
        <div
          className={cn(
            'flex items-center justify-center min-h-[300px] rounded-3xl',
            'bg-surface border border-error/20'
          )}
          dir="rtl"
        >
          <div className="text-center max-w-xs">
            <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} className="text-error" />
            </div>
            <p className="text-sm font-bold text-main mb-2">عذراً، حدث خطأ غير متوقع</p>
            <p className="text-xs text-muted mb-4">تعذر تحميل هذا القسم. يرجى المحاولة مرة أخرى.</p>
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold rounded-xl transition-colors active:scale-95 inline-flex items-center gap-2"
            >
              <RotateCcw size={14} /> إعادة المحاولة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
