import { useState, useEffect } from 'react';
import { Search, Plus, AlertTriangle, Clock, X, CheckCircle2, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { socketService } from '../lib/socket';
import { SOCKET_EVENTS } from '../lib/socket-events';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ErrorBanner } from '../shared/components/ui/ErrorState';
import { TrialSessionCard } from './TrialSessionCard';
import { TrialSessionFormModal } from './TrialSessionFormModal';
import { useUIStore } from '../store/uiStore';
import { Skeleton } from '../shared/components/ui/Skeleton';

export interface TrialSession {
  id: string;
  studentName: string;
  parentPhone: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  date: string;
  time: string;
  status: 'pending' | 'completed' | 'cancelled' | 'converted';
  notes: string;
  created_at: string;
}

const TrialSessionsSkeleton = () => (
  <div className="bg-background min-h-screen pb-24" dir="rtl">
    <div className="px-3 space-y-3 max-w-page mx-auto">
      <div className="bg-card border border-border rounded-2xl p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <div><Skeleton className="h-4 w-28 mb-1.5" /><Skeleton className="h-3 w-12" /></div>
          </div>
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2.5 p-3 rounded-2xl bg-card border border-border">
            <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
            <div><Skeleton className="h-3 w-14 mb-1" /><Skeleton className="h-4 w-8" /></div>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-2xl p-2">
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5"><Skeleton className="w-8 h-8 rounded-xl" /><div><Skeleton className="h-4 w-24 mb-1" /><Skeleton className="h-3 w-16" /></div></div>
            <div className="flex gap-1"><Skeleton className="w-7 h-7 rounded-xl" /><Skeleton className="w-7 h-7 rounded-xl" /></div>
          </div>
          <div className="grid grid-cols-3 gap-2"><Skeleton className="h-3.5 w-24" /><Skeleton className="h-3.5 w-20" /><Skeleton className="h-3.5 w-16" /></div>
        </div>
      ))}
    </div>
  </div>
);

export const TrialSessions = () => {
  useEffect(() => { document.title = 'الجلسات التجريبية | دارين السابعة للتعليم والتدريب'; }, []);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ studentName: '', parentPhone: '', subject: '', teacherId: '', teacherName: '', date: '', time: '', notes: '' });
  const queryClient = useQueryClient();
  const showNotification = useUIStore((s) => s.showNotification);

  const { data: trials = [], isLoading, isError: isTrialsError } = useQuery({
    queryKey: ['trial-sessions'],
    queryFn: () => api.get<TrialSession[]>('/trial-sessions')
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => api.get<Record<string, unknown>[]>('/teachers')
  });

  const { data: stats } = useQuery({
    queryKey: ['trial-sessions-stats'],
    queryFn: () => api.get<{ total: number; completed: number; pending: number; cancelled: number }>('/trial-sessions/stats')
  });

  const addMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => editingId ? api.put(`/trial-sessions/${editingId}`, data) : api.post('/trial-sessions', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trial-sessions'] }); queryClient.invalidateQueries({ queryKey: ['trial-sessions-stats'] }); setShowModal(false); setEditingId(null); resetForm(); showNotification(editingId ? 'تم تحديث الحصة' : 'تمت إضافة الحصة', 'success'); },
    onError: (err: Error) => showNotification('حدث خطأ: ' + err.message, 'error')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/trial-sessions/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trial-sessions'] }); queryClient.invalidateQueries({ queryKey: ['trial-sessions-stats'] }); setConfirmId(null); showNotification('تم حذف الحصة', 'success'); },
    onError: (err: Error) => showNotification('حدث خطأ: ' + err.message, 'error')
  });

  const convertMutation = useMutation({
    mutationFn: (id: string) => api.post(`/trial-sessions/${id}/convert`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trial-sessions'] }); queryClient.invalidateQueries({ queryKey: ['trial-sessions-stats'] }); queryClient.invalidateQueries({ queryKey: ['students'] }); showNotification('تم تحويل العميل إلى طالب', 'success'); },
    onError: (err: Error) => showNotification('حدث خطأ: ' + err.message, 'error')
  });

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['trial-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['trial-sessions-stats'] });
    };
    socket.on(SOCKET_EVENTS.TRIAL_SESSION_UPDATED, handleUpdate);
    return () => { socket.off(SOCKET_EVENTS.TRIAL_SESSION_UPDATED, handleUpdate); };
  }, [queryClient]);

  const resetForm = () => setForm({ studentName: '', parentPhone: '', subject: '', teacherId: '', teacherName: '', date: '', time: '', notes: '' });

  const openEdit = (t: TrialSession) => {
    setForm({ studentName: t.studentName, parentPhone: t.parentPhone, subject: t.subject || '', teacherId: t.teacherId || '', teacherName: t.teacherName || '', date: t.date, time: t.time || '', notes: t.notes || '' });
    setEditingId(t.id); setShowModal(true);
  };

  const filtered = trials.filter((t: TrialSession) => {
    const matchSearch = !search || t.studentName.toLowerCase().includes(search.toLowerCase()) || t.parentPhone.includes(search);
    const matchStatus = !filterStatus || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (isLoading) return <TrialSessionsSkeleton />;

  if (isTrialsError) {
    return (
      <div className="bg-background min-h-screen pb-24" dir="rtl">
        <div className="pt-6 md:pt-10 px-4 md:px-6 max-w-7xl mx-auto">
          <ErrorBanner />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-background min-h-screen pb-24"
      dir="rtl"
    >
      <div className="px-3 space-y-3 max-w-page mx-auto">
        {/* Header */}
        <div className="bg-card border border-border rounded-2xl p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center ring-1 ring-primary/20">
                <BookOpen size={17} className="text-primary" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-main leading-tight">الحصص التجريبية</h1>
                <p className="text-[10px] text-muted">{filtered.length} حصة</p>
              </div>
            </div>
            <button onClick={() => { setEditingId(null); resetForm(); setShowModal(true); }} className="flex items-center gap-1 h-8 px-2.5 bg-primary text-on-primary text-[10px] font-bold rounded-lg active:scale-95 transition-transform">
              <Plus size={11} /> حصة جديدة
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { title: 'الإجمالي', value: stats?.total || 0, icon: BookOpen, iconBg: 'bg-primary-soft', iconColor: 'text-primary', ring: 'ring-primary/20' },
            { title: 'تم', value: stats?.completed || 0, icon: CheckCircle2, iconBg: 'bg-success-soft', iconColor: 'text-success', ring: 'ring-success/20' },
            { title: 'قيد الانتظار', value: stats?.pending || 0, icon: Clock, iconBg: 'bg-warning-soft', iconColor: 'text-warning', ring: 'ring-warning/20' },
            { title: 'ملغي', value: stats?.cancelled || 0, icon: X, iconBg: 'bg-error-soft', iconColor: 'text-error', ring: 'ring-error/20' },
          ].map(s => (
            <div key={s.title} className="flex items-center gap-2.5 p-3 rounded-2xl bg-card border border-border font-dash">
              <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ring-1', s.iconBg, s.ring)}>
                <s.icon size={14} className={s.iconColor} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted leading-none">{s.title}</p>
                <p className="text-sm font-bold text-main tabular-nums mt-0.5">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="bg-card border border-border rounded-2xl p-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث باسم الطالب أو رقم الهاتف..." aria-label="بحث عن حصة" className="w-full ps-8 pe-3 py-2.5 bg-surface border border-border rounded-xl text-xs font-bold text-main placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} aria-label="تصفية حسب الحالة" className="px-3 py-2.5 bg-surface border border-border rounded-xl text-xs font-bold text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all">
              <option value="">كل الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="completed">تم</option>
              <option value="cancelled">ملغي</option>
              <option value="converted">تم التحويل</option>
            </select>
          </div>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-primary-soft flex items-center justify-center mx-auto mb-3 ring-1 ring-primary/20">
              <BookOpen size={20} className="text-primary" />
            </div>
            <p className="text-xs font-bold text-muted">لا توجد حصص تجريبية</p>
            <p className="text-[10px] text-muted mt-1">ستظهر هنا الحصص التجريبية المسجلة</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((t: TrialSession) => (
              <TrialSessionCard
                key={t.id}
                session={t}
                onConvert={(id) => convertMutation.mutate(id)}
                onEdit={openEdit}
                onDelete={(id) => setConfirmId(id)}
                isConverting={convertMutation.isPending}
              />
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        <AnimatePresence>
        {showModal && (
          <TrialSessionFormModal
            editingId={editingId}
            form={form}
            teachers={teachers}
            isSaving={addMutation.isPending}
            onChange={setForm}
            onSubmit={(e) => { e.preventDefault(); addMutation.mutate(form); }}
            onClose={() => { setShowModal(false); setEditingId(null); resetForm(); }}
          />
        )}
        </AnimatePresence>

        {/* Confirm Delete */}
        <AnimatePresence>
        {confirmId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" dir="rtl">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-card shadow-elevation-2 w-full max-w-sm border border-border rounded-2xl overflow-hidden">
              <div className="bg-error px-5 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/15">
                  <AlertTriangle size={20} className="text-on-error" />
                </div>
                <h3 className="text-sm font-bold text-on-error">تأكيد الحذف</h3>
              </div>
              <div className="p-5">
                <p className="text-sm font-bold text-main">هل أنت متأكد من الحذف؟</p>
              </div>
              <div className="flex gap-2 px-5 pb-5">
                <button type="button" onClick={() => setConfirmId(null)} className="flex-1 py-3 text-xs font-bold text-muted bg-surface hover:bg-hover rounded-xl transition-all active:scale-[0.98]">إلغاء</button>
                <button type="button" onClick={() => { if (confirmId) deleteMutation.mutate(confirmId); }} disabled={deleteMutation.isPending} className="flex-1 py-3 text-xs font-bold text-on-error bg-error hover:bg-error-hover rounded-xl transition-all active:scale-[0.98] disabled:opacity-50">{deleteMutation.isPending ? 'جاري الحذف...' : 'حذف'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
