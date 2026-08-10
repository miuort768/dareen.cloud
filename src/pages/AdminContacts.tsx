import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, Trash2, Phone, MessageCircle, Search, Clock, User, BookOpen, Inbox, Download, MailOpen, Calendar } from 'lucide-react';
import { api, safeArray } from '../lib/api';
import { confirm } from '../lib/confirmDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsLoading, useAcademyName } from '../context/AppContext';
import { cn } from '../lib/utils';
import { socketService } from '../lib/socket';
import { SOCKET_EVENTS } from '../lib/socket-events';

interface ContactMsg {
    id: string;
    name: string;
    phone: string;
    subject: string;
    curriculum: string;
    message: string;
    createdAt: string;
}

const READ_STORAGE_KEY = 'readContactMessages';

const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 5 + 2, duration: Math.random() * 6 + 4, delay: Math.random() * 3,
}));

function formatDateNumeric(dateStr: string) {
    const d = new Date(dateStr);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function exportToCsv(messages: ContactMsg[]) {
    const headers = ['\u0627\u0644\u0627\u0633\u0645', '\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641', '\u0627\u0644\u0645\u0646\u0647\u062c', '\u0627\u0644\u0645\u0648\u0636\u0648\u0639', '\u0627\u0644\u0631\u0633\u0627\u0644\u0629', '\u0627\u0644\u062a\u0627\u0631\u064a\u062e'];
    const rows = messages.map(m => [
        m.name || '\u0628\u062f\u0648\u0646 \u0627\u0633\u0645',
        m.phone || '',
        m.curriculum || '-',
        m.subject || '\u0628\u062f\u0648\u0646 \u0645\u0648\u0636\u0648\u0639',
        (m.message || '').replace(/\n/g, ' '),
        formatDateNumeric(m.createdAt),
    ]);
    const bom = '\uFEFF';
    const csv = bom + [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contact-messages.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export const AdminContacts = () => {
    const academyName = useAcademyName();
    useEffect(() => { document.title = `رسائل التواصل | ${academyName}`; }, [academyName]);
    const queryClient = useQueryClient();
    const authLoading = useIsLoading();

    const { data: messages = [], isLoading: loading, error: queryError } = useQuery<ContactMsg[], Error>({
        queryKey: ['contacts'],
        queryFn: () => api.get('/contact'),
        select: (data) => safeArray<ContactMsg>(data),
        enabled: !authLoading,
        retry: 1,
        refetchInterval: 30000,
    });
    const error = queryError?.message || null;

    const [search, setSearch] = useState('');
    const [fabOpen, setFabOpen] = useState(false);
    const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');
    const [readIds, setReadIds] = useState<string[]>(() => {
        try { return JSON.parse(localStorage.getItem(READ_STORAGE_KEY) || '[]'); } catch { return []; }
    });

    useEffect(() => {
        try { localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(readIds)); } catch { /* noop */ }
    }, [readIds]);

    const markAsRead = useCallback((id: string) => {
        if (readIds.includes(id)) return;
        setReadIds(prev => [...prev, id]);
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
    }, [readIds, queryClient]);

    // Real-time: listen for new contact messages via socket
    useEffect(() => {
        const socket = socketService.connect();
        if (!socket) return;
        const handleNewMessage = () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
        };
        socket.on(SOCKET_EVENTS.CONTACT_MESSAGE_RECEIVED, handleNewMessage);
        return () => { socket.off(SOCKET_EVENTS.CONTACT_MESSAGE_RECEIVED, handleNewMessage); };
    }, [queryClient]);

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

    const handleDeleteAll = async () => {
        const confirmed = await confirm('هل أنت متأكد من حذف جميع الرسائل؟ لا يمكن التراجع عن هذا الإجراء.', {
            title: 'حذف جميع الرسائل',
            confirmText: 'حذف الكل',
            cancelText: 'تراجع',
            isDestructive: true,
            icon: <Trash2 size={28} />
        });
        if (!confirmed) return;
        try {
            for (const m of messages) {
                await api.delete(`/contact/${m.id}`);
            }
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
        } catch (err) {
            console.error(err);
        }
    };

    const filtered = useMemo(() => {
        return messages.filter(m => {
            const q = search.trim().toLowerCase();
            const matchesSearch = !q || (
                (m.name || '').toLowerCase().includes(q) ||
                m.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
                (m.subject || '').toLowerCase().includes(q) ||
                (m.message || '').toLowerCase().includes(q) ||
                (m.curriculum || '').toLowerCase().includes(q)
            );
            const isMsgRead = readIds.includes(m.id);
            const matchesRead = filterRead === 'all' ||
                (filterRead === 'read' && isMsgRead) ||
                (filterRead === 'unread' && !isMsgRead);
            return matchesSearch && matchesRead;
        });
    }, [messages, search, filterRead, readIds]);

    const unreadCount = useMemo(() => messages.filter(m => !readIds.includes(m.id)).length, [messages, readIds]);

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
        { icon: Trash2, label: 'حذف الكل', onClick: handleDeleteAll },
        { icon: Download, label: 'تصدير Excel', onClick: () => exportToCsv(filtered) },
    ], [handleDeleteAll, filtered]);

    const readFilterPills = [
        { key: 'all' as const, label: 'الكل', count: messages.length },
        { key: 'unread' as const, label: 'غير مقروءة', count: unreadCount },
        { key: 'read' as const, label: 'مقروءة', count: messages.length - unreadCount },
    ];

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative" dir="rtl">
            <div className="max-w-page mx-auto px-2.5 sm:px-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover dark:from-card dark:via-hover dark:to-card p-6 md:p-8 mb-4">
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
                                <p className="text-2xl font-bold text-white">{unreadCount}</p>
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
                                    whileHover={{ scale: 1.02, y: -2 }} className={cn("relative overflow-hidden rounded-xl bg-gradient-to-br border border-border/50 p-4 dark:bg-surface", kpi.gradient)}>
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
                    <div className="relative mb-3" data-search>
                        <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={13} />
                        <input
                            type="text"
                            placeholder="بحث بالاسم أو الهاتف أو الموضوع..."
                            aria-label="ابحث في الرسائل"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-card dark:bg-surface border border-border rounded-xl py-3 ps-9 pe-3 text-xs font-bold text-main dark:text-main placeholder:text-muted dark:placeholder:text-white/40 focus:outline-none focus:border-primary transition-all"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {readFilterPills.map(pill => (
                            <button key={pill.key} type="button" onClick={() => setFilterRead(pill.key)}
                                className={cn(
                                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-200 border active:scale-[0.97]",
                                    filterRead === pill.key
                                        ? "bg-primary/10 border-primary/30 text-primary dark:bg-primary/20 dark:border-primary/40"
                                        : "bg-card border-border text-muted hover:bg-hover dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-main/50"
                                )}>
                                {pill.label}
                                <span className={cn(
                                    "inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[9px] px-1",
                                    filterRead === pill.key ? "bg-primary/20 text-primary" : "bg-border/50 text-muted"
                                )}>
                                    {pill.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <div className="space-y-3">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={`skel-${i}`} className="bg-card dark:bg-surface h-28 animate-pulse border border-border rounded-2xl" />
                                ))}
                            </div>
                        ) : error ? (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="bg-card dark:bg-surface border border-error/30 rounded-2xl p-6 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-error-soft flex items-center justify-center mx-auto mb-3">
                                    <Trash2 size={20} className="text-error" />
                                </div>
                                <p className="text-xs font-bold text-error">{error}</p>
                                <button type="button" onClick={() => window.location.reload()}
                                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-on-primary text-[10px] font-semibold hover:bg-primary-hover transition-all duration-200 min-h-[44px] active:scale-[0.97]">
                                    إعادة تحميل
                                </button>
                            </motion.div>
                        ) : filtered.length === 0 ? (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="bg-card dark:bg-surface border border-dashed border-border rounded-2xl p-8 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-primary-soft flex items-center justify-center mx-auto mb-3">
                                    <Inbox size={22} className="text-primary" />
                                </div>
                                <p className="text-base font-bold text-main dark:text-main">
                                    {messages.length === 0 ? 'لا توجد رسائل' : 'لا توجد نتائج'}
                                </p>
                                <p className="text-xs text-muted mt-1.5">
                                    {messages.length === 0 ? 'سيتم عرض رسائل الزوار هنا' : 'جرّب تغيير كلمة البحث أو الفلتر'}
                                </p>
                            </motion.div>
                        ) : (
                            <AnimatePresence>
                                {filtered.map((msg, index) => {
                                    const isMsgRead = readIds.includes(msg.id);
                                    return (
                                        <motion.div key={msg.id} layout
                                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -12, transition: { duration: 0.15 } }}
                                            transition={{ duration: 0.2, delay: index * 0.03 }}
                                            className={cn(
                                                "group bg-card dark:bg-surface border border-border/30 hover:border-primary/20 transition-all duration-200 overflow-hidden rounded-2xl shadow-sm hover:shadow-md",
                                                !isMsgRead && "border-primary/15"
                                            )}>
                                            <div className={cn("h-0.5 w-full", isMsgRead ? "bg-success/30" : "bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20")} />
                                            <div className="p-4 md:p-5 relative z-10">
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", isMsgRead ? "bg-success/10" : "bg-primary-soft")}>
                                                            <User size={15} className={isMsgRead ? "text-success" : "text-primary"} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="text-sm font-bold text-main truncate">{msg.name || 'بدون اسم'}</h3>
                                                                {!isMsgRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                                                                {isMsgRead && <span className="text-[9px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded-lg">مقروءة</span>}
                                                            </div>
                                                            <p className="text-[11px] text-muted truncate">{msg.subject || 'بدون موضوع'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                                                        <a href={`tel:${msg.phone.replace(/\s/g, '')}`}
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
                                                        <button type="button" onClick={() => markAsRead(msg.id)}
                                                            className={cn(
                                                                "inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg transition-all duration-200 text-[10px] font-semibold min-h-[44px] active:scale-95",
                                                                isMsgRead
                                                                    ? "text-success bg-success/10 hover:bg-success-light"
                                                                    : "text-muted bg-surface hover:bg-hover dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
                                                            )}
                                                            aria-label={isMsgRead ? "مقروءة" : "تحديد كمقروءة"}>
                                                            <MailOpen size={13} />
                                                        </button>
                                                        <button type="button" onClick={() => handleDelete(msg.id)}
                                                            className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg text-error bg-error-soft hover:bg-error-light transition-all duration-200 text-[10px] font-semibold min-h-[44px] active:scale-95"
                                                            aria-label="حذف الرسالة">
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="bg-background dark:bg-white/[0.03] p-3.5 rounded-xl mb-3 border border-border/20">
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
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-surface dark:bg-white/[0.04] text-muted text-[10px] font-bold">
                                                        <span>{formatDateNumeric(msg.createdAt)}</span>
                                                        <Clock size={10} />
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
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
                            <span className="bg-card dark:bg-surface border border-border dark:border-white/[0.08] text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap text-main dark:text-main">{action.label}</span>
                            <button onClick={() => { action.onClick(); setFabOpen(false); }}
                                className="w-10 h-10 rounded-lg bg-primary text-on-primary shadow-lg hover:shadow-xl hover:bg-primary-hover transition-all duration-200 flex items-center justify-center active:scale-95">
                                <action.icon size={18} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <motion.button onClick={() => setFabOpen(!fabOpen)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className={cn("w-12 h-12 rounded-xl shadow-xl text-on-primary flex items-center justify-center transition-all duration-200", fabOpen ? "bg-error rotate-45" : "bg-primary")}>
                    <Mail size={22} />
                </motion.button>
            </div>
        </div>
    );
};
