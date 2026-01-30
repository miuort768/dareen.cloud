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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div
                className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-2xl w-full max-w-md overflow-hidden rounded-none">
                <div className="h-1.5 w-full bg-indigo-600"></div>

                <div className="p-8">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-900/30 flex items-center justify-center mb-6 shadow-inner">
                            <Bell size={32} />
                        </div>

                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1 uppercase tracking-tight">
                            إرسال إشعار
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 font-bold text-xs mb-6">
                            إلى المعلمة: <span className="text-indigo-600 dark:text-indigo-400">{recipientName}</span>
                        </p>

                        <form onSubmit={handleSubmit} className="w-full space-y-4">
                            <div className="space-y-2 text-right">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">نص الرسالة</label>
                                <textarea
                                    required
                                    autoFocus
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="اكتب هنا التنبيه الذي تود إرساله للمعلمة..."
                                    className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-none focus:outline-none focus:border-indigo-500 dark:text-white text-sm font-bold resize-none leading-relaxed"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 w-full">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-6 h-12 border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-slate-400 font-black text-sm uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-gray-800 rounded-none"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={!message.trim()}
                                    className="flex-1 px-6 h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-600/20 rounded-none disabled:opacity-50"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <span>إرسال الآن</span>
                                        <Send size={16} />
                                    </div>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
