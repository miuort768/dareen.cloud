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
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-800/50 overflow-hidden flex flex-col">

                <div className="p-4 bg-[#172554] text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calendar size={18} />
                        <h3 className="text-sm font-bold">طلب تغيير موعد حصة</h3>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors rounded-xl">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 rounded-xl">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F59E0B12' }}>
                            <Clock size={18} style={{ color: '#D97706' }} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400">{subject}</p>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{studentName}</h4>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 mb-1.5 block">الموعد الجديد المقترح</label>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full text-xs font-bold p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-[#2563EB] transition-all"
                                />
                                <input
                                    type="text"
                                    placeholder="الساعة (مثلا 4 عصراً)"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full text-xs font-bold p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-[#2563EB] transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-slate-400 mb-1.5 block">سبب التغيير</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="مثلاً: الطالب لديه امتحان في المدرسة..."
                                className="w-full text-xs font-bold p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-[#2563EB] transition-all min-h-[100px] resize-none"
                            />
                        </div>

                        <div className="flex items-start gap-2 p-3 rounded-xl" style={{ backgroundColor: '#2563EB08', border: '1px solid #2563EB20' }}>
                            <AlertCircle size={14} style={{ color: '#2563EB' }} className="flex-shrink-0 mt-0.5" />
                            <p className="text-[9px] font-bold leading-relaxed" style={{ color: '#1D4ED8' }}>
                                سيصل طلبك للإدارة فوراً للموافقة عليه، وسيتم إبلاغ ولي الأمر تلقائياً.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-5 pt-0 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 font-bold text-xs rounded-xl shadow-sm hover:bg-slate-50 transition-all active:scale-95"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={() => onConfirm({ date, time, reason })}
                        disabled={!time || !reason}
                        className="flex-[2] py-3 bg-[#F59E0B] text-white border-0 font-bold text-xs rounded-xl shadow-sm hover:bg-amber-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Save size={16} />
                        إرسال الطلب الآن
                    </button>
                </div>
            </div>
        </div>
    );
};
