import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, CheckCircle2, XCircle, Lock, BookOpen, Star } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../components/ui/Button';

interface SecureAttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (status: 'completed' | 'cancelled', topics?: string, homework?: string, needsCompensation?: boolean) => void;
    studentName: string;
    date: string;
}

export const SecureAttendanceModal: React.FC<SecureAttendanceModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    studentName,
    date
}) => {
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState<'completed' | 'cancelled'>('completed');
    const [topics, setTopics] = useState('');
    const [homework, setHomework] = useState('');
    const [needsCompensation, setNeedsCompensation] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setPassword('');
            setStatus('completed');
            setTopics('');
            setHomework('');
            setNeedsCompensation(false);
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        const secret = import.meta.env.VITE_ATTENDANCE_SECRET || '';
        if (password.toLowerCase() !== secret.toLowerCase()) {
            setError('كلمة المرور غير صحيحة');
            return;
        }
        onConfirm(status, topics, homework, needsCompensation);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-x-hidden overflow-y-auto" role="dialog" aria-modal="true" onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            ></div>

            <div className="relative bg-card dark:bg-card border border-border shadow-elevation-3 w-full max-w-md overflow-hidden rounded-2xl animate-in zoom-in-95 duration-200">
                {/* Accent bar */}
                <div className="h-1 w-full bg-primary"></div>

                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/15 flex items-center justify-center">
                                <ShieldCheck size={20} className="text-primary" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-main">تسجيل حضور مؤكد</h3>
                                <p className="text-[11px] text-muted">كلمة مرور المشرف مطلوبة</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:bg-hover hover:text-main transition-all" aria-label="إغلاق">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Student info */}
                    <div className="text-center mb-5 p-4 bg-surface dark:bg-hover rounded-xl">
                        <p className="text-[11px] text-muted font-medium mb-1">تسجيل للطالب</p>
                        <h4 className="text-base font-bold text-main">{studentName}</h4>
                        <span className="text-[11px] text-primary font-bold mt-1 inline-block bg-primary/10 px-2.5 py-1 rounded-lg">
                            بتاريخ: {date}
                        </span>
                    </div>

                    {/* Status toggle */}
                    <div className="grid grid-cols-2 gap-2.5 mb-5">
                        <button
                            onClick={() => setStatus('completed')}
                            className={cn(
                                "flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 transition-all",
                                status === 'completed'
                                    ? "border-success bg-success/10 text-success"
                                    : "border-border bg-surface text-muted hover:border-success/50"
                            )}
                        >
                            <CheckCircle2 size={22} className={status === 'completed' ? "text-success" : "text-dim"} />
                            <span className="font-bold text-xs">حضور</span>
                        </button>
                        <button
                            onClick={() => setStatus('cancelled')}
                            className={cn(
                                "flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 transition-all",
                                status === 'cancelled'
                                    ? "border-error bg-error/10 text-error"
                                    : "border-border bg-surface text-muted hover:border-error/50"
                            )}
                        >
                            <XCircle size={22} className={status === 'cancelled' ? "text-error" : "text-dim"} />
                            <span className="font-bold text-xs">غياب</span>
                        </button>
                    </div>

                    {/* Completed fields */}
                    {status === 'completed' && (
                        <div className="space-y-3.5 mb-5 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="space-y-1.5">
                                <label htmlFor="attendance-topics" className="text-[11px] font-bold text-muted flex items-center gap-1.5">
                                    <BookOpen size={12} className="text-success" /> ما تم إنجازه في الحصة
                                </label>
                                <textarea
                                    id="attendance-topics"
                                    placeholder="مثلاً: مراجعة سورة البقرة، أول 10 آيات..."
                                    className="w-full p-3 bg-surface dark:bg-hover border border-border rounded-xl focus:border-success focus:ring-1 focus:ring-success/20 transition-all text-xs font-medium leading-relaxed dark:text-main resize-none"
                                    rows={2}
                                    value={topics}
                                    onChange={(e) => setTopics(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="attendance-homework" className="text-[11px] font-bold text-muted flex items-center gap-1.5">
                                    <Star size={12} className="text-warning" /> الواجب المطلوب
                                </label>
                                <input
                                    id="attendance-homework"
                                    type="text"
                                    placeholder="مثلاً: حفظ الجزء الثاني من الصفحة..."
                                    className="w-full p-3 bg-surface dark:bg-hover border border-border rounded-xl focus:border-warning focus:ring-1 focus:ring-warning/20 transition-all text-xs font-medium dark:text-main"
                                    value={homework}
                                    onChange={(e) => setHomework(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Cancelled checkbox */}
                    {status === 'cancelled' && (
                        <div className="mb-5 animate-in fade-in slide-in-from-top-2 duration-200">
                            <label className="flex items-center gap-3 p-3.5 bg-error/5 border border-error/20 rounded-xl cursor-pointer hover:bg-error/10 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={needsCompensation}
                                    onChange={(e) => setNeedsCompensation(e.target.checked)}
                                    className="w-4 h-4 rounded accent-error cursor-pointer"
                                />
                                <div>
                                    <p className="text-xs font-bold text-main">تحتاج لحصة تعويض؟</p>
                                    <p className="text-[10px] text-muted">سيتم إضافتها لقائمة الانتظار لجدولتها لاحقاً</p>
                                </div>
                            </label>
                        </div>
                    )}

                    {/* Password */}
                    <div className="space-y-1.5 mb-5">
                        <label htmlFor="attendance-password" className="text-[11px] font-bold text-muted flex items-center gap-1.5">
                            <Lock size={12} /> كلمة المرور للتأكيد
                        </label>
                        <input
                            id="attendance-password"
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder="أدخل كلمة المرور..."
                            className={cn(
                                "w-full p-3 bg-surface dark:bg-hover border rounded-xl outline-none focus:ring-1 transition-all text-xs font-medium text-center font-mono tracking-widest dark:text-main",
                                error ? "border-error focus:ring-error/20" : "border-border focus:border-primary focus:ring-primary/20"
                            )}
                            autoFocus
                        />
                        {error && <p className="text-[11px] text-error font-bold text-center">{error}</p>}
                    </div>

                    {/* Submit */}
                    <Button
                        onClick={handleConfirm}
                        variant="primary"
                        size="lg"
                        className="w-full"
                    >
                        تأكيد التسجيل
                    </Button>
                </div>
            </div>
        </div>
    );
};
