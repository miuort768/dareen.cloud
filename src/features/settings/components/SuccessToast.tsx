import { CheckCircle2 } from 'lucide-react';

interface SuccessToastProps {
    showSuccess: boolean;
    message: string;
}

export const SuccessToast = ({ showSuccess, message }: SuccessToastProps) => {
    if (!showSuccess) return null;

    return (
        <div className="fixed bottom-6 start-6 z-[2000] flex items-center gap-3 bg-card border border-border px-4 py-3 shadow-sm animate-in slide-in-from-bottom-4 duration-300">
            <div className="w-7 h-7 bg-success-soft flex items-center justify-center">
                <CheckCircle2 size={15} className="text-success" />
            </div>
            <p className="text-xs font-normal text-main">{message || 'تمت العملية بنجاح'}</p>
        </div>
    );
};