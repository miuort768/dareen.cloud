import { useState, useEffect } from 'react';
import { Mail, Trash2, Phone, MessageCircle, Search, Clock, User, BookOpen, Inbox } from 'lucide-react';
import { api, safeArray } from '../lib/api';
import { confirm } from '../lib/confirmDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsLoading } from '../context/AppContext';

interface ContactMsg {
    id: string;
    name: string;
    phone: string;
    subject: string;
    curriculum: string;
    message: string;
    createdAt: string;
}

export const AdminContacts = () => {
    useEffect(() => { document.title = 'رسائل التواصل | دارين السابعة للتعليم والتدريب'; }, []);
    const [messages, setMessages] = useState<ContactMsg[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const authLoading = useIsLoading();

    useEffect(() => {
        if (authLoading) return;

        const abort = new AbortController();
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await api.get<ContactMsg[]>('/contact');
                if (abort.signal.aborted) return;
                setMessages(safeArray<ContactMsg>(data));
            } catch (err) {
                if (abort.signal.aborted) return;
                const msg = err instanceof Error ? err.message : 'حدث خطأ في تحميل الرسائل';
                setError(msg);
                console.error(err);
            } finally {
                if (!abort.signal.aborted) setLoading(false);
            }
        })();
        return () => abort.abort();
    }, [authLoading]);

    const handleDelete = async (id: string) => {
        const confirmed = await confirm('هل أنت متأكد من حذف هذه الرسالة؟ لا يمكن التراجع عن هذا الإجراء.', {
            title: 'حذف الرسالة',
            confirmText: 'حذف',
            cancelText: 'تراجع',
            isDestructive: true,
            icon: <Trash2 size={28} />
        });
        if (!confirmed) return;
        try {
            await api.delete(`/contact/${id}`);
            setMessages(messages.filter(m => m.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const filtered = messages.filter(m => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
            (m.name || '').toLowerCase().includes(q) ||
            m.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
            (m.subject || '').toLowerCase().includes(q) ||
            (m.message || '').toLowerCase().includes(q) ||
            (m.curriculum || '').toLowerCase().includes(q)
        );
    });

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('ar-EG', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative bg-surface" dir="rtl">
            <div className="relative z-10 max-w-page mx-auto px-2 mb-4">
                {/* Compact Header */}
                <div className="bg-surface border border-border/50 rounded-2xl p-3 md:p-4 mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-info-soft flex items-center justify-center">
                                <Mail size={17} className="text-info" />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold text-main leading-tight">رسائل الاتصال</h1>
                                <p className="text-[10px] text-dim">{messages.length} رسالة</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-1 mb-4">
                    <div className="relative">
                        <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={13} />
                        <input
                            type="text"
                            placeholder="بحث بالاسم أو الهاتف أو الموضوع..."
                            aria-label="ابحث في الرسائل"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-surface border border-border/50 rounded-xl py-2.5 ps-8 pe-3 text-xs font-bold text-main placeholder:text-muted focus:outline-none focus:border-primary transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="relative z-10 max-w-page mx-auto px-3 space-y-3">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={`skel-${i}`} className="bg-surface h-24 animate-pulse border border-border/30 rounded-2xl" />
                        ))}
                    </div>
                ) : error ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-surface border border-error/30 shadow-soft rounded-2xl p-6 text-center"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-error-soft flex items-center justify-center mx-auto mb-3">
                            <Trash2 size={20} className="text-error" />
                        </div>
                        <p className="text-xs font-bold text-error">{error}</p>
                                        <button
                                            type="button"
                                            onClick={() => window.location.reload()}
                                            className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-on-primary text-[10px] font-bold hover:bg-primary-hover transition-colors min-h-[44px]"
                                        >
                                            إعادة تحميل
                                        </button>
                    </motion.div>
                ) : filtered.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-surface border border-border/30 shadow-soft rounded-2xl p-6 text-center"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-primary-soft flex items-center justify-center mx-auto mb-3">
                            <Inbox size={20} className="text-primary" />
                        </div>
                        <p className="text-base sm:text-lg font-bold text-main">لا توجد رسائل</p>
                        <p className="text-xs sm:text-sm text-muted mt-1.5 sm:mt-2">ستظهر هنا رسائل الزوار</p>
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {filtered.map((msg, index) => (
                                <motion.div
                                    key={msg.id}
                                    layout
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -12, transition: { duration: 0.15 } }}
                                    transition={{ duration: 0.2, delay: index * 0.03 }}
                                    className="group bg-surface border border-border/30 shadow-sm hover:border-primary/20 transition-all duration-200 overflow-hidden rounded-2xl"
                                >
                                    <div className="h-0.5 w-full bg-primary/20" />
                                    <div className="p-3 sm:p-4 relative z-10">
                                        <div className="flex items-center gap-2 sm:justify-between sm:items-start gap-3 mb-3">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-8 h-8 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
                                                    <User size={14} className="text-primary" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-xs font-bold text-main truncate">{msg.name || 'بدون اسم'}</h3>
                                                    <p className="text-[10px] text-dim truncate">{msg.subject || 'بدون موضوع'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                                                <a href={`tel:${msg.phone}`}
                                                    className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-success bg-success-soft hover:bg-success-light transition-all text-[10px] font-bold min-h-[44px] active:scale-95"
                                                    aria-label={`اتصال بـ ${msg.phone}`}>
                                                    <Phone size={13} />
                                                </a>
                                                <a href={`https://wa.me/${msg.phone.replace(/\D/g, '')}`}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-success bg-success-soft hover:bg-success-light transition-all text-[10px] font-bold min-h-[44px] active:scale-95"
                                                    aria-label="مراسلة عبر واتساب">
                                                    <MessageCircle size={13} />
                                                </a>
                                                <button type="button" onClick={() => handleDelete(msg.id)}
                                                    className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-error bg-error-soft hover:bg-error-light transition-all text-[10px] font-bold min-h-[44px] active:scale-95"
                                                    aria-label="حذف الرسالة">
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-background p-3 rounded-xl mb-3 border border-border/20">
                                            <p className="text-xs font-bold text-main leading-relaxed whitespace-pre-wrap">{msg.message || 'لا توجد رسالة'}</p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-success-soft text-success text-[10px] font-bold">
                                                <span className="truncate max-w-[120px]">{msg.phone}</span>
                                                <Phone size={10} />
                                            </span>
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary-soft text-primary text-[10px] font-bold">
                                                <span className="truncate max-w-[100px]">{msg.curriculum || '-'}</span>
                                                <BookOpen size={10} />
                                            </span>
                                            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-background text-dim text-[10px] font-bold">
                                                <span>{formatDate(msg.createdAt)}</span>
                                                <Clock size={10} />
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};