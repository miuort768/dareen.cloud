import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, Trash2, Phone, MessageCircle, Search, Clock, User, BookOpen, Inbox, Download, MailOpen, Calendar, X } from 'lucide-react';
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

function formatDateNumeric(dateStr: string) {
    const d = new Date(dateStr);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function exportToCsv(messages: ContactMsg[]) {
    const headers = ['الاسم', 'رقم الهاتف', 'المادة', 'الموضوع', 'الرسالة', 'التاريخ'];
    const rows = messages.map(m => [
        m.name || 'بدون اسم',
        m.phone || '',
        m.curriculum || '-',
        m.subject || 'بدون موضوع',
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
        const confirmed = await confirm('هل أنت متأكد من حذف هذه الرسالة؟ لن يمكن التراجع عن هذا الإجراء.', {
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
        const confirmed = await confirm('هل أنت متأكد من حذف جميع الرسائل؟ لن يمكن التراجع عن هذا الإجراء.', {
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
        { label: 'إجمالي الرسائل', value: messages.length, icon: Mail, color: 'text-primary', bg: 'bg-primary/10' },
        { label: 'رسائل اليوم', value: todayCount, icon: Calendar, color: 'text-info', bg: 'bg-info/10' },
        { label: 'بها هواتف', value: withPhoneCount, icon: Phone, color: 'text-success', bg: 'bg-success/10' },
        { label: 'المواضيع', value: uniqueSubjects, icon: BookOpen, color: 'text-warning', bg: 'bg-warning/10' },
    ], [messages, todayCount, withPhoneCount, uniqueSubjects]);

    const readFilterPills = [
        { key: 'all' as const, label: 'الكل', count: messages.length },
        { key: 'unread' as const, label: 'غير مقروءة', count: unreadCount },
        { key: 'read' as const, label: 'مقروءة', count: messages.length - unreadCount },
    ];

    return (
        <div className="min-h-full pb-8" dir="rtl">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">

                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pt-6 pb-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Mail size={20} className="text-primary" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-main dark:text-main">رسائل التواصل</h1>
                                <p className="text-xs text-muted dark:text-muted mt-0.5">إدارة ومتابعة رسائل الزوار والعملاء</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => exportToCsv(filtered)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-card dark:bg-card border border-border dark:border-border rounded-xl text-xs font-bold text-muted dark:text-muted hover:bg-hover dark:hover:bg-hover hover:border-primary/20 dark:hover:border-border transition-all duration-200 active:scale-[0.98]">
                                <Download size={14} />
                                <span className="hidden sm:inline">تصدير</span>
                            </button>
                            <button onClick={handleDeleteAll}
                                className="flex items-center gap-2 px-4 py-2.5 bg-card dark:bg-card border border-border dark:border-border rounded-xl text-xs font-bold text-error hover:bg-error/5 hover:border-error/30 transition-all duration-200 active:scale-[0.98]">
                                <Trash2 size={14} />
                                <span className="hidden sm:inline">حذف الكل</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                        {kpiCards.map((kpi, i) => {
                            const Icon = kpi.icon;
                            return (
                                <motion.div key={kpi.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.04 }}
                                    whileHover={{ y: -2 }} className="bg-card dark:bg-card border border-border dark:border-border rounded-xl p-4 hover:shadow-sm transition-all duration-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", kpi.bg)}>
                                            <Icon size={16} className={kpi.color} />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-main dark:text-main">{kpi.value}</p>
                                    <p className="text-[11px] text-muted dark:text-muted mt-1">{kpi.label}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4">
                    <div className="relative mb-3">
                        <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted dark:text-muted" size={15} />
                        <input type="text" aria-label="بحث في الرسائل" placeholder="بحث بالاسم أو الهاتف أو الموضوع..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full bg-card dark:bg-card border border-border dark:border-border rounded-xl py-3 ps-10 pe-4 text-xs font-bold text-main dark:text-main placeholder:text-muted/60 dark:placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200" />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted dark:text-muted hover:text-main dark:hover:text-main transition-colors" aria-label="مسح البحث">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {readFilterPills.map(pill => (
                            <button key={pill.key} type="button" onClick={() => setFilterRead(pill.key)}
                                className={cn(
                                    "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-bold transition-all duration-200 active:scale-[0.97]",
                                    filterRead === pill.key
                                        ? "bg-primary text-on-primary shadow-sm"
                                        : "bg-card dark:bg-card border border-border dark:border-border text-muted dark:text-muted hover:border-primary/30 dark:hover:border-border hover:text-main dark:hover:text-main"
                                )}>
                                {pill.label}
                                <span className={cn(
                                    "inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[9px] px-1",
                                    filterRead === pill.key ? "bg-on-primary/20 text-on-primary" : "bg-border/50 text-muted"
                                )}>
                                    {pill.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <div className="space-y-3">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={`skel-${i}`} className="bg-card dark:bg-card border border-border dark:border-border rounded-xl p-5 animate-pulse">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-9 h-9 rounded-xl bg-surface dark:bg-hover" />
                                            <div className="space-y-2 flex-1">
                                                <div className="h-3 bg-surface dark:bg-hover rounded-lg w-1/3" />
                                                <div className="h-2.5 bg-surface dark:bg-hover rounded-lg w-1/4" />
                                            </div>
                                        </div>
                                        <div className="h-16 bg-surface dark:bg-hover rounded-lg mb-3" />
                                        <div className="flex gap-2">
                                            <div className="h-6 w-20 bg-surface dark:bg-hover rounded-lg" />
                                            <div className="h-6 w-24 bg-surface dark:bg-hover rounded-lg" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                                className="bg-card dark:bg-card border border-error/30 rounded-xl p-8 text-center">
                                <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center mx-auto mb-3">
                                    <Trash2 size={20} className="text-error" />
                                </div>
                                <p className="text-xs font-bold text-error">{error}</p>
                                <button type="button" onClick={() => window.location.reload()}
                                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-[11px] font-bold hover:bg-primary-hover transition-all duration-200 active:scale-[0.97]">
                                    إعادة تحميل
                                </button>
                            </motion.div>
                        ) : filtered.length === 0 ? (
                            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                                className="bg-card dark:bg-card border border-dashed border-border dark:border-border rounded-xl p-10 text-center">
                                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <Inbox size={24} className="text-primary" />
                                </div>
                                <p className="text-sm font-bold text-main dark:text-main mb-1">
                                    {messages.length === 0 ? 'لا توجد رسائل' : 'لا توجد نتائج'}
                                </p>
                                <p className="text-xs text-muted dark:text-muted">
                                    {messages.length === 0 ? 'ستظهر رسائل الزوار هنا' : 'جرّب تغيير كلمة البحث أو الفلتر'}
                                </p>
                            </motion.div>
                        ) : (
                            <AnimatePresence>
                                {filtered.map((msg, index) => {
                                    const isMsgRead = readIds.includes(msg.id);
                                    return (
                                        <motion.div key={msg.id} layout
                                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
                                            transition={{ duration: 0.2, delay: index * 0.02 }}
                                            className={cn(
                                                "bg-card dark:bg-card border border-border dark:border-border rounded-xl overflow-hidden hover:shadow-sm transition-all duration-200",
                                                !isMsgRead && "border-primary/20 dark:border-primary/20"
                                            )}>
                                            <div className="p-4 sm:p-5">
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                                                            isMsgRead ? 'bg-success/10' : 'bg-primary/10')}>
                                                            <User size={15} className={isMsgRead ? "text-success" : "text-primary"} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="text-sm font-bold text-main dark:text-main truncate">{msg.name || 'بدون اسم'}</h3>
                                                                {!isMsgRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                                                                {isMsgRead && <span className="text-[9px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded-lg">مقروءة</span>}
                                                            </div>
                                                            <p className="text-[11px] text-muted dark:text-muted truncate">{msg.subject || 'بدون موضوع'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <a href={`tel:${msg.phone.replace(/\s/g, '')}`}
                                                            className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center hover:bg-success/20 transition-all duration-200 active:scale-95"
                                                            aria-label={`اتصال بـ ${msg.phone}`}>
                                                            <Phone size={14} />
                                                        </a>
                                                        <a href={`https://wa.me/${msg.phone.replace(/\D/g, '')}`}
                                                            target="_blank" rel="noopener noreferrer"
                                                            className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center hover:bg-success/20 transition-all duration-200 active:scale-95"
                                                            aria-label="مراسلة عبر واتساب">
                                                            <MessageCircle size={14} />
                                                        </a>
                                                        <button type="button" onClick={() => markAsRead(msg.id)}
                                                            className={cn(
                                                                "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95",
                                                                isMsgRead
                                                                    ? "bg-success/10 text-success hover:bg-success/20"
                                                                    : "bg-surface dark:bg-hover text-muted dark:text-muted hover:bg-hover dark:hover:bg-hover"
                                                            )}
                                                            aria-label={isMsgRead ? "مقروءة" : "تحديد كمقروءة"}>
                                                            <MailOpen size={14} />
                                                        </button>
                                                        <button type="button" onClick={() => handleDelete(msg.id)}
                                                            className="w-8 h-8 rounded-lg bg-error/10 text-error flex items-center justify-center hover:bg-error/20 transition-all duration-200 active:scale-95"
                                                            aria-label="حذف الرسالة">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="bg-background dark:bg-hover p-3.5 rounded-xl mb-3 border border-border/30 dark:border-border">
                                                    <p className="text-xs font-bold text-main dark:text-main leading-relaxed whitespace-pre-wrap">{msg.message || 'لا توجد رسالة'}</p>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-success/10 text-success text-[10px] font-bold">
                                                        <span className="truncate max-w-[120px]">{msg.phone}</span>
                                                        <Phone size={10} />
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold">
                                                        <span className="truncate max-w-[100px]">{msg.curriculum || '-'}</span>
                                                        <BookOpen size={10} />
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-surface dark:bg-hover text-muted dark:text-muted text-[10px] font-bold border border-border dark:border-border">
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
        </div>
    );
};
