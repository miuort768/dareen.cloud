import { useState, useEffect, useRef } from 'react';
import { Search, Plus, AlertTriangle, CheckCircle2, BookOpen, GraduationCap, TrendingUp, Clock, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { socketService } from '../lib/socket';
import { SOCKET_EVENTS } from '../lib/socket-events';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ErrorBanner } from '../shared/components/ui/ErrorState';
import { TrialSessionCard } from './TrialSessionCard';
import { TrialSessionFormModal } from './TrialSessionFormModal';
import { TrialSessionDrawer } from './TrialSessionDrawer';
import { useUIStore } from '../store/uiStore';
import { useAcademyName } from '../context/AppContext';
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

interface StatsData {
  total: number;
  completed: number;
  pending: number;
  cancelled: number;
  converted?: number;
}

const Counter = ({ value, duration = 800 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<number | null>(null);
  useEffect(() => {
    if (ref.current) cancelAnimationFrame(ref.current);
    const start = performance.now();
    const from = count;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(from + (value - from) * eased));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [value, duration]);
  return <>{count}</>;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } }
};

const TrialSessionsSkeleton = () => (
  <div className="bg-background min-h-screen pb-24" dir="rtl">
    <div className="px-3 max-w-page mx-auto">
      <Skeleton className="h-[200px] rounded-2xl mt-4 mb-4" />
      <Skeleton className="h-12 rounded-2xl mb-4" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-[130px] rounded-2xl mb-3" />
      ))}
    </div>
  </div>
);

export const TrialSessions = () => {
  const academyName = useAcademyName();
  useEffect(() => { document.title = `الجلسات التجريبية | ${academyName}`; }, [academyName]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drawerSession, setDrawerSession] = useState<TrialSession | null>(null);
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

  const { data: stats } = useQuery<StatsData>({
    queryKey: ['trial-sessions-stats'],
    queryFn: () => api.get<StatsData>('/trial-sessions/stats')
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

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  const handleWhatsApp = (phone: string) => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleaned}`, '_blank');
  };

  const subjects = [...new Set(trials.map((t: TrialSession) => t.subject).filter(Boolean))] as string[];

  const filtered = trials.filter((t: TrialSession) => {
    const matchSearch = !search || t.studentName.toLowerCase().includes(search.toLowerCase()) || t.parentPhone.includes(search);
    const matchStatus = !filterStatus || t.status === filterStatus;
    const matchSubject = !filterSubject || t.subject === filterSubject;
    return matchSearch && matchStatus && matchSubject;
  });

  const conversionRate = stats?.total ? Math.round(((stats.completed + (stats.converted || 0)) / stats.total) * 100) : 0;

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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-background min-h-screen pb-24"
      dir="rtl"
    >
      <div className="px-3 space-y-4 max-w-page mx-auto relative z-10">
        {/* ════════════════════════════════════════
            Hero Section
           ════════════════════════════════════════ */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-dark/80 to-primary-dark mt-4">
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.06]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="ts-hero-grid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="white" />
                  <circle cx="16" cy="16" r="0.8" fill="white" opacity="0.4" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#ts-hero-grid)" />
            </svg>
          </div>

          {/* Hero content */}
          <div className="relative z-10 px-4 md:px-6 py-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center ring-2 ring-white/30 shrink-0">
                <GraduationCap size={18} className="text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg md:text-xl font-bold font-outfit text-white">الحصص التجريبية</h1>
                <p className="text-[11px] text-white/70">{stats?.total || 0} حصة مسجلة</p>
              </div>
            </div>

            {/* KPI Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 text-white/60 text-xs mb-1.5">
                  <BookOpen size={14} />
                  <span>إجمالي الحصص</span>
                </div>
                <div className="text-2xl font-bold font-outfit text-white"><Counter value={stats?.total || 0} /></div>
                <div className="text-white/50 text-[11px] mt-1">جميع الحصص</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 text-white/60 text-xs mb-1.5">
                  <CheckCircle2 size={14} />
                  <span>تمت بنجاح</span>
                </div>
                <div className="text-2xl font-bold font-outfit text-white"><Counter value={stats?.completed || 0} /></div>
                <div className="text-success text-[11px] mt-1">ناجحة</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 text-white/60 text-xs mb-1.5">
                  <Clock size={14} />
                  <span>قيد الانتظار</span>
                </div>
                <div className="text-2xl font-bold font-outfit text-white"><Counter value={stats?.pending || 0} /></div>
                <div className="text-warning text-[11px] mt-1">بانتظار الموعد</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 text-white/60 text-xs mb-1.5">
                  <TrendingUp size={14} />
                  <span>معدل التحويل</span>
                </div>
                <div className="text-2xl font-bold font-outfit text-white">{conversionRate}%</div>
                <div className="text-success text-[11px] mt-1">{stats?.converted || 0} تحويل</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ════════════════════════════════════════
            Main Content Card
           ════════════════════════════════════════ */}
        <motion.div variants={itemVariants} className="bg-main rounded-2xl shadow-elevation-1 border border-border overflow-hidden">
          {/* Toolbar: search + filters */}
          <div className="p-4 lg:p-5 border-b border-border">
            <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="بحث باسم الطالب أو رقم الهاتف..."
                  aria-label="بحث عن حصة"
                  className="w-full bg-surface border border-border rounded-xl pr-10 pl-3 py-2.5 text-xs text-main placeholder:text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  aria-label="تصفية حسب الحالة"
                  className="px-3 py-2.5 bg-surface border border-border rounded-xl text-xs font-bold text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                >
                  <option value="">كل الحالات</option>
                  <option value="pending">قيد الانتظار</option>
                  <option value="completed">تمت</option>
                  <option value="cancelled">ملغية</option>
                  <option value="converted">تم التحويل</option>
                </select>
                {subjects.length > 0 && (
                  <select
                    value={filterSubject}
                    onChange={e => setFilterSubject(e.target.value)}
                    aria-label="تصفية حسب المادة"
                    className="px-3 py-2.5 bg-surface border border-border rounded-xl text-xs font-bold text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">كل المواد</option>
                    {subjects.map(subj => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))}
                  </select>
                )}
                <button
                  onClick={() => { setEditingId(null); resetForm(); setShowModal(true); }}
                  className="h-9 px-4 bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Plus size={14} /> حصة جديدة
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-muted">
                <span className="font-bold text-main">{filtered.length}</span> حصة
              </span>
            </div>
          </div>

          {/* Cards List */}
          <div className="p-4 lg:p-5">
            {filtered.length === 0 ? (
              <div className="text-center py-14">
                <div className="w-16 h-16 rounded-2xl bg-primary-soft flex items-center justify-center mx-auto mb-4 ring-1 ring-primary/20">
                  <Users size={28} className="text-primary/40" />
                </div>
                <p className="text-sm font-bold text-muted mb-1">
                  {search || filterStatus || filterSubject ? 'لا توجد نتائج للبحث' : 'لا توجد حصص تجريبية'}
                </p>
                <p className="text-[11px] text-muted/60 mb-4">
                  {search || filterStatus || filterSubject ? 'حاول تغيير معايير البحث' : 'ابدأ بإضافة أول حصة تجريبية'}
                </p>
                {!search && !filterStatus && !filterSubject && (
                  <button onClick={() => { resetForm(); setShowModal(true); }} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold rounded-xl transition-all active:scale-[0.98]">
                    <Plus size={14} /> إضافة حصة
                  </button>
                )}
              </div>
            ) : (
              <motion.div variants={containerVariants} className="space-y-3">
                {filtered.map((t: TrialSession) => (
                  <motion.div key={t.id} variants={itemVariants}>
                    <TrialSessionCard
                      session={t}
                      onConvert={(id) => convertMutation.mutate(id)}
                      onEdit={openEdit}
                      onDelete={(id) => setConfirmId(id)}
                      onCall={handleCall}
                      onWhatsApp={handleWhatsApp}
                      onCardClick={() => setDrawerSession(t)}
                      isConverting={convertMutation.isPending}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ════════════════════════════════════════
            FAB Button
           ════════════════════════════════════════ */}
        <motion.button
          onClick={() => { setEditingId(null); resetForm(); setShowModal(true); }}
          className="fixed bottom-8 left-8 z-40 w-14 h-14 bg-primary text-on-primary rounded-full shadow-xl shadow-primary/30 flex items-center justify-center hover:bg-primary-hover active:scale-95 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={24} />
        </motion.button>

        {/* ════════════════════════════════════════
            Add/Edit Modal
           ════════════════════════════════════════ */}
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

        {/* ════════════════════════════════════════
            Drawer
           ════════════════════════════════════════ */}
        <TrialSessionDrawer
          session={drawerSession}
          onClose={() => setDrawerSession(null)}
          onCall={handleCall}
          onWhatsApp={handleWhatsApp}
          onConvert={(id) => { convertMutation.mutate(id); setDrawerSession(null); }}
          onEdit={(s) => { setDrawerSession(null); openEdit(s); }}
          isConverting={convertMutation.isPending}
        />

        {/* ════════════════════════════════════════
            Confirm Delete
           ════════════════════════════════════════ */}
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
