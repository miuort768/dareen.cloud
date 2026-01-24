import { useState, useEffect } from 'react';
import {
    Megaphone,
    Plus,
    Trash2,
    Edit3,
    Bell,
    AlertTriangle,
    Info,
    Calendar,
    X,
    CheckCircle2
} from 'lucide-react';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

type AnnouncementType = 'general' | 'urgent' | 'holiday' | 'event';

interface Announcement {
    id: string;
    title: string;
    content: string;
    type: AnnouncementType;
    date: string;
    isActive: boolean;
}

export const Announcements = () => {
    const { showNotification } = useApp();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

    // Form State
    const [formData, setFormData] = useState<{
        title: string;
        content: string;
        type: AnnouncementType;
        isActive: boolean;
    }>({
        title: '',
        content: '',
        type: 'general',
        isActive: true
    });

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            setIsLoading(true);
            // Using a generic settings key or specific endpoint if exists
            const data = await api.get<Announcement[]>('/announcements');
            setAnnouncements(data || []);
        } catch (error) {
            console.error('Error fetching announcements:', error);
            // Fallback for demo/initial setup
            setAnnouncements([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                date: new Date().toISOString()
            };

            if (editingAnnouncement) {
                await api.put(`/announcements/${editingAnnouncement.id}`, payload);
                showNotification('تم تحديث الإعلان بنجاح', 'success');
            } else {
                await api.post('/announcements', payload);
                showNotification('تم نشر الإعلان بنجاح', 'success');
            }

            setIsModalOpen(false);
            setEditingAnnouncement(null);
            setFormData({ title: '', content: '', type: 'general', isActive: true });
            fetchAnnouncements();
        } catch (error) {
            showNotification('فشل حفظ الإعلان', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
        try {
            await api.delete(`/announcements/${id}`);
            showNotification('تم حذف الإعلان', 'success');
            fetchAnnouncements();
        } catch (error) {
            showNotification('فشل حذف الإعلان', 'error');
        }
    };

    const openEdit = (ann: Announcement) => {
        setEditingAnnouncement(ann);
        setFormData({
            title: ann.title,
            content: ann.content,
            type: ann.type,
            isActive: ann.isActive
        });
        setIsModalOpen(true);
    };

    const getTypeDetails = (type: string) => {
        switch (type) {
            case 'urgent': return { icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50', label: 'عاجل' };
            case 'holiday': return { icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50', label: 'إجازة' };
            case 'event': return { icon: Megaphone, color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'فعالية' };
            default: return { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', label: 'عام' };
        }
    };

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500" dir="rtl">
            {/* Premium Header with Icon */}
            <div className="relative bg-primary-600 p-8 shadow-xl overflow-hidden mb-6 border-b-4 border-primary-500">
                {/* Background Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

                <div className="relative z-10 flex items-center justify-between flex-wrap gap-6 px-2">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                            <Megaphone size={36} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-3xl font-black text-white mb-1 tracking-tight uppercase">إدارة الإعلانات والتعميمات</h1>
                            <p className="text-white/80 text-[10px] md:text-sm font-bold flex items-center gap-2">
                                <Bell size={14} className="text-white" />
                                نشر رسائل هامة لأولياء الأمور والمعلمات
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setEditingAnnouncement(null);
                            setFormData({ title: '', content: '', type: 'general', isActive: true });
                            setIsModalOpen(true);
                        }}
                        className="bg-white text-primary-700 px-8 py-3 flex items-center gap-3 hover:bg-white/95 active:bg-primary-50 transition-all font-black shadow-[0_10px_20px_-10px_rgba(0,0,0,0.3)] transform hover:-translate-y-1 active:translate-y-0 h-14 text-xs uppercase tracking-widest"
                    >
                        <Plus size={20} />
                        <span>إضافة إعلان جديد</span>
                    </button>
                </div>
            </div>

            {/* Announcements List */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h4 className="font-black text-[10px] text-gray-400 uppercase tracking-widest">قائمة الإعلانات النشطة وغير النشطة</h4>
                    <Bell size={16} className="text-gray-300" />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">
                                <th className="px-6 py-4">الإعلان</th>
                                <th className="px-6 py-4 text-center">النوع</th>
                                <th className="px-6 py-4 text-center">التاريخ</th>
                                <th className="px-6 py-4 text-center">الحالة</th>
                                <th className="px-6 py-4 text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {announcements.map((ann) => {
                                const type = getTypeDetails(ann.type);
                                return (
                                    <tr key={ann.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 max-w-md">
                                            <div className="font-black text-gray-900 dark:text-white text-sm">{ann.title}</div>
                                            <div className="text-[10px] text-gray-400 font-bold truncate mt-1">{ann.content}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <div className={cn("flex items-center gap-2 px-3 py-1 border text-[9px] font-black uppercase tracking-widest", type.bg, type.color)}>
                                                    <type.icon size={12} />
                                                    {type.label}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="text-[10px] font-bold text-gray-500">
                                                {format(new Date(ann.date), 'dd MMMM yyyy', { locale: ar })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-widest px-2 py-0.5",
                                                ann.isActive ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"
                                            )}>
                                                {ann.isActive ? 'نشط' : 'مسودة'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => openEdit(ann)}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(ann.id)}
                                                    className="p-2 text-gray-400 hover:text-rose-600 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {announcements.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold italic text-xs">لا توجد إعلانات منشورة حالياً</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                        <div className="p-6 bg-gray-900 text-white flex items-center justify-between">
                            <h3 className="font-black text-sm uppercase tracking-widest">
                                {editingAnnouncement ? 'تعديل إعلان' : 'إضافة إعلان جديد للمركز'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">عنوان الإعلان</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b-2 border-transparent focus:border-primary-500 focus:outline-none font-bold text-sm transition-all"
                                    placeholder="أدخل عنواناً جذاباً..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">نوع الإعلان</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as AnnouncementType })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b-2 border-transparent focus:border-primary-500 focus:outline-none font-bold text-sm"
                                    >
                                        <option value="general">عام</option>
                                        <option value="urgent">عاجل / هام</option>
                                        <option value="holiday">إجازة رسمية</option>
                                        <option value="event">فعالية / نشاط</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">حالة النشر</label>
                                    <select
                                        value={formData.isActive ? 'true' : 'false'}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b-2 border-transparent focus:border-primary-500 focus:outline-none font-bold text-sm"
                                    >
                                        <option value="true">نشط (يظهر للجميع)</option>
                                        <option value="false">تحت المراجعة (مسودة)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">محتوى الإعلان التفصيلي</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b-2 border-transparent focus:border-primary-500 focus:outline-none font-bold text-sm resize-none transition-all"
                                    placeholder="اكتب تفاصيل الإعلان هنا بشكل واضح..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-primary-600 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 size={16} />
                                حفظ ونشر الإعلان الآن
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
