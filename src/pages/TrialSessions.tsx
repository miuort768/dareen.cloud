import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Plus, AlertTriangle, CheckCircle2, BookOpen, GraduationCap, TrendingUp, Clock, Users, X, CalendarDays, Eye, EyeOff, Download, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
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

const PAID_STORAGE_KEY = 'paidTrialSessions';
const ITEMS_PER_PAGE = 10;

const getPaidIds = (): string[] => {
  try { return JSON.parse(localStorage.getItem(PAID_STORAGE_KEY) || '[]'); } catch { return []; }
};

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

const statusFilters = [
  { key: 'pending', label: 'بانتظار', color: 'text-warning', bg: 'bg-warning/10', darkBg: 'dark:bg-warning/15', darkText: 'dark:text-warning', dot: 'bg-warning' },
  { key: 'completed', label: 'تمت', color: 'text-success', bg: 'bg-success/10', darkBg: 'dark:bg-success/15', darkText: 'dark:text-success', dot: 'bg-success' },
  { key: 'cancelled', label: 'ملغية', color: 'text-error', bg: 'bg-error/10', darkBg: 'dark:bg-error/15', darkText: 'dark:text-error', dot: 'bg-error' },
  { key: 'converted', label: 'محولة', color: 'text-info', bg: 'bg-info/10', darkBg: 'dark:bg-info/15', darkText: 'dark:text-info', dot: 'bg-info' },
];

const TrialSessionsSkeleton = () => (
  <div className="bg-background min-h-screen pb-24" dir="rtl">
    <div className="px-3 max-w-page mx-auto">
      {/* Header skeleton */}
      <div className="pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <div>
              <Skeleton className="h-5 w-36 mb-1 rounded-lg" />
              <Skeleton className="h-3 w-48 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>
      </div>
      {/* KPI skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-3.5">
            <div className="flex items-center gap-1.5 mb-2">
              <Skeleton className="w-7 h-7 rounded-lg" />
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
            <Skeleton className="h-7 w-14 mb-1 rounded-lg" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
        ))}
      </div>
      {/* Toolbar skeleton */}
      <div className="bg-card rounded-2xl border border-border p-4 lg:p-5 mb-4">
        <Skeleton className="h-11 w-full rounded-xl mb-3" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 rounded-lg shrink-0" style={{ width: `${60 + Math.random() * 30}px` }} />
          ))}
        </div>
      </div>
      {/* Cards skeleton */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-2xl p-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-11 h-11 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-3 w-16 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="space-y-1">
                <Skeleton className="h-2.5 w-12 rounded-md" />
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3 flex gap-2">
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton key={j} className="h-8 rounded-xl" style={{ width: `${70 + Math.random() * 20}px` }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const TrialSessions = () => {
  const academyName = useAcademyName();
  useEffect(() => { document.title = `جلسات المراجعة | ${academyName}`; }, [academyName]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drawerSession, setDrawerSession] = useState<TrialSession | null>(null);
  const [showPaid, setShowPaid] = useState(false);
  const [paidIds, setPaidIds] = useState<string[]>(() => getPaidIds());
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState({ studentName: '', parentPhone: '', subject: '', teacherId: '', teacherName: '', date: '', time: '', notes: '' });
  const queryClient = useQueryClient();
  const showNotification = useUIStore((s) => s.showNotification);

  const { data: trials = [], isLoading, isError: isTrialsError } = useQuery({
    queryKey: ['trial-sessions'],
    queryFn: () => api.get<TrialSession[]>('/trial-sessions'),
    refetchInterval: 30000,
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
    const socket = socketService.connect();
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

  const handleCall = (phone: string) => { window.open(`tel:${phone}`); };

  const handleWhatsApp = (phone: string) => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleaned}`, '_blank');
  };

  const handlePaid = (id: string) => {
    const next = [...paidIds, id];
    localStorage.setItem(PAID_STORAGE_KEY, JSON.stringify(next));
    setPaidIds(next);
    queryClient.invalidateQueries({ queryKey: ['trial-sessions'] });
    showNotification('تم تحديد كمدفوع', 'success');
  };

  const subjects = [...new Set(trials.map((t: TrialSession) => t.subject).filter(Boolean))] as string[];

  const filtered = useMemo(() => trials.filter((t: TrialSession) => {
    const isPaid = paidIds.includes(t.id);
    const matchPaidFilter = showPaid ? isPaid : !isPaid;
    const matchSearch = !search || t.studentName.toLowerCase().includes(search.toLowerCase()) || t.parentPhone.includes(search);
    const matchStatus = !filterStatus || t.status === filterStatus;
    const matchSubject = !filterSubject || t.subject === filterSubject;
    return matchPaidFilter && matchSearch && matchStatus && matchSubject;
  }), [trials, paidIds, showPaid, search, filterStatus, filterSubject]);

  const groups = useMemo(() => {
    const g = new Map<string, TrialSession[]>();
    for (const t of filtered) {
      const key = t.parentPhone || t.id;
      const arr = g.get(key) || [];
      arr.push(t);
      g.set(key, arr);
    }
    return g;
  }, [filtered]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedFiltered = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const paginatedGroups = useMemo(() => {
    const g = new Map<string, TrialSession[]>();
    for (const t of paginatedFiltered) {
      const key = t.parentPhone || t.id;
      const arr = g.get(key) || [];
      arr.push(t);
      g.set(key, arr);
    }
    return g;
  }, [paginatedFiltered]);

  useEffect(() => { setCurrentPage(1); }, [search, filterStatus, filterSubject, showPaid]);

  const conversionRate = stats?.total ? Math.round(((stats.completed + (stats.converted || 0)) / stats.total) * 100) : 0;

  if (isLoading) return <TrialSessionsSkeleton />;

  if (isTrialsError) {
    return (
      <div className="bg-background min-h-screen pb-24" dir="rtl">
        <div className="pt-6 md:pt-10 px-4 md:px-6 max-w-page mx-auto">
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
      <div className="px-4 md:px-6 max-w-page mx-auto relative z-10">

        {/* ===== HEADER ===== */}
        <motion.div variants={itemVariants} className="pt-4 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center">
                <BookOpen size={16} className="text-primary" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-black text-main font-outfit">جلسات المراجعة</h1>
                <p className="text-[11px] text-muted">{stats?.total || 0} حصة مسجلة في النظام</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setEditingId(null); resetForm(); setShowModal(true); }}
                className="inline-flex items-center gap-1.5 h-9 px-4 bg-primary text-on-primary text-[11px] font-bold rounded-xl transition-all duration-200 hover:bg-primary-hover active:scale-95 shadow-sm shadow-primary/10"
              >
                <Plus size={13} /> جدولة جديدة
              </button>
              <button className="inline-flex items-center gap-1.5 h-9 px-4 bg-surface text-muted text-[11px] font-bold rounded-xl border border-border transition-all duration-200 hover:border-primary/20 hover:text-main">
                <Download size={13} /> تحميل التقرير
              </button>
            </div>
          </div>
        </motion.div>

        {/* ===== KPI STATS ===== */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'معدل التحويل', value: `${conversionRate}%`, sub: `${stats?.converted || 0} تحويل`, icon: TrendingUp, color: 'text-primary', iconBg: 'bg-primary-soft' },
            { label: 'قيد الانتظار', value: stats?.pending || 0, sub: 'بانتظار الموعد', icon: Clock, color: 'text-warning', iconBg: 'bg-warning/10' },
            { label: 'تمت بنجاح', value: stats?.completed || 0, sub: 'حصة ناجحة', icon: CheckCircle2, color: 'text-success', iconBg: 'bg-success/10' },
            { label: 'إجمالي الحصص', value: stats?.total || 0, sub: 'جميع الحصص', icon: BookOpen, color: 'text-primary', iconBg: 'bg-primary-soft' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
              className="bg-card border border-border rounded-2xl p-3.5 hover:shadow-elevation-1 transition-all duration-300">
              <div className="flex items-center gap-1.5 mb-2">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", stat.iconBg)}>
                  <stat.icon size={12} className={stat.color} />
                </div>
                <span className="text-[10px] text-muted font-medium truncate">{stat.label}</span>
              </div>
              <div className={cn("text-xl font-black tabular-nums font-outfit", stat.color)}>
                {typeof stat.value === 'number' ? <Counter value={stat.value} /> : stat.value}
              </div>
              <div className="text-[10px] text-muted mt-1 font-medium">{stat.sub}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* ===== MAIN CONTENT ===== */}
        <motion.div variants={itemVariants} className="bg-card rounded-2xl shadow-elevation-1 dark:shadow-none border border-border overflow-hidden">
          {/* Toolbar: search + filters */}
          <div className="p-4 lg:p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="بحث باسم الطالب أو رقم الهاتف..."
                  aria-label="بحث عن حصة"
                  className="w-full h-11 bg-surface border border-border rounded-xl pr-10 pl-10 text-[13px] text-main placeholder:text-muted outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10 transition-all duration-200"
                />
                {search && (
                  <button aria-label="مسح البحث" onClick={() => setSearch('')} className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-muted hover:text-main rounded-lg transition-all">
                    <X size={13} />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowPaid(!showPaid)}
                className={cn(
                  'h-9 px-3 flex items-center justify-center gap-1.5 text-[11px] font-bold rounded-xl border shrink-0 transition-all duration-200',
                  showPaid
                    ? 'bg-success/10 text-success border-success/20'
                    : 'bg-surface text-muted border-border hover:border-primary/20 hover:text-main'
                )}
                aria-label={showPaid ? 'إظهار غير المدفوعة' : 'إظهار المدفوعة'}
              >
                {showPaid ? <Eye size={13} /> : <EyeOff size={13} />}
                <span className="hidden sm:inline">المدفوعة</span>
              </button>
              <div className="shrink-0 bg-surface border border-border rounded-xl px-3 py-2.5">
                <span className="text-[13px] font-bold text-main tabular-nums">{filtered.length}</span>
              </div>
            </div>

            {/* Status filter pills */}
            <div className="flex items-center gap-2 mt-3 overflow-x-auto scrollbar-none">
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setFilterStatus('')}
                className={cn(
                  'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all duration-200 shrink-0',
                  !filterStatus
                    ? 'bg-primary text-on-primary border-primary shadow-sm shadow-primary/10'
                    : 'bg-surface text-muted border-border hover:border-primary/20 hover:text-main'
                )}>
                الكل
                <span className={cn(
                  'text-[9px] px-1.5 py-0.5 rounded-md min-w-[16px] text-center font-bold',
                  !filterStatus ? 'bg-white/20' : 'bg-card text-muted border border-border'
                )}>{trials.length}</span>
              </motion.button>
              {statusFilters.map((sf) => {
                const isActive = filterStatus === sf.key;
                const count = trials.filter((t: TrialSession) => t.status === sf.key).length;
                return (
                  <motion.button key={sf.key} whileTap={{ scale: 0.95 }} onClick={() => setFilterStatus(isActive ? '' : sf.key)}
                    className={cn(
                      'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all duration-200 shrink-0',
                      isActive
                        ? `${sf.bg} ${sf.color} ${sf.darkBg} ${sf.darkText} border-current/15 shadow-sm shadow-current/5`
                        : `${sf.bg} ${sf.color} ${sf.darkBg} ${sf.darkText} border-transparent opacity-60 hover:opacity-100`
                    )}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', sf.dot)} />
                    {sf.label}
                    <span className={cn(
                      'text-[9px] px-1.5 py-0.5 rounded-md min-w-[16px] text-center font-bold',
                      isActive ? 'bg-white/50 dark:bg-white/10 border border-current/10' : 'bg-white/30 dark:bg-white/5 border border-current/10'
                    )}>{count}</span>
                  </motion.button>
                );
              })}
              {filterStatus && (
                <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} whileTap={{ scale: 0.9 }} onClick={() => setFilterStatus('')}
                  className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-error/10 text-error hover:bg-error/20 transition-all">
                  <X size={13} />
                </motion.button>
              )}
            </div>

            {/* Subject filter */}
            {subjects.length > 0 && (
              <div className="flex items-center gap-1.5 mt-3 overflow-x-auto scrollbar-none">
                <CalendarDays size={12} className="text-muted shrink-0" />
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setFilterSubject('')}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all duration-200 shrink-0',
                    !filterSubject
                      ? 'bg-primary text-on-primary border-primary shadow-sm shadow-primary/10'
                      : 'bg-surface text-muted border-border hover:border-primary/20 hover:text-main'
                  )}>
                  كل المواد
                </motion.button>
                {subjects.map(subj => {
                  const isActive = filterSubject === subj;
                  return (
                    <motion.button key={subj} whileTap={{ scale: 0.95 }} onClick={() => setFilterSubject(isActive ? '' : subj)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all duration-200 shrink-0',
                        isActive
                          ? 'bg-primary text-on-primary border-primary shadow-sm shadow-primary/10'
                          : 'bg-surface text-muted border-border hover:border-primary/20 hover:text-main'
                      )}>
                      {subj}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cards List / Inline Modal / Inline Drawer */}
          <div className="p-2.5 sm:p-4">
            {showModal ? (
              <TrialSessionFormModal
                editingId={editingId}
                form={form}
                teachers={teachers}
                isSaving={addMutation.isPending}
                onChange={setForm}
                onSubmit={(e) => { e.preventDefault(); addMutation.mutate(form); }}
                onClose={() => { setShowModal(false); setEditingId(null); resetForm(); }}
              />
            ) : drawerSession ? (
              <TrialSessionDrawer
                session={drawerSession}
                onClose={() => setDrawerSession(null)}
                onCall={handleCall}
                onWhatsApp={handleWhatsApp}
                onConvert={(id) => { convertMutation.mutate(id); setDrawerSession(null); }}
                onEdit={(s) => { setDrawerSession(null); openEdit(s); }}
                onPaid={handlePaid}
                isConverting={convertMutation.isPending}
              />
            ) : filtered.length === 0 ? (
              <div className="text-center py-14">
                <div className="w-16 h-16 rounded-2xl bg-primary-soft flex items-center justify-center mx-auto mb-4">
                  <Users size={28} className="text-primary/40" />
                </div>
                <p className="text-sm font-bold text-main mb-1">
                  {search || filterStatus || filterSubject ? 'لا توجد نتائج للبحث' : showPaid ? 'لا توجد حصص مدفوعة' : 'لا توجد حصص تجريبية'}
                </p>
                <p className="text-[11px] text-muted mb-4">
                  {search || filterStatus || filterSubject ? 'حاول تغيير معايير البحث' : showPaid ? 'لم تتم دفع أي حصة بعد' : 'ابدأ بإضافة أول حصة تجريبية'}
                </p>
                {!search && !filterStatus && !filterSubject && !showPaid && (
                  <button onClick={() => { resetForm(); setShowModal(true); }} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold rounded-xl transition-all active:scale-[0.98]">
                    <Plus size={14} /> إضافة حصة
                  </button>
                )}
              </div>
            ) : (
              <motion.div variants={containerVariants} className="space-y-3">
                {Array.from(paginatedGroups.entries()).map(([phone, sessions]) => (
                  <motion.div key={phone} variants={itemVariants}>
                    {sessions.length > 1 && (
                      <div className="flex items-center gap-2 px-3 py-1.5 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="text-[11px] font-bold text-primary" dir="ltr">{phone}</span>
                        <span className="text-[10px] text-muted">({sessions.length} حصص)</span>
                      </div>
                    )}
                    <div className="space-y-3">
                      {sessions.map((t) => (
                        <TrialSessionCard
                          key={t.id}
                          session={t}
                          onConvert={(id) => convertMutation.mutate(id)}
                          onEdit={openEdit}
                          onDelete={(id) => setConfirmId(id)}
                          onCall={handleCall}
                          onWhatsApp={handleWhatsApp}
                          onCardClick={() => setDrawerSession(t)}
                          onPaid={handlePaid}
                          isPaid={paidIds.includes(t.id)}
                          isConverting={convertMutation.isPending}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && filtered.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-border">
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface border border-border text-muted hover:bg-hover transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="الصفحة التالية"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      'w-9 h-9 flex items-center justify-center rounded-xl text-[12px] font-bold transition-all',
                      page === currentPage
                        ? 'bg-primary text-on-primary shadow-sm shadow-primary/10'
                        : 'bg-surface border border-border text-muted hover:bg-hover'
                    )}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface border border-border text-muted hover:bg-hover transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="الصفحة السابقة"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* FAB Button */}
        <motion.button
          onClick={() => { setEditingId(null); resetForm(); setShowModal(true); }}
          className="hidden md:flex fixed bottom-8 left-8 z-40 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-lg shadow-primary/20 items-center justify-center active:scale-95 transition-all duration-200 hover:bg-primary-hover"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          aria-label="إضافة حصة جديدة"
        >
          <Plus size={22} />
        </motion.button>

        {/* Confirm Delete */}
        <AnimatePresence>
          {confirmId && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-0 md:p-4" dir="rtl">
              {/* Mobile: bottom sheet */}
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="md:hidden w-full bg-card rounded-t-3xl overflow-hidden">
                <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-border rounded-full" /></div>
                <div className="bg-error px-5 py-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/15">
                    <AlertTriangle size={20} className="text-on-error" />
                  </div>
                  <h3 className="text-sm font-bold text-on-error">تأكيد الحذف</h3>
                </div>
                <div className="p-5">
                  <p className="text-sm font-bold text-main">هل أنت متأكد من حذف هذه الحصة؟</p>
                  <p className="text-[11px] text-muted mt-1">لا يمكن التراجع عن هذا الإجراء</p>
                </div>
                <div className="flex gap-2 px-5 pb-8">
                  <button type="button" onClick={() => setConfirmId(null)} className="flex-1 py-3 text-xs font-bold text-muted bg-surface hover:bg-hover rounded-xl transition-all active:scale-[0.98]">إلغاء</button>
                  <button type="button" onClick={() => { if (confirmId) deleteMutation.mutate(confirmId); }} disabled={deleteMutation.isPending} className="flex-1 py-3 text-xs font-bold text-on-error bg-error hover:bg-error-hover rounded-xl transition-all active:scale-[0.98] disabled:opacity-50">{deleteMutation.isPending ? 'جاري الحذف...' : 'حذف'}</button>
                </div>
              </motion.div>
              {/* Desktop: centered modal */}
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="hidden md:block bg-card shadow-2xl w-full max-w-sm border border-border rounded-2xl overflow-hidden">
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
