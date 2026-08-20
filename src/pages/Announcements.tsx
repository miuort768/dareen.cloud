import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Megaphone, Plus, Bell, Calendar, Filter, BarChart3, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmptyState } from '../shared/components/ui/EmptyState';
import { api, safeArray } from '../lib/api';
import { useShowNotification, useAcademyName } from '../context/AppContext';
import { confirm } from '../lib/confirmDialog';
import { AnnouncementCard } from './AnnouncementCard';
import { AnnouncementFormModal } from './AnnouncementFormModal';
import { cn } from '../lib/utils';
import { TeacherDashboardHeader } from './TeacherDashboardHeader';
import { ParentDashboardHeader } from './parent-dashboard/ParentDashboardHeader';
import { StudentDashboardHeader } from './student-dashboard/StudentDashboardHeader';
import { useLogout } from '../shared/hooks/useLogout';
import { useCurrentUser } from '../context/AppContext';

type AnnouncementType = 'general' | 'urgent' | 'holiday' | 'event';

interface Announcement {
    id: string;
    title: string;
    content: string;
    type: AnnouncementType;
    date: string;
    isActive: boolean;
}

const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 5 + 2, duration: Math.random() * 6 + 4, delay: Math.random() * 3,
}));

export const Announcements = () => {
    const academyName = useAcademyName();
    useEffect(() => { document.title = `الإعلانات | ${academyName}`; }, [academyName]);
    const showNotification = useShowNotification();
    const currentUser = useCurrentUser();
    const logout = useLogout();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [fabOpen, setFabOpen] = useState(false);

    const openEdit = (ann: Announcement) => {
        setEditingAnnouncement(ann);
        setFormData({
            title: ann.title,
            content: ann.content,
            type: ann.type,
            isActive: ann.isActive,
        });
        setIsModalOpen(true);
    };

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

    const handleDeleteAll = async () => {
        if (announcements.length === 0) {
            showNotification('لا توجد إعلانات لحذفها', 'info');
            return;
        }
        if (!await confirm(`هل أنت متأكد من حذف جميع الإعلانات (${announcements.length} إعلان)؟`)) return;
        try {
            await Promise.all(announcements.map(a => api.delete(`/announcements/${a.id}`)));
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
            showNotification('تم حذف جميع الإعلانات بنجاح', 'success');
        } catch (e) {
            console.error(e);
            showNotification('حدث خطأ أثناء حذف الإعلانات', 'error');
        }
    };

    const kpiCards = useMemo(() => [
        { label: 'إجمالي الإعلانات', value: announcements.length, icon: Megaphone, gradient: 'from-primary/20 to-primary/5', iconBg: 'bg-primary/10 text-primary', accent: 'bg-primary' },
        { label: 'النشطة', value: announcements.filter(a => a.isActive).length, icon: Bell, gradient: 'from-success/20 to-success/5', iconBg: 'bg-success/10 text-success', accent: 'bg-success' },
        { label: 'غير النشطة', value: announcements.filter(a => !a.isActive).length, icon: Filter, gradient: 'from-warning/20 to-warning/5', iconBg: 'bg-warning/10 text-warning', accent: 'bg-warning' },
        { label: 'الأحداث', value: announcements.filter(a => a.type === 'event' || a.type === 'holiday').length, icon: Calendar, gradient: 'from-info/20 to-info/5', iconBg: 'bg-info/10 text-info', accent: 'bg-info' },
    ], [announcements]);

    const fabActions = useMemo(() => [
        { icon: Plus, label: 'إعلان جديد', onClick: () => { setEditingAnnouncement(null); setFormData({ title: '', content: '', type: 'general', isActive: true }); setIsModalOpen(true); } },
        { icon: Trash2, label: 'حذف الكل', onClick: handleDeleteAll },
    ], [announcements]);

    return (
        <>
            {currentUser?.role === 'teacher' && (
                <div className="hidden md:block">
                    <TeacherDashboardHeader logout={logout} />
                </div>
            )}
            {currentUser?.role === 'parent' && (
                <div className="hidden md:block">
                    <ParentDashboardHeader logout={logout} />
                </div>
            )}
            {currentUser?.role === 'student' && (
                <div className="hidden md:block">
                    <StudentDashboardHeader logout={logout} />
                </div>
            )}
            <div className="min-h-full pb-24 overflow-x-hidden relative" dir="rtl">
                <div className="max-w-page mx-auto px-2">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover dark:from-slate-950 dark:via-indigo-950/90 dark:to-slate-950 border border-transparent dark:border-primary/20 p-6 md:p-8 mb-4">
                    {particles.map(p => (
                        <motion.div key={p.id} className="absolute rounded-full bg-white/10 pointer-events-none"
                            style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
                            animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }} />
                    ))}
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-xl bg-white/15 backdrop-blur-sm"><Megaphone className="text-white" size={20} /></div>
                                <span className="text-white/70 text-xs font-medium">الإدارة</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-on-primary mb-1">الإعلانات</h1>
                            <p className="text-white/70 text-sm">نشر وإدارة الإعلانات والتنبيهات</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                            <div className="text-center">
                                <p className="text-white/60 text-xs mb-1">الإجمالي</p>
                                <p className="text-2xl font-bold text-white">{announcements.length}</p>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-center">
                                <p className="text-white/60 text-xs mb-1">النشطة</p>
                                <p className="text-2xl font-bold text-white">{announcements.filter(a => a.isActive).length}</p>
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
                                    whileHover={{ scale: 1.02, y: -2 }} className={cn("relative overflow-hidden rounded-xl bg-gradient-to-br border border-border/50 p-4", kpi.gradient)}>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {announcements.map((ann, idx) => (
                            <motion.div key={ann.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * idx }}>
                                <AnnouncementCard announcement={ann} onEdit={openEdit} onDelete={handleDelete} />
                            </motion.div>
                        ))}
                        {announcements.length === 0 && !isLoading && (
                            <EmptyState icon={Megaphone} title="لا توجد إعلانات بعد" className="col-span-full bg-card border border-dashed border-border rounded-2xl" />
                        )}
                    </div>
                </motion.div>

                <AnnouncementFormModal isOpen={isModalOpen} editingAnnouncement={editingAnnouncement}
                    formData={formData} onChange={(data) => setFormData((prev) => ({ ...prev, ...data }))}
                    onClose={() => { setIsModalOpen(false); setEditingAnnouncement(null); setFormData({ title: '', content: '', type: 'general', isActive: true }); }}
                    onSubmit={handleSave} />
            </div>

            <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
                <AnimatePresence>
                    {fabOpen && fabActions.map((action, i) => (
                        <motion.div key={action.label} initial={{ opacity: 0, scale: 0.3, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.3, y: 20 }} transition={{ delay: 0.05 * (fabActions.length - 1 - i) }} className="flex items-center gap-2">
                            <span className="bg-card border border-border text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm whitespace-nowrap">{action.label}</span>
                            <button onClick={() => { action.onClick(); setFabOpen(false); }}
                                className="w-11 h-11 rounded-2xl bg-primary text-on-primary shadow-lg hover:shadow-xl hover:bg-primary-hover transition-all flex items-center justify-center active:scale-95">
                                <action.icon size={18} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <motion.button onClick={() => setFabOpen(!fabOpen)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className={cn("w-13 h-13 rounded-2xl shadow-xl text-on-primary flex items-center justify-center transition-all", fabOpen ? "bg-error rotate-45" : "bg-primary")}>
                    <Plus size={24} />
                </motion.button>
            </div>
        </div>
        </>
    );
};
