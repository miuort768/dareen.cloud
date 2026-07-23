import { useState, useEffect } from 'react';
import { Search, Plus, AlertTriangle, Clock, X, CheckCircle2, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { socketService } from '../lib/socket';
import { SOCKET_EVENTS } from '../lib/socket-events';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageLoader } from '../components/ui/PageLoader';
import { ErrorBanner } from '../shared/components/ui/ErrorState';
import { TrialSessionCard } from './TrialSessionCard';
import { TrialSessionFormModal } from './TrialSessionFormModal';

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

export const TrialSessions = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ studentName: '', parentPhone: '', subject: '', teacherId: '', teacherName: '', date: '', time: '', notes: '' });
  const queryClient = useQueryClient();

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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trial-sessions'] }); queryClient.invalidateQueries({ queryKey: ['trial-sessions-stats'] }); setShowModal(false); setEditingId(null); resetForm(); },
    onError: (err: Error) => alert('حدث خطأ في إضافة الحصة: ' + err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/trial-sessions/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trial-sessions'] }); queryClient.invalidateQueries({ queryKey: ['trial-sessions-stats'] }); setConfirmId(null); },
    onError: (err: Error) => alert('حدث خطأ في الحذف: ' + err.message)
  });

  const convertMutation = useMutation({
    mutationFn: (id: string) => api.post(`/trial-sessions/${id}/convert`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trial-sessions'] }); queryClient.invalidateQueries({ queryKey: ['trial-sessions-stats'] }); queryClient.invalidateQueries({ queryKey: ['students'] }); },
    onError: (err: Error) => alert('حدث خطأ في تحويل العميل: ' + err.message)
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

  if (isLoading) return <PageLoader />;

  if (isTrialsError) {
    return (
      <div className="bg-surface dark:bg-background min-h-screen pb-24" dir="rtl">
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
      className="bg-surface dark:bg-background min-h-screen pb-24"
      dir="rtl"
    >
      <div className="px-3 space-y-3 max-w-page mx-auto">
        {/* Header */}
        <div className="bg-surface border border-border/50 rounded-2xl p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center">
                <BookOpen size={17} className="text-primary" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-main leading-tight">الحصص التجريبية</h1>
                <p className="text-[10px] text-dim">{filtered.length} حصة</p>
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
            { title: 'الإجمالي', value: stats?.total || 0, icon: BookOpen, iconBg: 'bg-primary-soft', iconColor: 'text-primary' },
            { title: 'تم', value: stats?.completed || 0, icon: CheckCircle2, iconBg: 'bg-success-soft', iconColor: 'text-success' },
            { title: 'قيد الانتظار', value: stats?.pending || 0, icon: Clock, iconBg: 'bg-warning-soft', iconColor: 'text-warning' },
            { title: 'ملغي', value: stats?.cancelled || 0, icon: X, iconBg: 'bg-error-soft', iconColor: 'text-error' },
          ].map(s => (
            <div key={s.title} className="flex items-center gap-2.5 p-3 rounded-xl bg-surface border border-border/50">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', s.iconBg)}>
                <s.icon size={14} className={s.iconColor} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-dim leading-none">{s.title}</p>
                <p className="text-sm font-bold text-main tabular-nums mt-0.5">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="bg-surface border border-border/50 rounded-2xl p-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث باسم الطالب أو رقم الهاتف..." aria-label="بحث عن حصة" className="w-full ps-8 pe-3 py-2.5 bg-background border border-border/50 rounded-xl text-xs font-bold text-main placeholder:text-muted focus:outline-none focus:border-primary transition-all" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} aria-label="تصفية حسب الحالة" className="px-3 py-2.5 bg-background border border-border/50 rounded-xl text-xs font-bold text-main focus:outline-none focus:border-primary transition-all">
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
          <div className="text-center py-12 bg-surface border border-border/50 rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-primary-soft flex items-center justify-center mx-auto mb-3">
              <BookOpen size={20} className="text-primary" />
            </div>
            <p className="text-xs font-bold text-muted">لا توجد حصص تجريبية</p>
            <p className="text-[10px] text-dim mt-1">ستظهر هنا الحصص التجريبية المسجلة</p>
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

        {/* Confirm Delete */}
        {confirmId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" dir="rtl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card shadow-soft w-full max-w-sm border border-border/50 rounded-card overflow-hidden">
              <div className="bg-error px-5 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-card flex items-center justify-center bg-error-soft">
                  <AlertTriangle size={20} className="text-error" />
                </div>
                <h3 className="text-sm font-bold text-on-error">تأكيد الحذف</h3>
              </div>
              <div className="p-5">
                <p className="text-sm font-bold text-main">هل أنت متأكد من الحذف؟</p>
              </div>
              <div className="flex gap-2 px-5 pb-5">
                <button type="button" onClick={() => setConfirmId(null)} className="flex-1 py-3 text-xs font-bold text-muted bg-surface hover:bg-hover rounded-card transition-all active:scale-[0.98]">إلغاء</button>
                <button type="button" onClick={() => { if (confirmId) deleteMutation.mutate(confirmId); }} disabled={deleteMutation.isPending} className="flex-1 py-3 text-xs font-bold text-on-error bg-error hover:bg-error-hover rounded-card transition-all active:scale-[0.98] disabled:opacity-50">{deleteMutation.isPending ? 'جاري الحذف...' : 'حذف'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
