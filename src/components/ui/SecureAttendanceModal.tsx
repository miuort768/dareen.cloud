import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, CheckCircle2, XCircle, Lock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SecureAttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (status: 'completed' | 'cancelled') => void;
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
    const [status, setStatus] = useState<'completed' | 'cancelled'>('completed'); // Default to Present
    const [error, setError] = useState('');

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setPassword('');
            setStatus('completed');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (password.toLowerCase() !== 'dareen') {
            setError('كلمة المرور غير صحيحة');
            return;
        }
        onConfirm(status);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-x-hidden overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden rounded-lg">
                {/* Header */}
                <div className="bg-primary-600 p-4 text-white flex justify-between items-center">
                    <div className="flex items-center gap-2 font-bold">
                        <ShieldCheck size={20} />
                        <span>تسجيل حضور مؤكد</span>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-bold mb-1">تسجيل للطالب</p>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white">{studentName}</h3>
                        <p className="text-xs text-primary-600 font-bold mt-1 bg-primary-50 inline-block px-2 py-1 rounded dark:bg-primary-900/20 dark:text-primary-400">
                            بتاريخ: {date}
                        </p>
                    </div>

                    {/* Status Selection */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setStatus('completed')}
                            className={cn(
                                "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
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
                                "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                                status === 'cancelled'
                                    ? "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"
                                    : "border-gray-100 bg-white text-gray-400 hover:border-rose-200 dark:bg-gray-800 dark:border-gray-700"
                            )}
                        >
                            <XCircle size={24} className={status === 'cancelled' ? "text-rose-500" : "text-gray-300"} />
                            <span className="font-bold text-sm">غياب</span>
                        </button>
                    </div>

                    {/* Password Input */}
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
                                "w-full p-3 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white transition-all text-center font-mono tracking-widest",
                                error ? "border-red-500 focus:ring-red-500" : "border-gray-200 dark:border-gray-700"
                            )}
                            autoFocus
                        />
                        {error && <p className="text-xs text-red-500 font-bold text-center animate-pulse">{error}</p>}
                    </div>

                    <button
                        onClick={handleConfirm}
                        className="w-full bg-primary-600 text-white py-3 rounded-lg font-black shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        تأكيد التسجيل
                    </button>
                </div>
            </div>
        </div>
    );
};
