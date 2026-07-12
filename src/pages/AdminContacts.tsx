import { useState, useEffect, useRef } from 'react';
import { Mail, Trash2, Phone, MessageCircle, Search, Clock, User, BookOpen } from 'lucide-react';
import { api } from '../lib/api';
import { confirm } from '../lib/confirmDialog';

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
    const [search, setSearch] = useState('');
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        const fetch = async () => {
            if (!mountedRef.current) return;
            try {
                setLoading(true);
                const data = await api.get<ContactMsg[]>('/contact');
                if (!mountedRef.current) return;
                setMessages(data);
            } catch (err) {
                console.error(err);
            } finally {
                if (mountedRef.current) setLoading(false);
            }
        };
        fetch();
        return () => { mountedRef.current = false; };
    }, []);

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
        <div className="min-h-full pb-24 overflow-x-hidden relative" dir="rtl">
            <div className="max-w-5xl mx-auto px-4 mb-6">
                <div className="bg-card border border-border/50 shadow-soft rounded-card p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-lg bg-primary-soft flex items-center justify-center shrink-0">
                                <Mail size={26} className="text-primary" />
                            </div>
                            <div>
                                <h1 className="text-card-title font-bold font-heading text-main">رسائل الاتصال</h1>
                                <p className="text-sm text-muted mt-0.5">{messages.length} رسالة</p>
                            </div>
                        </div>
                        <div className="relative w-full md:w-auto md:min-w-[320px]">
                            <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                            <input
                                type="text"
                                placeholder="ابحث بالاسم أو الهاتف أو الموضوع..."
                                aria-label="ابحث في الرسائل"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-card border border-border/60 rounded-xl py-4 ps-12 pe-4 text-sm text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-muted"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 space-y-4">
                {loading ? (
                    <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="bg-card h-32 animate-pulse border border-border/50 shadow-soft rounded-card" />)}</div>
                ) : filtered.length === 0 ? (
                    <div className="bg-card border border-border/50 shadow-soft rounded-card p-16 text-center">
                        <div className="w-16 h-16 rounded-card bg-primary-soft flex items-center justify-center mx-auto mb-5">
                            <Mail size={28} className="text-primary" />
                        </div>
                        <p className="text-sm font-bold text-muted">لا توجد رسائل</p>
                        <p className="text-xs text-dim mt-2">ستظهر هنا رسائل الزوار</p>
                    </div>
                ) : (
                    filtered.map(msg => (
                        <div key={msg.id} className="bg-card border border-border/50 shadow-soft overflow-hidden hover:-translate-y-0.5 transition-all rounded-card rounded-t-[0px]">
                            <div className="h-1 w-full bg-primary"></div>
                            <div className="p-6 relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary-soft flex items-center justify-center">
                                            <User size={18} className="text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-main">{msg.name || 'بدون اسم'}</h3>
                                            <p className="text-xs text-muted mt-0.5">{msg.subject || 'بدون موضوع'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <a href={`tel:${msg.phone}`}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-success bg-success/10 hover:bg-success/20 transition-colors text-xs font-bold"
                                            aria-label={`اتصال بـ ${msg.phone}`}>
                                            <Phone size={14} />
                                            اتصال
                                        </a>
                                        <a href={`https://wa.me/${msg.phone.replace(/\D/g, '')}`}
                                            target="_blank" rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-success bg-success/10 hover:bg-success/20 transition-colors text-xs font-bold"
                                            aria-label="مراسلة عبر واتساب">
                                            <MessageCircle size={14} />
                                            واتساب
                                        </a>
                                        <button type="button" onClick={() => handleDelete(msg.id)}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-error bg-error/10 hover:bg-error/20 transition-colors text-xs font-bold"
                                            aria-label="حذف الرسالة">
                                            <Trash2 size={14} />
                                            حذف
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-background/50 p-5 rounded-xl mb-3">
                                    <p className="text-sm font-medium text-main leading-relaxed whitespace-pre-wrap">{msg.message || 'لا توجد رسالة'}</p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 text-success border border-success/20 text-xs">
                                        {msg.phone}
                                        <Phone size={12} />
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs">
                                        {msg.curriculum || '-'}
                                        <BookOpen size={12} />
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-info/10 text-info border border-info/20 text-xs">
                                        {formatDate(msg.createdAt)}
                                        <Clock size={12} />
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
