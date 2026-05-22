import { CheckCircle2 } from 'lucide-react';

interface SuccessToastProps {
    showSuccess: boolean;
    message: string;
}

export const SuccessToast = ({ showSuccess, message }: SuccessToastProps) => {
    if (!showSuccess) return null;

    return (
        <div className="fixed bottom-6 left-6 z-[2000] flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none px-4 py-3 shadow-sm animate-in slide-in-from-bottom-4 duration-300">
            <div className="w-7 h-7 bg-emerald-50 dark:bg-emerald-900/30 rounded-none flex items-center justify-center">
                <CheckCircle2 size={15} className="text-emerald-500" />
            </div>
            <p className="text-xs font-normal text-slate-700 dark:text-slate-200">{message || 'تمت العملية بنجاح'}</p>
        </div>
    );
};
