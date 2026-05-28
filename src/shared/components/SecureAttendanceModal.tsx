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
        const secret = import.meta.env.VITE_ATTENDANCE_SECRET || 'dareen@2024';
        if (password.toLowerCase() !== secret.toLowerCase()) {
            setError('كلمة المرور غير صحيحة');
            return;
        }
        onConfirm(status, topics, homework, needsCompensation);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-x-hidden overflow-y-auto">
            <div
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-2xl w-full max-w-md overflow-hidden rounded-none">
                <div className="bg-primary-600 p-4 text-white flex justify-between items-center">
                    <div className="flex items-center gap-2 font-bold">
                        <ShieldCheck size={20} />
                        <span>تسجيل حضور مؤكد</span>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-bold mb-1">تسجيل للطالب</p>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white">{studentName}</h3>
                        <p className="text-xs text-primary-600 font-bold mt-1 bg-primary-50 inline-block px-2 py-1 rounded-none dark:bg-primary-900/20 dark:text-primary-400">
                            بتاريخ: {date}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setStatus('completed')}
                            className={cn(
                                "flex flex-col items-center gap-2 p-3 rounded-none border-2",
                                status === 'completed'
                                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                                    : "border-gray-100 bg-white text-gray-400 hover:border-emerald-200 dark:bg-gray-800 dark:border-gray-700"
                            )}
                        >
                            <CheckCircle2 size={24} className={status === 'completed' ? "text-emerald-500" : "text-gray-300"} />
                            <span className="font-bold text-sm">حضور</span>
                        </button>
                        <button
                            onClick={() => setStatus('cancelled')}
                            className={cn(
                                "flex flex-col items-center gap-2 p-3 rounded-none border-2",
                                status === 'cancelled'
                                    ? "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"
                                    : "border-gray-100 bg-white text-gray-400 hover:border-rose-200 dark:bg-gray-800 dark:border-gray-700"
                            )}
                        >
                            <XCircle size={24} className={status === 'cancelled' ? "text-rose-500" : "text-gray-300"} />
                            <span className="font-bold text-sm">غياب</span>
                        </button>
                    </div>

                    {status === 'completed' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <BookOpen size={12} className="text-emerald-500" /> ما تم إنجازه في الحصة
                                </label>
                                <textarea 
                                    placeholder="مثلاً: مراجعة سورة البقرة، أول 10 آيات..."
                                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-none focus:border-emerald-500 focus:bg-white transition-all text-xs font-bold leading-relaxed dark:bg-gray-800 dark:text-white dark:border-gray-700"
                                    rows={2}
                                    value={topics}
                                    onChange={(e) => setTopics(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Star size={12} className="text-amber-500" /> الواجب المطلوب
                                </label>
                                <input 
                                    type="text"
                                    placeholder="مثلاً: حفظ الجزء الثاني من الصفحة..."
                                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-none focus:border-amber-500 focus:bg-white transition-all text-xs font-bold dark:bg-gray-800 dark:text-white dark:border-gray-700"
                                    value={homework}
                                    onChange={(e) => setHomework(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {status === 'cancelled' && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                            <label className="flex items-center gap-3 p-4 bg-rose-50 border-2 border-rose-100 cursor-pointer hover:bg-rose-100/50 transition-colors">
                                <input 
                                    type="checkbox"
                                    checked={needsCompensation}
                                    onChange={(e) => setNeedsCompensation(e.target.checked)}
                                    className="w-5 h-5 rounded-none accent-rose-600 cursor-pointer"
                                />
                                <div>
                                    <p className="text-sm font-black text-rose-700 uppercase tracking-tighter">تحتاج لحصة تعويض؟</p>
                                    <p className="text-[10px] font-bold text-rose-500">سيتم إضافتها لقائمة الانتظار لجدولتها لاحقاً</p>
                                </div>
                            </label>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1">
                            <Lock size={12} /> كلمة المرور للتأكيد
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder="أدخل كلمة المرور..."
                            className={cn(
                                "w-full p-3 bg-gray-50 border rounded-none outline-none focus:ring-0 focus:border-primary-500 dark:bg-gray-800 dark:text-white text-center font-mono tracking-widest",
                                error ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                            )}
                            autoFocus
                        />
                        {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}
                    </div>

                    <button
                        onClick={handleConfirm}
                        className="w-full bg-primary-600 text-white py-3 rounded-none font-black shadow-lg shadow-primary-600/20 hover:bg-primary-700 flex items-center justify-center gap-2"
                    >
                        تأكيد التسجيل
                    </button>
                </div>
            </div>
        </div>
    );
};
