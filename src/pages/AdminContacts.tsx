import { useState, useEffect } from 'react';
import { Mail, Trash2, Phone, MessageCircle, Search, Clock, User, BookOpen, Inbox } from 'lucide-react';
import { api } from '../lib/api';
import { confirm } from '../lib/confirmDialog';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [messages, setMessages] = useState<ContactMsg[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        const abort = new AbortController();
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await api.get<ContactMsg[]>('/contact');
                if (abort.signal.aborted) return;
                setMessages(data);
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
    }, [retry]);

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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
    };

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative" dir="rtl">
            {/* Decorative background blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 -end-40 w-80 h-80 bg-gradient-to-br from-primary/5 via-purple-200/10 to-transparent rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -start-40 w-96 h-96 bg-gradient-to-tr from-sky-200/10 via-primary/5 to-transparent rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-3 sm:px-4 mb-4 sm:mb-6">
                {/* Premium Header Card */}
                <div className="relative overflow-hidden rounded-none bg-gradient-to-br from-primary via-indigo-600 to-purple-700 shadow-xl shadow-primary/25">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
                    <div className="absolute top-0 end-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 start-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
                    <div className="relative p-4 sm:p-5 md:p-6 lg:p-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 md:gap-5">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 rounded-none bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-inner">
                                    <Mail size={20} className="sm:hidden text-white" />
                                    <Mail size={24} className="hidden sm:inline md:hidden text-white" />
                                    <Mail size={26} className="hidden md:inline text-white" />
                                </div>
                                <div className="text-white">
                                    <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold font-heading leading-tight text-white">رسائل الاتصال</h1>
                                    <p className="text-xs sm:text-sm text-white/70 mt-0.5 md:mt-1">{messages.length} رسالة</p>
                                </div>
                            </div>
                            <div className="relative w-full md:w-auto md:min-w-[280px] lg:min-w-[320px]">
                                <Search className="absolute start-3 sm:start-4 top-1/2 -translate-y-1/2 text-white/50" size={15} />
                                <input
                                    type="text"
                                    placeholder="ابحث بالاسم أو الهاتف أو الموضوع..."
                                    aria-label="ابحث في الرسائل"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full bg-white/15 backdrop-blur-sm border border-white/20 rounded-none py-3 sm:py-3.5 md:py-4 ps-9 sm:ps-10 pe-3 sm:pe-4 text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/15 min-h-[44px] transition-all duration-200"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-3 sm:px-4 space-y-3 sm:space-y-4">
                {loading ? (
                    <div className="space-y-3 sm:space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white dark:bg-card h-24 sm:h-28 md:h-32 animate-pulse border border-border/30 shadow-soft rounded-none" />
                        ))}
                    </div>
                ) : error ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-card border border-rose-200/50 dark:border-rose-800/30 shadow-soft rounded-none p-8 sm:p-10 md:p-12 lg:p-16 text-center"
                    >
                        <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-none bg-gradient-to-br from-rose-100 to-rose-50 dark:from-rose-900/30 dark:to-rose-900/10 flex items-center justify-center mx-auto mb-4 sm:mb-5">
                            <Trash2 size={24} className="sm:hidden text-rose-500" />
                            <Trash2 size={28} className="hidden sm:inline text-rose-500" />
                        </div>
                        <p className="text-base sm:text-lg font-bold text-rose-600 dark:text-rose-400">حدث خطأ</p>
                        <p className="text-xs sm:text-sm text-muted mt-1.5 sm:mt-2">{error}</p>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="mt-4 sm:mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-none bg-primary text-white text-xs sm:text-sm font-bold hover:bg-primary-hover transition-colors min-h-[44px]"
                        >
                            إعادة تحميل
                        </button>
                    </motion.div>
                ) : filtered.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-card border border-border/30 shadow-soft rounded-none p-8 sm:p-10 md:p-12 lg:p-16 text-center"
                    >
                        <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-none bg-gradient-to-br from-primary-soft to-primary/10 flex items-center justify-center mx-auto mb-4 sm:mb-5">
                            <Inbox size={24} className="sm:hidden text-primary" />
                            <Inbox size={28} className="hidden sm:inline text-primary" />
                        </div>
                        <p className="text-base sm:text-lg font-bold text-main">لا توجد رسائل</p>
                        <p className="text-xs sm:text-sm text-muted mt-1.5 sm:mt-2">ستظهر هنا رسائل الزوار</p>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-3 sm:space-y-4"
                    >
                        <AnimatePresence>
                            {filtered.map(msg => (
                                <motion.div
                                    key={msg.id}
                                    layout
                                    variants={itemVariants}
                                    exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                                    className="group bg-white dark:bg-card border border-border/30 shadow-soft hover:shadow-md hover:border-primary/20 transition-all duration-300 overflow-hidden rounded-none"
                                >
                                    <div className="h-1.5 w-full bg-gradient-to-l from-primary via-indigo-500 to-purple-500" />
                                    <div className="p-4 sm:p-5 md:p-6 lg:p-8 relative z-10">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0 mb-3 sm:mb-4">
                                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                                <div className="w-8 sm:w-9 md:w-10 h-8 sm:h-9 md:h-10 rounded-none bg-gradient-to-br from-primary-soft to-primary/5 dark:from-primary-soft/20 dark:to-primary/10 flex items-center justify-center shrink-0">
                                                    <User size={14} className="sm:hidden text-primary" />
                                                    <User size={16} className="hidden sm:inline md:hidden text-primary" />
                                                    <User size={18} className="hidden md:inline text-primary" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-xs sm:text-sm font-bold text-main truncate">{msg.name || 'بدون اسم'}</h3>
                                                    <p className="text-[11px] sm:text-xs text-muted mt-0.5 truncate">{msg.subject || 'بدون موضوع'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap shrink-0">
                                                <a href={`tel:${msg.phone}`}
                                                    className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-1.5 md:px-3 py-2 sm:py-1.5 md:py-2 rounded-none text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-800/40 transition-all duration-200 text-xs font-bold min-w-[44px] min-h-[44px] md:min-h-0 shadow-sm active:scale-95"
                                                    aria-label={`اتصال بـ ${msg.phone}`}>
                                                    <span className="inline">اتصال</span>
                                                    <Phone size={16} className="md:size-[14px]" />
                                                </a>
                                                <a href={`https://wa.me/${msg.phone.replace(/\D/g, '')}`}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-1.5 md:px-3 py-2 sm:py-1.5 md:py-2 rounded-none text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-800/40 transition-all duration-200 text-xs font-bold min-w-[44px] min-h-[44px] md:min-h-0 shadow-sm active:scale-95"
                                                    aria-label="مراسلة عبر واتساب">
                                                    <span className="inline">واتساب</span>
                                                    <MessageCircle size={16} className="md:size-[14px]" />
                                                </a>
                                                <button type="button" onClick={() => handleDelete(msg.id)}
                                                    className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-1.5 md:px-3 py-2 sm:py-1.5 md:py-2 rounded-none text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-800/40 transition-all duration-200 text-xs font-bold min-w-[44px] min-h-[44px] md:min-h-0 shadow-sm active:scale-95"
                                                    aria-label="حذف الرسالة">
                                                    <span className="inline">حذف</span>
                                                    <Trash2 size={16} className="md:size-[14px]" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-background/40 dark:bg-black/30 p-3 sm:p-4 md:p-5 rounded-none mb-3 border border-border/20">
                                            <p className="text-xs sm:text-sm font-medium text-main leading-relaxed whitespace-pre-wrap">{msg.message || 'لا توجد رسالة'}</p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                            <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-none bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30 text-[11px] sm:text-xs shadow-sm">
                                                <span className="truncate max-w-[120px] sm:max-w-none">{msg.phone}</span>
                                                <Phone size={11} className="sm:size-[12px]" />
                                            </span>
                                            <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-none bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/30 text-[11px] sm:text-xs shadow-sm">
                                                <span className="truncate max-w-[100px] sm:max-w-none">{msg.curriculum || '-'}</span>
                                                <BookOpen size={11} className="sm:size-[12px]" />
                                            </span>
                                            <span className="hidden sm:inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-none bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 border border-sky-200/50 dark:border-sky-800/30 text-[11px] sm:text-xs shadow-sm">
                                                <span className="truncate max-w-[120px] sm:max-w-none">{formatDate(msg.createdAt)}</span>
                                                <Clock size={11} className="sm:size-[12px]" />
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
};