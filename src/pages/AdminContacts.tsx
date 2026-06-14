import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Trash2, Phone, Mail, Calendar, Search, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';
import { ConfirmModal } from '../shared/components/ConfirmModal';

interface ContactMessage {
    id: string;
    name: string;
    phone: string;
    subject: string;
    message: string;
    created_at: string;
}

export const AdminContacts = () => {
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
        <div className="min-h-full pb-24 overflow-x-hidden relative" dir="rtl">
            <div className="bg-[#1B1464] px-4 md:px-6 py-5 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 flex items-center justify-center bg-white/15">
                            <MessageSquare size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white">رسائل التواصل</h1>
                            <p className="text-[10px] font-bold text-white/70">{messages.length} رسالة</p>
                        </div>
                    </div>
                    <div className="relative w-full md:w-48">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50" size={16} />
                        <input
                            type="text"
                            placeholder="بحث..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white/15 text-white placeholder:text-white/50 py-3 pr-12 pl-4 text-xs font-bold focus:outline-none border border-white/20"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 space-y-4">
                {loading ? (
                    <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="bg-white h-32 animate-pulse border border-slate-100/50" />)}</div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white border border-dashed border-slate-200 p-16 text-center">
                        <div className="w-14 h-14 flex items-center justify-center mx-auto mb-4 bg-indigo-50">
                            <MessageSquare size={28} className="text-indigo-600" />
                        </div>
                        <p className="text-sm font-bold text-slate-400">{search ? 'لا توجد نتائج' : 'لا توجد رسائل'}</p>
                    </div>
                ) : (
                    filtered.map(msg => (
                        <div key={msg.id} className="bg-white border border-slate-100/50 shadow-sm relative overflow-hidden group transition-all duration-300">
                            <div className="h-1.5 w-full bg-gradient-to-r from-[#1B1464] to-[#2D1B8E]"></div>
                            <div className="p-6 relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={14} className="text-emerald-500" />
                                        <span className="font-medium text-[8px] uppercase tracking-[0.2em] text-slate-400">رسالة واردة</span>
                                    </div>
                                    <button onClick={() => setDeleteTarget(msg.id)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all" aria-label="حذف">
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 mb-4 p-4 bg-[#1B1464]">
                                    <div className="w-12 h-14 bg-white/20 border-2 border-white/30 flex items-center justify-center shrink-0">
                                        <span className="text-base font-bold text-white">{(msg.name || '?')[0]}</span>
                                    </div>
                                    <div className="text-right">
                                        <h3 className="text-sm font-bold text-white">{msg.name || 'بدون اسم'}</h3>
                                        <p className="text-[10px] font-bold text-white/80">{msg.subject || 'بدون موضوع'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[11px] border-t border-slate-50 pt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 flex items-center justify-center shrink-0 bg-indigo-50">
                                            <Phone size={10} className="text-indigo-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">رقم الهاتف</p>
                                            <span className="text-[10px] font-bold text-slate-700 truncate block" dir="ltr">{msg.phone}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 flex items-center justify-center shrink-0 bg-indigo-50">
                                            <Calendar size={10} className="text-indigo-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">التاريخ</p>
                                            <span className="text-[10px] font-bold text-slate-700 truncate block">{new Date(msg.created_at).toLocaleDateString('ar-EG')}</span>
                                        </div>
                                    </div>
                                    {msg.message && (
                                        <div className="col-span-2 flex items-start gap-2 pt-3 border-t border-slate-50 mt-1">
                                            <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 bg-indigo-50">
                                                <Mail size={10} className="text-indigo-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">الرسالة</p>
                                                <p className="text-[10px] font-bold text-slate-600 leading-relaxed">{msg.message}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

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
