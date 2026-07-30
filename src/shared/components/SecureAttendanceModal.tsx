import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, CheckCircle2, XCircle, Lock, BookOpen, Star } from 'lucide-react';
import { cn } from '../../lib/utils';

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
                className="fixed inset-0 bg-background/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative bg-white dark:bg-card border border-border shadow-2xl w-full max-w-md overflow-hidden rounded-none">
                <div className="bg-primary p-4 text-on-primary flex justify-between items-center">
                    <div className="flex items-center gap-2 font-bold">
                        <ShieldCheck size={20} />
                        <span>تسجيل حضور مؤكد</span>
                    </div>
                    <button onClick={onClose} className="text-on-primary/80 hover:text-on-primary" aria-label="إغلاق">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <p className="text-sm text-muted font-bold mb-1">تسجيل للطالب</p>
                        <h3 className="text-lg font-bold text-main">{studentName}</h3>
                        <p className="text-xs text-primary font-bold mt-1 bg-primary-soft inline-block px-2 py-1 rounded-none dark:bg-primary/20">
                            بتاريخ: {date}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setStatus('completed')}
                            className={cn(
                                "flex flex-col items-center gap-2 p-3 rounded-none border-2",
                                status === 'completed'
                                    ? "border-success bg-success-light text-success dark:bg-success/20"
                                    : "border-border bg-white text-muted hover:border-success dark:bg-card dark:border-border"
                            )}
                        >
                            <CheckCircle2 size={24} className={status === 'completed' ? "text-success" : "text-dim"} />
                            <span className="font-bold text-sm">حضور</span>
                        </button>
                        <button
                            onClick={() => setStatus('cancelled')}
                            className={cn(
                                "flex flex-col items-center gap-2 p-3 rounded-none border-2",
                                status === 'cancelled'
                                    ? "border-error bg-error-light text-error dark:bg-error/20"
                                    : "border-border bg-white text-muted hover:border-error dark:bg-card dark:border-border"
                            )}
                        >
                            <XCircle size={24} className={status === 'cancelled' ? "text-error" : "text-dim"} />
                            <span className="font-bold text-sm">غياب</span>
                        </button>
                    </div>

                    {status === 'completed' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="space-y-2">
                                <label htmlFor="attendance-topics" className="text-micro font-semibold text-muted uppercase tracking-widest flex items-center gap-2">
                                    <BookOpen size={12} className="text-success" /> ما تم إنجازه في الحصة
                                </label>
                                <textarea 
                                    id="attendance-topics"
                                    placeholder="مثلاً: مراجعة سورة البقرة، أول 10 آيات..."
                                    className="w-full p-4 bg-background border-2 border-border rounded-none focus:border-success focus:bg-white transition-all text-xs font-bold leading-relaxed dark:bg-card dark:text-main"
                                    rows={2}
                                    value={topics}
                                    onChange={(e) => setTopics(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="attendance-homework" className="text-micro font-semibold text-muted uppercase tracking-widest flex items-center gap-2">
                                    <Star size={12} className="text-warning" /> الواجب المطلوب
                                </label>
                                <input 
                                    id="attendance-homework"
                                    type="text"
                                    placeholder="مثلاً: حفظ الجزء الثاني من الصفحة..."
                                    className="w-full p-4 bg-background border-2 border-border rounded-none focus:border-warning focus:bg-white transition-all text-xs font-bold dark:bg-card dark:text-main"
                                    value={homework}
                                    onChange={(e) => setHomework(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {status === 'cancelled' && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                            <label className="flex items-center gap-3 p-4 bg-error-light border-2 border-error cursor-pointer hover:bg-error-light/50 transition-colors">
                                <input 
                                    type="checkbox"
                                    checked={needsCompensation}
                                    onChange={(e) => setNeedsCompensation(e.target.checked)}
                                    className="w-5 h-5 rounded-none accent-error cursor-pointer"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-error uppercase tracking-tighter">تحتاج لحصة تعويض؟</p>
                                    <p className="text-micro font-bold text-error">سيتم إضافتها لقائمة الانتظار لجدولتها لاحقاً</p>
                                </div>
                            </label>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="attendance-password" className="text-xs font-bold text-muted dark:text-dim flex items-center gap-1">
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
                                "w-full p-3 bg-background border rounded-none outline-none focus:ring-0 focus:border-primary dark:bg-card dark:text-main text-center font-mono tracking-widest",
                                error ? "border-error" : "border-border"
                            )}
                            autoFocus
                        />
                        {error && <p className="text-xs text-error font-bold text-center">{error}</p>}
                    </div>

                    <button
                        onClick={handleConfirm}
                        className="w-full bg-primary text-on-primary py-3 rounded-none font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover flex items-center justify-center gap-2"
                    >
                        تأكيد التسجيل
                    </button>
                </div>
            </div>
        </div>
    );
};
