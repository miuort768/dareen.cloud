import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Trash2, Phone, Mail, Calendar, Search, CheckCircle2 } from 'lucide-react';
import { api } from '../../../lib/api';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';

interface ContactMessage {
    id: string;
    name: string;
    phone: string;
    subject: string;
    message: string;
    created_at: string;
}

export const ContactMessages = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        const fetchMessages = async () => {
            if (!mountedRef.current) return;
            try {
                setLoading(true);
                const data = await api.get<ContactMessage[]>('/contact');
                if (!mountedRef.current) return;
                setMessages(data);
            } catch (err) {
                console.error(err);
            } finally {
                if (mountedRef.current) setLoading(false);
            }
        };
        fetchMessages();
        return () => { mountedRef.current = false; };
    }, []);

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/contact/${id}`);
            setMessages(messages.filter(m => m.id !== id));
        } catch (err) {
            console.error(err);
        }
        setDeleteTarget(null);
    };

    const filtered = messages.filter(m => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
            (m.name || '').toLowerCase().includes(q) ||
            m.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
            (m.subject || '').toLowerCase().includes(q) ||
            (m.message || '').toLowerCase().includes(q)
        );
    });

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="بحث في الرسائل..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pr-10 pl-4 text-xs font-bold outline-none focus:border-[#6C4BFF] focus:ring-2 focus:ring-purple-200/50 dark:focus:ring-purple-700/50 transition-all"
                    />
                </div>
                <span className="text-[11px] font-bold text-slate-400">{messages.length} رسالة</span>
            </div>

            {loading ? (
                <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="bg-white h-28 animate-pulse border border-slate-100/50 rounded-2xl" />)}</div>
            ) : filtered.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-16 text-center">
                    <div className="w-14 h-14 flex items-center justify-center mx-auto mb-4 bg-[#8B5CF612] rounded-xl">
                        <MessageSquare size={28} className="text-[#6C4BFF]" />
                    </div>
                    <p className="text-sm font-bold text-slate-400">{search ? 'لا توجد نتائج' : 'لا توجد رسائل'}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(msg => (
                        <div key={msg.id} className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm relative overflow-hidden group transition-all duration-300 rounded-2xl">
                            <div className="h-1.5 w-full bg-gradient-to-r from-[#6C4BFF] to-[#8B5CF6]"></div>
                            <div className="p-6 relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={14} className="text-emerald-500" />
                                        <span className="font-medium text-[8px] uppercase tracking-[0.2em] text-slate-400">رسالة واردة</span>
                                    </div>
                                    <button onClick={() => setDeleteTarget(msg.id)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all rounded-xl" aria-label="حذف">
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 mb-4 p-4 bg-gradient-to-l from-[#6C4BFF] to-[#8B5CF6] rounded-xl">
                                    <div className="w-12 h-14 bg-white/20 border-2 border-white/30 flex items-center justify-center shrink-0 rounded-xl">
                                        <span className="text-base font-bold text-white">{(msg.name || '?')[0]}</span>
                                    </div>
                                    <div className="text-right">
                                        <h3 className="text-sm font-bold text-white">{msg.name || 'بدون اسم'}</h3>
                                        <p className="text-[10px] font-bold text-white/80">{msg.subject || 'بدون موضوع'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[11px] border-t border-slate-50 dark:border-slate-800 pt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 flex items-center justify-center shrink-0 bg-[#8B5CF612] rounded-lg">
                                            <Phone size={10} className="text-[#6C4BFF]" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">رقم الهاتف</p>
                                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate block" dir="ltr">{msg.phone}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 flex items-center justify-center shrink-0 bg-[#8B5CF612] rounded-lg">
                                            <Calendar size={10} className="text-[#6C4BFF]" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">التاريخ</p>
                                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate block">{new Date(msg.created_at).toLocaleDateString('ar-EG')}</span>
                                        </div>
                                    </div>
                                    {msg.message && (
                                        <div className="col-span-2 flex items-start gap-2 pt-3 border-t border-slate-50 dark:border-slate-800 mt-1">
                                            <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 bg-[#8B5CF612] rounded-lg">
                                                <Mail size={10} className="text-[#6C4BFF]" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">الرسالة</p>
                                                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed">{msg.message}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmModal
                isOpen={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
                title="حذف الرسالة"
                message="هل أنت متأكد من حذف هذه الرسالة؟ لا يمكن التراجع عن هذا الإجراء."
                confirmText="حذف"
                cancelText="تراجع"
                isDestructive
            />
        </div>
    );
};
