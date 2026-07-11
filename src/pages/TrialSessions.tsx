import React, { useState, useEffect } from 'react';
import {
  Search, Plus, X, Phone, Clock, Trash, AlertTriangle, ArrowLeftRight, GraduationCap, Calendar, BookOpen, CheckCircle2, Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { socketService } from '../lib/socket';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageLoader } from '../components/ui/PageLoader';

interface TrialSession {
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

const statusTextColor: Record<string, string> = {
  pending: 'text-warning',
  completed: 'text-success',
  cancelled: 'text-error',
  converted: 'text-info',
};

const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  completed: 'تم',
  cancelled: 'ملغي',
  converted: 'تم التحويل'
};

export const TrialSessions = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ studentName: '', parentPhone: '', subject: '', teacherId: '', teacherName: '', date: '', time: '', notes: '' });
  const queryClient = useQueryClient();

  const { data: trials = [], isLoading } = useQuery({
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
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['trial-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['trial-sessions-stats'] });
    };
    socket.on('trial_session_updated', handleUpdate);
    return () => { socket.off('trial_session_updated', handleUpdate); };
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-surface dark:bg-background min-h-screen pb-24"
      dir="rtl"
    >
      <div className="pt-6 md:pt-10 px-4 md:px-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-primary shadow-soft rounded-card px-5 md:px-7 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-card flex items-center justify-center bg-primary-soft">
              <BookOpen size={22} className="text-primary" />
            </div>
            <div>
              <h1 className="text-card-title font-bold font-heading text-on-primary leading-tight">الحصص التجريبية</h1>
              <p className="text-xs text-on-primary/70 mt-0.5">إدارة الحصص التجريبية للطلاب الجدد</p>
            </div>
          </div>
          <button onClick={() => { setEditingId(null); resetForm(); setShowModal(true); }} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/15 text-on-primary border border-white/20 text-xs font-bold rounded-xl hover:bg-white/25 transition-all active:scale-95">
            <Plus size={14} /> إضافة حصة
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { title: 'الإجمالي', value: stats?.total || 0, icon: BookOpen, iconBg: 'bg-primary-soft', iconColor: 'text-primary' },
            { title: 'تم', value: stats?.completed || 0, icon: CheckCircle2, iconBg: 'bg-success-soft', iconColor: 'text-success' },
            { title: 'قيد الانتظار', value: stats?.pending || 0, icon: Clock, iconBg: 'bg-warning-soft', iconColor: 'text-warning' },
            { title: 'ملغي', value: stats?.cancelled || 0, icon: X, iconBg: 'bg-error-soft', iconColor: 'text-error' },
          ].map(s => (
            <div key={s.title} className="flex items-center gap-3 p-4 rounded-card shadow-soft bg-card border border-border/50">
              <div className={cn('w-11 h-11 rounded-card flex items-center justify-center shrink-0', s.iconBg)}>
                <s.icon size={20} className={s.iconColor} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted leading-none">{s.title}</p>
                <p className="text-card-title font-bold text-main tabular-nums mt-1">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="bg-card border border-border/50 shadow-soft rounded-card p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث باسم الطالب أو رقم الهاتف..." aria-label="بحث عن حصة" className="w-full ps-9 pe-3 py-2.5 bg-card border border-border/60 rounded-xl text-xs text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} aria-label="تصفية حسب الحالة" className="px-3 py-2.5 bg-card border border-border/60 rounded-xl text-xs text-main focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all">
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
          <div className="text-center py-16 bg-card border border-border/50 shadow-soft rounded-card">
            <div className="w-16 h-16 rounded-card bg-primary-soft flex items-center justify-center mx-auto mb-4">
              <BookOpen size={28} className="text-primary" />
            </div>
            <p className="text-sm font-bold text-muted">لا توجد حصص تجريبية</p>
            <p className="text-xs text-dim mt-1.5">ستظهر هنا الحصص التجريبية المسجلة</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((t: TrialSession) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border/50 shadow-soft rounded-card overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-card flex items-center justify-center font-bold text-xs shrink-0 bg-primary-soft text-primary">
                      {t.studentName?.charAt(0) || 'ط'}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-main leading-tight">{t.studentName}</h3>
                      <span className={cn("text-xs", statusTextColor[t.status] || statusTextColor.pending)}>{statusLabels[t.status]}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {t.status === 'pending' && (
                      <button onClick={() => convertMutation.mutate(t.id)} disabled={convertMutation.isPending} className="w-7 h-7 flex items-center justify-center bg-info/10 text-info hover:bg-info/20 transition-all rounded-xl disabled:opacity-40 disabled:cursor-not-allowed" title="تحويل إلى طالب" aria-label="تحويل إلى طالب"><ArrowLeftRight size={13} /></button>
                    )}
                    <button onClick={() => openEdit(t)} className="w-7 h-7 flex items-center justify-center bg-hover text-dim hover:bg-border/40 transition-all rounded-xl" aria-label="تعديل"><X size={13} className="rotate-45" /></button>
                    <button onClick={() => setConfirmId(t.id)} className="w-7 h-7 flex items-center justify-center bg-error/10 text-error hover:bg-error/20 transition-all rounded-xl" aria-label="حذف"><Trash size={13} /></button>
                  </div>
                </div>
                <div className="px-4 py-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                      <Phone size={11} className="text-primary shrink-0" />
                      <span className="truncate">{t.parentPhone}</span>
                    </div>
                    {t.subject && (
                      <div className="flex items-center gap-1.5 text-xs text-muted">
                        <BookOpen size={11} className="text-primary shrink-0" />
                        <span className="truncate">{t.subject}</span>
                      </div>
                    )}
                    {t.teacherName && (
                      <div className="flex items-center gap-1.5 text-xs text-muted">
                        <GraduationCap size={11} className="text-warning shrink-0" />
                        <span className="truncate">{t.teacherName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                      <Calendar size={11} className="text-success shrink-0" />
                      <span>{t.date}</span>
                    </div>
                    {t.time && (
                      <div className="flex items-center gap-1.5 text-xs text-muted">
                        <Clock size={11} className="text-info shrink-0" />
                        <span>{t.time}</span>
                      </div>
                    )}
                  </div>
                  {t.notes && (
                    <div className="mt-3 bg-warning-soft border border-warning/20 px-3 py-2 rounded-xl">
                      <span className="text-xs font-bold text-warning me-1.5">ملاحظات</span>
                      <span className="text-xs text-muted">{t.notes}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" dir="rtl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card shadow-soft w-full max-w-lg border border-border/50 rounded-card overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="bg-primary px-5 py-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-on-primary">{editingId ? 'تعديل الحصة' : 'إضافة حصة جديدة'}</h3>
                <button onClick={() => { setShowModal(false); setEditingId(null); resetForm(); }} className="w-7 h-7 flex items-center justify-center bg-white/10 hover:bg-white/20 text-on-primary rounded-xl transition-all" aria-label="إغلاق"><X size={16} /></button>
              </div>
              <form onSubmit={e => { e.preventDefault(); addMutation.mutate(form); }} className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="text-xs text-muted mb-1 block">اسم الطالب</label><input required value={form.studentName} onChange={e => setForm({ ...form, studentName: e.target.value })} className="w-full px-3 py-2.5 bg-card border border-border/60 rounded-xl text-xs text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all" /></div>
                  <div><label className="text-xs text-muted mb-1 block">رقم ولي الأمر</label><input required value={form.parentPhone} onChange={e => setForm({ ...form, parentPhone: e.target.value })} className="w-full px-3 py-2.5 bg-card border border-border/60 rounded-xl text-xs text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all" /></div>
                  <div><label className="text-xs text-muted mb-1 block">المادة</label><input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full px-3 py-2.5 bg-card border border-border/60 rounded-xl text-xs text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all" /></div>
                  <div><label className="text-xs text-muted mb-1 block">المعلمة</label>
                    <select value={form.teacherName} onChange={e => {
                      const t = (Array.isArray(teachers) ? teachers : []).find((t: { id: string; name: string }) => t.name === e.target.value);
                      setForm({ ...form, teacherName: e.target.value, teacherId: t?.id || '' });
                    }} className="w-full px-3 py-2.5 bg-card border border-border/60 rounded-xl text-xs text-main focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all appearance-none">
                      <option value="">اختر معلمة</option>
                      {(Array.isArray(teachers) ? teachers : []).map((t: { id: string; name: string }) => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div><label className="text-xs text-muted mb-1 block">التاريخ</label><input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2.5 bg-card border border-border/60 rounded-xl text-xs text-main focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all" /></div>
                  <div><label className="text-xs text-muted mb-1 block">الوقت</label><input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="w-full px-3 py-2.5 bg-card border border-border/60 rounded-xl text-xs text-main focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all" /></div>
                </div>
                <div><label className="text-xs text-muted mb-1 block">ملاحظات</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2.5 bg-card border border-border/60 rounded-xl text-xs text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all" /></div>
                <button type="submit" disabled={addMutation.isPending} className="w-full py-3 bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">{addMutation.isPending ? 'جاري الحفظ...' : editingId ? 'تحديث' : 'إتمام الإضافة'}</button>
              </form>
            </motion.div>
          </motion.div>
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
