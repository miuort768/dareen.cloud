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
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 border-4 border-gray-950 w-full max-w-md shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col">
                
                {/* Header (Suggestion 4) */}
                <div className="p-6 border-b-4 border-gray-950 bg-amber-500 text-gray-950 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Calendar size={20} className="font-medium" />
                        <h3 className="text-sm font-medium uppercase tracking-tighter italic">طلب تغيير موعد حصة</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-black/10 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 border-2 border-gray-950 flex items-center gap-4">
                        <div className="w-10 h-10 bg-white dark:bg-gray-950 border-2 border-gray-950 flex items-center justify-center text-primary-600">
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{subject}</p>
                            <h4 className="text-xs font-medium text-gray-900 dark:text-white uppercase">{studentName}</h4>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1.5 block">الموعد الجديد المقترح</label>
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    type="date" 
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full text-xs font-medium p-3 bg-white dark:bg-gray-950 border-2 border-gray-950 focus:ring-4 focus:ring-amber-500/20 outline-none"
                                />
                                <input 
                                    type="text" 
                                    placeholder="الساعة (مثلا 4 عصراً)"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full text-xs font-medium p-3 bg-white dark:bg-gray-950 border-2 border-gray-950 focus:ring-4 focus:ring-amber-500/20 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1.5 block">سبب التغيير</label>
                            <textarea 
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="مثلاً: الطالب لديه امتحان في المدرسة..."
                                className="w-full text-xs font-medium p-3 bg-white dark:bg-gray-950 border-2 border-gray-950 focus:ring-4 focus:ring-amber-500/20 outline-none min-h-[100px] resize-none"
                            />
                        </div>

                        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/10 border-2 border-gray-950">
                            <AlertCircle size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-[9px] font-bold text-blue-700 dark:text-blue-400 leading-relaxed uppercase">
                                سيصل طلبك للإدارة فوراً للموافقة عليه، وسيتم إبلاغ ولي الأمر تلقائياً.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t-4 border-gray-950 flex gap-4">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-4 bg-white text-gray-950 border-2 border-gray-950 font-medium text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    >
                        إلغاء
                    </button>
                    <button 
                        onClick={() => onConfirm({ date, time, reason })}
                        disabled={!time || !reason}
                        className="flex-3 py-4 bg-amber-500 text-gray-950 border-2 border-gray-950 font-medium text-xs uppercase tracking-widest hover:bg-amber-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
                    >
                        <Save size={16} />
                        إرسال الطلب الآن
                    </button>
                </div>
            </div>
        </div>
    );
};
