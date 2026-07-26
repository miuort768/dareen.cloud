import { useState, useEffect } from 'react';
import { Megaphone, Plus } from 'lucide-react';
import { EmptyState } from '../shared/components/ui/EmptyState';
import { api, safeArray } from '../lib/api';
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
    useEffect(() => { document.title = 'الإعلانات | دارين السابعة للتعليم والتدريب'; }, []);
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
            setAnnouncements(safeArray<Announcement>(data));
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
            
            {/* ── Header ── */}
            <div className="bg-surface border border-border/50 rounded-2xl p-3 md:p-4 mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-info-soft flex items-center justify-center">
                            <Megaphone size={17} className="text-info" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-main leading-tight">الإعلانات</h1>
                            <p className="text-[10px] text-dim">{announcements.filter(a => a.isActive).length} نشط</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setEditingAnnouncement(null);
                            setFormData({ title: '', content: '', type: 'general', isActive: true });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-1 h-8 px-2.5 bg-primary text-on-primary text-[10px] font-bold rounded-lg active:scale-95 transition-transform"
                    >
                        <Plus size={11} /> إضافة
                    </button>
                </div>
            </div>

            {/* ??????????????? ANNOUNCEMENTS GRID ??????????????? */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {announcements.map((ann) => (
                    <AnnouncementCard key={ann.id} announcement={ann} onEdit={openEdit} onDelete={handleDelete} />
                ))}
                {announcements.length === 0 && !isLoading && (
                    <EmptyState
                        icon={Megaphone}
                        title="لا توجد إعلانات بعد"
                        className="col-span-full bg-card border border-dashed border-border rounded-2xl"
                    />
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
