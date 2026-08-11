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
    useEffect(() => { document.title = `\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u062a\u0648\u0627\u0635\u0644 | ${academyName}`; }, [academyName]);
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
        const confirmed = await confirm('\u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u062d\u0630\u0641 \u0647\u0630\u0647 \u0627\u0644\u0631\u0633\u0627\u0644\u0629\u061f \u0644\u0627 \u064a\u0645\u0646 \u0627\u0644\u062a\u0631\u0627\u062c\u0639 \u0639\u0646 \u0647\u0630\u0627 \u0627\u0644\u0625\u062c\u0631\u0627\u0621.', {
            title: '\u062d\u0630\u0641 \u0627\u0644\u0631\u0633\u0627\u0644\u0629',
            confirmText: '\u062d\u0630\u0641',
            cancelText: '\u062a\u0631\u0627\u062c\u0639',
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
        const confirmed = await confirm('\u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u062d\u0630\u0641 \u062c\u0645\u064a\u0639 \u0627\u0644\u0631\u0633\u0627\u0626\u0644\u061f \u0644\u0627 \u064a\u0645\u0646 \u0627\u0644\u062a\u0631\u0627\u062c\u0639 \u0639\u0646 \u0647\u0630\u0627 \u0627\u0644\u0625\u062c\u0631\u0627\u0621.', {
            title: '\u062d\u0630\u0641 \u062c\u0645\u064a\u0639 \u0627\u0644\u0631\u0633\u0627\u0626\u0644',
            confirmText: '\u062d\u0630\u0641 \u0627\u0644\u0643\u0644',
            cancelText: '\u062a\u0631\u0627\u062c\u0639',
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
        { label: '\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0631\u0633\u0627\u0626\u0644', value: messages.length, icon: Mail, color: 'text-primary', bg: 'bg-primary/10' },
        { label: '\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u064a\u0648\u0645', value: todayCount, icon: Calendar, color: 'text-info', bg: 'bg-info/10' },
        { label: '\u0628\u0647\u0627 \u0647\u0627\u062a\u0641', value: withPhoneCount, icon: Phone, color: 'text-success', bg: 'bg-success/10' },
        { label: '\u0627\u0644\u0645\u0648\u0627\u0636\u064a\u0639', value: uniqueSubjects, icon: BookOpen, color: 'text-warning', bg: 'bg-warning/10' },
    ], [messages, todayCount, withPhoneCount, uniqueSubjects]);

    const readFilterPills = [
        { key: 'all' as const, label: '\u0627\u0644\u0643\u0644', count: messages.length },
        { key: 'unread' as const, label: '\u063a\u064a\u0631 \u0645\u0642\u0631\u0648\u0621\u0629', count: unreadCount },
        { key: 'read' as const, label: '\u0645\u0642\u0631\u0648\u0621\u0629', count: messages.length - unreadCount },
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
                                <h1 className="text-xl font-bold text-main">\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u062a\u0648\u0627\u0635\u0644</h1>
                                <p className="text-xs text-muted mt-0.5">\u0625\u062f\u0627\u0631\u0629 \u0648\u0645\u062a\u0627\u0628\u0639\u0629 \u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u0632\u0648\u0627\u0631 \u0648\u0627\u0644\u0639\u0645\u0644\u0627\u0621</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => exportToCsv(filtered)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-xs font-bold text-muted hover:bg-hover hover:border-primary/20 transition-all duration-200 active:scale-[0.98]">
                                <Download size={14} />
                                <span className="hidden sm:inline">\u062a\u0635\u062f\u064a\u0631</span>
                            </button>
                            <button onClick={handleDeleteAll}
                                className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-xs font-bold text-error hover:bg-error/5 hover:border-error/30 transition-all duration-200 active:scale-[0.98]">
                                <Trash2 size={14} />
                                <span className="hidden sm:inline">\u062d\u0630\u0641 \u0627\u0644\u0643\u0644</span>
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
                                    whileHover={{ y: -2 }} className="bg-card border border-border rounded-xl p-4 hover:shadow-elevation-1 transition-all duration-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", kpi.bg)}>
                                            <Icon size={16} className={kpi.color} />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-main">{kpi.value}</p>
                                    <p className="text-[11px] text-muted mt-1">{kpi.label}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4">
                    <div className="relative mb-3">
                        <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted" size={15} />
                        <input type="text" aria-label="\u0627\u0628\u062d\u062b \u0641\u064a \u0627\u0644\u0631\u0633\u0627\u0626\u0644" placeholder="\u0628\u062d\u062b \u0628\u0627\u0644\u0627\u0633\u0645 \u0623\u0648 \u0627\u0644\u0647\u0627\u062a\u0641 \u0623\u0648 \u0627\u0644\u0645\u0648\u0636\u0648\u0639..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full bg-card border border-border rounded-xl py-3 ps-10 pe-4 text-xs font-bold text-main placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200" />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors" aria-label="\u0645\u0633\u062d \u0627\u0644\u0628\u062d\u062b">
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
                                        : "bg-card border border-border text-muted hover:border-primary/30 hover:text-main"
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
                                    <div key={`skel-${i}`} className="bg-card border border-border rounded-xl p-5 animate-pulse">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-9 h-9 rounded-xl bg-surface" />
                                            <div className="space-y-2 flex-1">
                                                <div className="h-3 bg-surface rounded-lg w-1/3" />
                                                <div className="h-2.5 bg-surface rounded-lg w-1/4" />
                                            </div>
                                        </div>
                                        <div className="h-16 bg-surface rounded-lg mb-3" />
                                        <div className="flex gap-2">
                                            <div className="h-6 w-20 bg-surface rounded-lg" />
                                            <div className="h-6 w-24 bg-surface rounded-lg" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                                className="bg-card border border-error/30 rounded-xl p-8 text-center">
                                <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center mx-auto mb-3">
                                    <Trash2 size={20} className="text-error" />
                                </div>
                                <p className="text-xs font-bold text-error">{error}</p>
                                <button type="button" onClick={() => window.location.reload()}
                                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-[11px] font-bold hover:bg-primary-hover transition-all duration-200 active:scale-[0.97]">
                                    \u0625\u0639\u0627\u062f\u0629 \u062a\u062d\u0645\u064a\u0644
                                </button>
                            </motion.div>
                        ) : filtered.length === 0 ? (
                            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                                className="bg-card border border-dashed border-border rounded-xl p-10 text-center">
                                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <Inbox size={24} className="text-primary" />
                                </div>
                                <p className="text-sm font-bold text-main mb-1">
                                    {messages.length === 0 ? '\u0644\u0627 \u062a\u0648\u062c\u062f \u0631\u0633\u0627\u0626\u0644' : '\u0644\u0627 \u062a\u0648\u062c\u062f \u0646\u062a\u0627\u0626\u062c'}
                                </p>
                                <p className="text-xs text-muted">
                                    {messages.length === 0 ? '\u0633\u064a\u062a\u0645 \u0639\u0631\u0636 \u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u0632\u0648\u0627\u0631 \u0647\u0646\u0627' : '\u062c\u0631\u0651\u0628 \u062a\u063a\u064a\u064a\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0628\u062d\u062b \u0623\u0648 \u0627\u0644\u0641\u0644\u062a\u0631'}
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
                                                "bg-card border border-border rounded-xl overflow-hidden hover:shadow-elevation-1 transition-all duration-200",
                                                !isMsgRead && "border-primary/20"
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
                                                                <h3 className="text-sm font-bold text-main truncate">{msg.name || '\u0628\u062f\u0648\u0646 \u0627\u0633\u0645'}</h3>
                                                                {!isMsgRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                                                                {isMsgRead && <span className="text-[9px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded-lg">\u0645\u0642\u0631\u0648\u0621\u0629</span>}
                                                            </div>
                                                            <p className="text-[11px] text-muted truncate">{msg.subject || '\u0628\u062f\u0648\u0646 \u0645\u0648\u0636\u0648\u0639'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <a href={`tel:${msg.phone.replace(/\s/g, '')}`}
                                                            className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center hover:bg-success/20 transition-all duration-200 active:scale-95"
                                                            aria-label={`\u0627\u062a\u0635\u0627\u0644 \u0628\u0640 ${msg.phone}`}>
                                                            <Phone size={14} />
                                                        </a>
                                                        <a href={`https://wa.me/${msg.phone.replace(/\D/g, '')}`}
                                                            target="_blank" rel="noopener noreferrer"
                                                            className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center hover:bg-success/20 transition-all duration-200 active:scale-95"
                                                            aria-label="\u0645\u0631\u0627\u0633\u0644\u0629 \u0639\u0628\u0631 \u0648\u0627\u062a\u0633\u0627\u0628">
                                                            <MessageCircle size={14} />
                                                        </a>
                                                        <button type="button" onClick={() => markAsRead(msg.id)}
                                                            className={cn(
                                                                "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95",
                                                                isMsgRead
                                                                    ? "bg-success/10 text-success hover:bg-success/20"
                                                                    : "bg-surface text-muted hover:bg-hover"
                                                            )}
                                                            aria-label={isMsgRead ? "\u0645\u0642\u0631\u0648\u0621\u0629" : "\u062a\u062d\u062f\u064a\u062f \u0643\u0645\u0642\u0631\u0648\u0621\u0629"}>
                                                            <MailOpen size={14} />
                                                        </button>
                                                        <button type="button" onClick={() => handleDelete(msg.id)}
                                                            className="w-8 h-8 rounded-lg bg-error/10 text-error flex items-center justify-center hover:bg-error/20 transition-all duration-200 active:scale-95"
                                                            aria-label="\u062d\u0630\u0641 \u0627\u0644\u0631\u0633\u0627\u0644\u0629">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="bg-background p-3.5 rounded-xl mb-3 border border-border/30">
                                                    <p className="text-xs font-bold text-main leading-relaxed whitespace-pre-wrap">{msg.message || '\u0644\u0627 \u062a\u0648\u062c\u062f \u0631\u0633\u0627\u0644\u0629'}</p>
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
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-surface text-muted text-[10px] font-bold border border-border">
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
