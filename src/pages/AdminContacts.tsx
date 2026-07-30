import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, Trash2, Phone, MessageCircle, Search, Clock, User, BookOpen, Inbox, BarChart3, Calendar, Filter } from 'lucide-react';
import { api, safeArray } from '../lib/api';
import { confirm } from '../lib/confirmDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsLoading } from '../context/AppContext';
import { cn } from '../lib/utils';

interface ContactMsg {
    id: string;
    name: string;
    phone: string;
    subject: string;
    curriculum: string;
    message: string;
    createdAt: string;
}

const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 5 + 2, duration: Math.random() * 6 + 4, delay: Math.random() * 3,
}));

export const AdminContacts = () => {
    useEffect(() => { document.title = 'رسائل التواصل | دارين السابعة للتعليم والتدريب'; }, []);
    const queryClient = useQueryClient();
    const authLoading = useIsLoading();
    const { data: messages = [], isLoading: loading, error: queryError } = useQuery<ContactMsg[], Error>({
        queryKey: ['contacts'],
        queryFn: () => api.get('/contact'),
        select: (data) => safeArray<ContactMsg>(data),
        enabled: !authLoading,
    });
    const error = queryError?.message || null;
    const [search, setSearch] = useState('');
    const [fabOpen, setFabOpen] = useState(false);

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
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
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

    const todayCount = useMemo(() => messages.filter(m => {
        const d = new Date(m.createdAt);
        const now = new Date();
        return d.toDateString() === now.toDateString();
    }).length, [messages]);

    const withPhoneCount = useMemo(() => messages.filter(m => m.phone?.replace(/\D/g, '').length >= 7).length, [messages]);

    const uniqueSubjects = useMemo(() => new Set(messages.map(m => m.subject).filter(Boolean)).size, [messages]);

    const kpiCards = useMemo(() => [
        { label: 'إجمالي الرسائل', value: messages.length, icon: Mail, gradient: 'from-primary/20 to-primary/5', iconBg: 'bg-primary/10 text-primary', accent: 'bg-primary' },
        { label: 'رسائل اليوم', value: todayCount, icon: Calendar, gradient: 'from-info/20 to-info/5', iconBg: 'bg-info/10 text-info', accent: 'bg-info' },
        { label: 'بها هاتف', value: withPhoneCount, icon: Phone, gradient: 'from-success/20 to-success/5', iconBg: 'bg-success/10 text-success', accent: 'bg-success' },
        { label: 'المواضيع', value: uniqueSubjects, icon: BookOpen, gradient: 'from-warning/20 to-warning/5', iconBg: 'bg-warning/10 text-warning', accent: 'bg-warning' },
    ], [messages, todayCount, withPhoneCount, uniqueSubjects]);

    const fabActions = useMemo(() => [
        { icon: Filter, label: 'بحث', onClick: () => document.querySelector('[data-search]')?.scrollIntoView({ behavior: 'smooth' }) },
        { icon: BarChart3, label: 'إحصائيات', onClick: () => document.querySelector('[data-kpi]')?.scrollIntoView({ behavior: 'smooth' }) },
    ], []);

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative" dir="rtl">
            <div className="max-w-page mx-auto px-2">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-6 md:p-8 mb-4">
                    {particles.map(p => (
                        <motion.div key={p.id} className="absolute rounded-full bg-white/10 pointer-events-none"
                            style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
                            animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }} />
                    ))}
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-xl bg-white/15 backdrop-blur-sm"><Mail className="text-white" size={20} /></div>
                                <span className="text-white/70 text-xs font-medium">الإدارة</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">رسائل التواصل</h1>
                            <p className="text-white/70 text-sm">إدارة ومتابعة رسائل الزوار والعملاء</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                            <div className="text-center">
                                <p className="text-white/60 text-xs mb-1">الإجمالي</p>
                                <p className="text-2xl font-bold text-white">{messages.length}</p>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-center">
                                <p className="text-white/60 text-xs mb-1">غير مقروء</p>
                                <p className="text-2xl font-bold text-white">{todayCount}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} data-kpi>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {kpiCards.map((kpi, i) => {
                            const Icon = kpi.icon;
                            return (
                                <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.06 }}
                                    whileHover={{ scale: 1.02, y: -2 }} className={cn("relative overflow-hidden rounded-xl bg-gradient-to-br border border-border/50 p-4", kpi.gradient)}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={cn("p-2 rounded-lg", kpi.iconBg)}><Icon size={16} /></div>
                                        <div className={cn("h-1 w-12 rounded-full", kpi.accent)} />
                                    </div>
                                    <p className="text-xs text-muted mb-1">{kpi.label}</p>
                                    <p className="text-2xl font-bold text-main">{kpi.value}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="relative mb-4" data-search>
                        <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={13} />
                        <input
                            type="text"
                            placeholder="بحث بالاسم أو الهاتف أو الموضوع..."
                            aria-label="ابحث في الرسائل"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-card border border-border rounded-xl py-3 ps-9 pe-3 text-xs font-bold text-main placeholder:text-muted focus:outline-none focus:border-primary transition-all"
                        />
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <div className="space-y-3">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={`skel-${i}`} className="bg-card h-28 animate-pulse border border-border rounded-2xl" />
                                ))}
                            </div>
                        ) : error ? (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="bg-card border border-error/30 rounded-2xl p-6 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-error-soft flex items-center justify-center mx-auto mb-3">
                                    <Trash2 size={20} className="text-error" />
                                </div>
                                <p className="text-xs font-bold text-error">{error}</p>
                                <button type="button" onClick={() => window.location.reload()}
                                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-on-primary text-[10px] font-bold hover:bg-primary-hover transition-colors min-h-[44px]">
                                    إعادة تحميل
                                </button>
                            </motion.div>
                        ) : filtered.length === 0 ? (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="bg-card border border-dashed border-border rounded-2xl p-8 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-primary-soft flex items-center justify-center mx-auto mb-3">
                                    <Inbox size={22} className="text-primary" />
                                </div>
                                <p className="text-base font-bold text-main">لا توجد رسائل</p>
                                <p className="text-xs text-muted mt-1.5">سيتم عرض رسائل الزوار هنا</p>
                            </motion.div>
                        ) : (
                            <AnimatePresence>
                                {filtered.map((msg, index) => (
                                    <motion.div key={msg.id} layout
                                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -12, transition: { duration: 0.15 } }}
                                        transition={{ duration: 0.2, delay: index * 0.03 }}
                                        className="group bg-card border border-border/30 hover:border-primary/20 transition-all duration-200 overflow-hidden rounded-2xl shadow-sm hover:shadow-md">
                                        <div className="h-0.5 w-full bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
                                        <div className="p-4 md:p-5 relative z-10">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
                                                        <User size={15} className="text-primary" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="text-sm font-bold text-main truncate">{msg.name || 'بدون اسم'}</h3>
                                                        <p className="text-[11px] text-muted truncate">{msg.subject || 'بدون موضوع'}</p>
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

                                            <div className="bg-background p-3.5 rounded-xl mb-3 border border-border/20">
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
                                                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-background text-muted text-[10px] font-bold">
                                                    <span>{formatDate(msg.createdAt)}</span>
                                                    <Clock size={10} />
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </motion.div>
            </div>

            <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
                <AnimatePresence>
                    {fabOpen && fabActions.map((action, i) => (
                        <motion.div key={action.label} initial={{ opacity: 0, scale: 0.3, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.3, y: 20 }} transition={{ delay: 0.05 * (fabActions.length - 1 - i) }} className="flex items-center gap-2">
                            <span className="bg-card border border-border text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap">{action.label}</span>
                            <button onClick={() => { action.onClick(); setFabOpen(false); }}
                                className="w-10 h-10 rounded-full bg-primary text-on-primary shadow-lg hover:shadow-xl hover:bg-primary-hover transition-all flex items-center justify-center">
                                <action.icon size={18} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <motion.button onClick={() => setFabOpen(!fabOpen)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className={cn("w-12 h-12 rounded-full shadow-xl text-on-primary flex items-center justify-center transition-all", fabOpen ? "bg-error rotate-45" : "bg-primary")}>
                    <Mail size={22} />
                </motion.button>
            </div>
        </div>
    );
};
