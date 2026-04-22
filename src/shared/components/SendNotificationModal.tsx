import React, { useState } from 'react';
import { X, Send, Bell } from 'lucide-react';

interface SendNotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (message: string) => void;
    recipientName: string;
}

export const SendNotificationModal: React.FC<SendNotificationModalProps> = ({
    isOpen,
    onClose,
    onSend,
    recipientName
}) => {
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            onSend(message);
            setMessage('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir="rtl">
            <div
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden rounded-none animate-in zoom-in-95 duration-200">
                {/* Visual Header Accent */}
                <div className="h-1.5 w-full bg-[var(--primary-color,#5c59f2)] shadow-[0_0_15px_rgba(92,89,242,0.4)]"></div>

                {/* Decorative Geometric Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-white/5 -rotate-45 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                <div className="p-10 relative z-10">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-indigo-50 text-[var(--primary-color,#5c59f2)] border-2 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-900/30 flex items-center justify-center mb-6 shadow-xl rotate-3">
                            <div className="-rotate-3">
                                <Bell size={36} strokeWidth={1.5} />
                            </div>
                        </div>

                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tighter italic">
                            بث إشعار فوري
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] mb-8 uppercase tracking-widest">
                            إلى: <span className="text-[var(--primary-color,#5c59f2)]">{recipientName}</span>
                        </p>

                        <form onSubmit={handleSubmit} className="w-full space-y-6 text-right">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mr-1">محتوى التنبيه</label>
                                <textarea
                                    required
                                    autoFocus
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="اكتب رسالتك هنا..."
                                    className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-none focus:outline-none focus:border-[var(--primary-color,#5c59f2)] dark:text-white text-xs font-black resize-none leading-relaxed transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-3 w-full">
                                <button
                                    type="submit"
                                    disabled={!message.trim()}
                                    className="px-6 h-14 bg-[var(--primary-color,#5c59f2)] hover:opacity-90 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/10 rounded-none disabled:opacity-30 transition-all active:scale-95"
                                >
                                    <div className="flex items-center justify-center gap-3">
                                        <span>إرسال التنبيه الآن</span>
                                        <Send size={16} />
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 h-12 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all rounded-none"
                                >
                                    إلغاء العملية
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
