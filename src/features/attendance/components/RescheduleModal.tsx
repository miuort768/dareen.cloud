import { Calendar, Clock, AlertCircle, Save, X } from 'lucide-react';
import { useState } from 'react';

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-primary-active w-full max-w-md rounded-2xl shadow-sm border border-border/50 dark:border-border/50 overflow-hidden flex flex-col">

                <div className="p-4 bg-gradient-to-l from-[var(--bg-primary)] to-[var(--bg-primary)] text-on-primary flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calendar size={18} />
                        <h3 className="text-sm font-bold">طلب تغيير موعد حصة</h3>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-on-primary/60 hover:text-on-primary hover:bg-white/10 transition-colors rounded-xl">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-primary-active border border-border/50 dark:border-border/50 rounded-xl">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-warning) 7%, transparent)' }}>
                            <Clock size={18} style={{ color: 'var(--bg-warning)' }} />
                        </div>
                        <div>
                            <p className="text-micro font-bold text-muted">{subject}</p>
                            <h4 className="text-xs font-bold text-main dark:text-on-primary">{studentName}</h4>
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
                                    className="w-full text-xs font-bold p-3 bg-white dark:bg-primary-active border border-border dark:border-border rounded-xl outline-none focus:border-primary transition-all"
                                />
                                <input
                                    type="text"
                                    placeholder="الساعة (مثلا 4 عصراً)"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full text-xs font-bold p-3 bg-white dark:bg-primary-active border border-border dark:border-border rounded-xl outline-none focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-micro font-bold text-muted mb-1.5 block">سبب التغيير</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="مثلاً: الطالب لديه امتحان في المدرسة..."
                                className="w-full text-xs font-bold p-3 bg-white dark:bg-primary-active border border-border dark:border-border rounded-xl outline-none focus:border-primary transition-all min-h-[100px] resize-none"
                            />
                        </div>

                        <div className="flex items-start gap-2 p-3 rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-primary) 3%, transparent)', border: '1px solid color-mix(in srgb, var(--bg-primary) 13%, transparent)' }}>
                            <AlertCircle size={14} style={{ color: 'var(--bg-primary)' }} className="flex-shrink-0 mt-0.5" />
                            <p className="text-micro font-bold leading-relaxed" style={{ color: 'var(--bg-primary)' }}>
                                سيصل طلبك للإدارة فوراً للموافقة عليه، وسيتم إبلاغ ولي الأمر تلقائياً.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-5 pt-0 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-white dark:bg-primary-active text-main dark:text-on-primary border border-border dark:border-border font-bold text-xs rounded-xl shadow-sm hover:bg-surface transition-all active:scale-95"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={() => onConfirm({ date, time, reason })}
                        disabled={!time || !reason}
                        className="flex-[2] py-3 bg-gradient-to-l from-[var(--bg-primary)] to-[var(--bg-primary)] text-on-primary border-0 font-bold text-xs rounded-xl shadow-sm hover:from-[var(--bg-primary-hover)] hover:to-[var(--bg-primary)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Save size={16} />
                        إرسال الطلب الآن
                    </button>
                </div>
            </div>
        </div>
    );
};
