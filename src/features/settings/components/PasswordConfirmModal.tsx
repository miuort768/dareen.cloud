import { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, RefreshCw } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface PasswordConfirmModalProps {
    show: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: (password: string) => Promise<void>;
    onClose: () => void;
}

export const PasswordConfirmModal = ({ show, title, description, confirmLabel, onConfirm, onClose }: PasswordConfirmModalProps) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!show) return null;

    const handleConfirm = async () => {
        if (!password) { setError('أدخل كلمة المرور'); return; }
        setSubmitting(true);
        setError('');
        try {
            await onConfirm(password);
            setPassword('');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'كلمة المرور غير صحيحة');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 animate-in fade-in" dir="rtl">
            <div className="bg-card border border-border max-w-md w-full shadow-lg overflow-hidden rounded-2xl">
                <div className="p-6 text-center space-y-3 border-b border-border/20">
                    <div className="w-12 h-12 mx-auto bg-warning-soft text-warning flex items-center justify-center rounded-2xl">
                        <Lock size={20} />
                    </div>
                    <h3 className="text-base font-bold text-main">{title}</h3>
                    <p className="text-xs text-muted leading-relaxed">{description}</p>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-[11px] font-bold text-muted mb-1.5">كلمة المرور</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => { setPassword(e.target.value); setError(''); }}
                                onKeyDown={e => { if (e.key === 'Enter') handleConfirm(); }}
                                placeholder="••••••••"
                                className="w-full bg-background border border-border/30 px-4 py-3 text-sm font-bold text-main pe-11 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 rounded-xl placeholder:text-muted/50"
                                autoFocus
                            />
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors"
                                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                            >
                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        {error && (
                            <p className="text-[11px] font-bold text-error mt-1.5">{error}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-warning-dark bg-warning-soft px-4 py-3 rounded-lg">
                        <ShieldCheck size={13} className="shrink-0" />
                        إجراء حساس — يُطلب إدخال كلمة مرور المسؤول للتأكيد.
                    </div>
                    <div className="flex gap-2 pt-1">
                        <button
                            onClick={() => { onClose(); setPassword(''); setError(''); }}
                            className="flex-1 py-3 border border-border/30 text-muted text-xs font-bold hover:bg-surface hover:text-main rounded-xl transition-all active:scale-[0.97]"
                        >
                            تراجع
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={submitting}
                            className={cn(
                                'flex-1 py-3 bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold rounded-xl transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5',
                                submitting && 'opacity-60'
                            )}
                        >
                            {submitting ? <RefreshCw size={13} className="animate-spin" /> : confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
