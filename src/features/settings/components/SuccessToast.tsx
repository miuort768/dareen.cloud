import { CheckCircle2 } from 'lucide-react';

interface SuccessToastProps {
    showSuccess: boolean;
    message: string;
}

export const SuccessToast = ({ showSuccess, message }: SuccessToastProps) => {
    if (!showSuccess) return null;

    return (
        <div className="fixed bottom-20 end-4 start-4 md:end-6 md:start-auto z-[2000] animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="flex items-center gap-3 bg-card border border-success/30 rounded-2xl px-4 py-3 shadow-lg shadow-success/10 max-w-md ms-auto">
                <div className="w-8 h-8 rounded-full bg-success-soft flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} className="text-success" />
                </div>
                <div className="flex-1">
                    <p className="text-xs font-bold text-main leading-snug">{message || 'تمت العملية بنجاح'}</p>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shrink-0" />
            </div>
        </div>
    );
};
