import React, { useState } from 'react';
import { X, Send, Bell } from 'lucide-react';
import { Button } from '../components/ui/Button';

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir="rtl" role="dialog" aria-modal="true" onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
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
                                <Bell size={20} className="text-primary" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-main">بث إشعار فوري</h3>
                                <p className="text-[11px] text-muted">إلى: <span className="text-primary font-bold">{recipientName}</span></p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:bg-hover hover:text-main transition-all" aria-label="إغلاق">
                            <X size={16} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Message */}
                        <div className="space-y-1.5">
                            <label htmlFor="notification-message" className="text-[11px] font-bold text-muted">محتوى التنبيه</label>
                            <textarea
                                id="notification-message"
                                required
                                autoFocus
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="اكتب رسالتك هنا..."
                                className="w-full h-28 p-3 bg-surface dark:bg-hover border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary/20 text-xs font-medium resize-none leading-relaxed transition-all outline-none dark:text-main"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col gap-2.5">
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                className="w-full"
                                disabled={!message.trim()}
                                rightIcon={<Send size={16} />}
                            >
                                إرسال التنبيه الآن
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                size="lg"
                                className="w-full"
                                onClick={onClose}
                            >
                                إلغاء
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
