import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

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

    const { data: announcements = [], isLoading } = useQuery({
        queryKey: ['announcements'],
        queryFn: async () => {
            const data = await api.get<Announcement[]>('/announcements');
            return safeArray<Announcement>(data);
        },
    });

    const saveMutation = useMutation({
        mutationFn: async ({ payload, id }: { payload: Record<string, unknown>; id?: string }) => {
            if (id) return api.put(`/announcements/${id}`, payload);
            return api.post('/announcements', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
            setIsModalOpen(false);
            setEditingAnnouncement(null);
            setFormData({ title: '', content: '', type: 'general', isActive: true });
            showNotification(editingAnnouncement ? 'تم تحديث الإعلان بنجاح' : 'تم نشر الإعلان بنجاح', 'success');
        },
        onError: () => showNotification('فشل حفظ الإعلان', 'error'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/announcements/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
            showNotification('تم حذف الإعلان', 'success');
        },
        onError: () => showNotification('فشل حذف الإعلان', 'error'),
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        saveMutation.mutate({ payload: { ...formData, date: new Date().toISOString() }, id: editingAnnouncement?.id });
    };

    const handleDelete = async (id: string) => {
        if (!await confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
        deleteMutation.mutate(id);
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
            <div className="bg-surface border border-border rounded-2xl p-3 md:p-4 mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-info-soft flex items-center justify-center">
                            <Megaphone size={17} className="text-info" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-main leading-tight">الإعلانات</h1>
                            <p className="text-[10px] text-muted">{announcements.filter(a => a.isActive).length} نشط</p>
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
