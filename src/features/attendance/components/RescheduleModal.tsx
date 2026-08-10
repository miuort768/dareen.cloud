import { Calendar, Clock, AlertCircle, Save, X } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

interface RescheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: { date: string, time: string, reason: string }) => void;
    studentName: string;
    subject: string;
}

export const RescheduleModal = ({ isOpen, onClose, onConfirm, studentName, subject }: RescheduleModalProps) => {
    const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [time, setTime] = useState('');
    const [reason, setReason] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;
        const first = containerRef.current?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        first?.focus();
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div ref={containerRef} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in" role="dialog" aria-modal="true" aria-label="طلب تغيير موعد" onKeyDown={handleKeyDown}>
            <div className="bg-card w-full max-w-md rounded-2xl shadow-elevation-2 border border-border overflow-hidden flex flex-col">

                <div className="p-4 bg-primary text-on-primary flex items-center justify-between rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <Calendar size={18} />
                        <h3 className="text-sm font-bold">طلب تغيير موعد حصة</h3>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-on-primary/60 hover:text-on-primary hover:bg-white/15 transition-colors rounded-xl" aria-label="إغلاق">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    <div className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-warning-soft text-warning">
                            <Clock size={18} />
                        </div>
                        <div>
                            <p className="text-micro font-bold text-muted">{subject}</p>
                            <h4 className="text-xs font-bold text-main">{studentName}</h4>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-micro font-bold text-muted mb-1.5 block">الموعد الجديد المقترح</label>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full text-xs font-bold p-3 bg-surface border border-border rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/10 transition-all"
                                />
                                <input
                                    type="text"
                                    placeholder="الساعة (مثلا 4 عصراً)"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full text-xs font-bold p-3 bg-surface border border-border rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/10 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-micro font-bold text-muted mb-1.5 block">سبب التغيير</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="مثلاً: الطالب لديه امتحان في المدرسة..."
                                    className="w-full text-xs font-bold p-3 bg-surface border border-border rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/10 transition-all min-h-[100px] resize-none"
                            />
                        </div>

                        <div className="flex items-start gap-2 p-3 rounded-xl bg-primary-soft border border-primary/20">
                            <AlertCircle size={14} className="text-primary flex-shrink-0 mt-0.5" />
                            <p className="text-micro font-bold leading-relaxed text-primary">
                                سيصل طلبك للإدارة فوراً للموافقة عليه، وسيتم إبلاغ ولي الأمر تلقائياً.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-5 pt-0 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-surface text-main border border-border font-bold text-xs rounded-xl hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus transition-all active:scale-95"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={() => onConfirm({ date, time, reason })}
                        disabled={!time || !reason}
                        className="flex-[2] py-3 bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    >
                        <Save size={16} />
                        إرسال الطلب الآن
                    </button>
                </div>
            </div>
        </div>
    );
};
