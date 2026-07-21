import { useState, useEffect } from 'react';
import { Megaphone, Plus } from 'lucide-react';
import { api } from '../lib/api';
import { useShowNotification } from '../context/AppContext';
import { confirm } from '../lib/confirmDialog';
import { AnnouncementCard } from './AnnouncementCard';
import { AnnouncementFormModal } from './AnnouncementFormModal';

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
    const showNotification = useShowNotification();
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
            const data = await api.get<Announcement[]>('/announcements');
            setAnnouncements(data || []);
        } catch (error) {
            console.error('Error fetching announcements:', error);
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
        } catch (e) {
            console.error(e);
            showNotification('فشل حفظ الإعلان', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!await confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
        try {
            await api.delete(`/announcements/${id}`);
            showNotification('تم حذف الإعلان', 'success');
            fetchAnnouncements();
        } catch (e) {
            console.error(e);
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

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative" dir="rtl">
            <div className="max-w-page mx-auto px-2">
            
            <div className="bg-card rounded-2xl shadow-sm border border-border px-4 md:px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-info-soft text-info flex items-center justify-center shrink-0">
                        <Megaphone size={22} />
                    </div>
                    <div>
                        <h1 className="text-lg md:text-xl font-bold text-main leading-tight">الإعلانات</h1>
                        <p className="text-xs font-bold text-muted mt-0.5">إدارة الإعلانات والتنبيهات</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-info-soft text-info">
                        <span className="text-sm font-semibold leading-none">{announcements.filter(a => a.isActive).length}</span>
                        <span className="text-micro font-bold leading-none">نشط</span>
                    </div>
                    <button
                        onClick={() => {
                            setEditingAnnouncement(null);
                            setFormData({ title: '', content: '', type: 'general', isActive: true });
                            setIsModalOpen(true);
                        }}
                        className="bg-primary text-on-primary h-10 px-4 flex items-center justify-center gap-2 hover:bg-primary-hover transition-all font-bold shadow-sm active:scale-95 rounded-xl"
                    >
                        <Plus size={16} />
                        <span className="text-micro font-bold">إضافة إعلان</span>
                    </button>
                </div>
            </div>

            {/* ??????????????? ANNOUNCEMENTS GRID ??????????????? */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {announcements.map((ann) => (
                    <AnnouncementCard key={ann.id} announcement={ann} onEdit={openEdit} onDelete={handleDelete} />
                ))}
                {announcements.length === 0 && !isLoading && (
                    <div className="col-span-full py-20 bg-card border border-dashed border-border flex flex-col items-center justify-center text-center rounded-2xl">
                        <div className="w-12 h-12 rounded-xl bg-info-soft text-info flex items-center justify-center mx-auto mb-3">
                            <Megaphone size={22} />
                        </div>
                        <h3 className="text-sm font-bold text-muted">لا توجد إعلانات بعد</h3>
                    </div>
                )}
            </div>

            <AnnouncementFormModal
                isOpen={isModalOpen}
                editingAnnouncement={editingAnnouncement}
                formData={formData}
                onChange={(data) => setFormData((prev) => ({ ...prev, ...data }))}
                onClose={() => { setIsModalOpen(false); setEditingAnnouncement(null); setFormData({ title: '', content: '', type: 'general', isActive: true }); }}
                onSubmit={handleSave}
            />
            </div>
        </div>
    );
};
