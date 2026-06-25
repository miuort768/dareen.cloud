import React, { useState, useMemo, useEffect } from 'react';
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

const statusBg: Record<string, string> = {
  pending: 'text-amber-700 dark:text-amber-400',
  completed: 'text-emerald-700 dark:text-emerald-400',
  cancelled: 'text-rose-700 dark:text-rose-400',
  converted: 'text-blue-700 dark:text-blue-400',
};

const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  completed: 'تمت',
  cancelled: 'ملغية',
  converted: 'تم التسجيل'
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
    onError: (err: Error) => alert('حدث خطأ أثناء حفظ الجلسة: ' + err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/trial-sessions/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trial-sessions'] }); queryClient.invalidateQueries({ queryKey: ['trial-sessions-stats'] }); setConfirmId(null); },
    onError: (err: Error) => alert('حدث خطأ أثناء الحذف: ' + err.message)
  });

  const convertMutation = useMutation({
    mutationFn: (id: string) => api.post(`/trial-sessions/${id}/convert`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trial-sessions'] }); queryClient.invalidateQueries({ queryKey: ['trial-sessions-stats'] }); queryClient.invalidateQueries({ queryKey: ['students'] }); },
    onError: (err: Error) => alert('حدث خطأ أثناء تحويل الجلسة: ' + err.message)
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
      className="bg-[#F8F7FF] dark:bg-slate-950 min-h-screen pb-24"
      dir="rtl"
    >
      <div className="pt-6 md:pt-10 px-4 md:px-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#6C4BFF] to-[#8B5CF6] rounded-2xl px-5 md:px-7 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-purple-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm bg-white/15 backdrop-blur-sm border border-white/10">
              <BookOpen size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">جلسات المراجعة</h1>
              <p className="text-[10px] font-bold text-white/70 mt-0.5">تسجيل ومتابعة جلسات الطلاب غير المقيدين</p>
            </div>
          </div>
          <button onClick={() => { setEditingId(null); resetForm(); setShowModal(true); }} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-[11px] font-bold rounded-xl hover:bg-white/25 transition-all shadow-sm active:scale-95">
            <Plus size={14} /> جلسة مراجعة
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { title: 'الإجمالي', value: stats?.total || 0, icon: BookOpen, gradient: 'from-[#6C4BFF] to-[#8B5CF6]' },
            { title: 'تمت', value: stats?.completed || 0, icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-600' },
            { title: 'قيد الانتظار', value: stats?.pending || 0, icon: Clock, gradient: 'from-amber-500 to-orange-600' },
            { title: 'ملغية', value: stats?.cancelled || 0, icon: X, gradient: 'from-rose-500 to-pink-600' },
          ].map(s => (
            <div key={s.title} className={cn('flex items-center gap-3 p-4 rounded-2xl shadow-sm bg-gradient-to-br', s.gradient)}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-white/15 backdrop-blur-sm border border-white/10">
                <s.icon size={20} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-white/70 leading-none">{s.title}</p>
                <p className="text-xl font-black text-white tabular-nums mt-1">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث باسم الطالب أو رقم ولي الأمر..." className="w-full pr-9 pl-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#6C4BFF] focus:ring-1 focus:ring-[#6C4BFF]/20 transition-all" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-[11px] font-bold text-gray-900 dark:text-white focus:outline-none focus:border-[#6C4BFF] focus:ring-1 focus:ring-[#6C4BFF]/20 transition-all">
              <option value="" className="text-slate-900 dark:text-slate-200">جميع الحالات</option>
              <option value="pending" className="text-slate-900 dark:text-slate-200">قيد الانتظار</option>
              <option value="completed" className="text-slate-900 dark:text-slate-200">تمت</option>
              <option value="cancelled" className="text-slate-900 dark:text-slate-200">ملغية</option>
              <option value="converted" className="text-slate-900 dark:text-slate-200">تم التسجيل</option>
            </select>
          </div>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900/50 border border-dashed border-gray-200 dark:border-slate-800 rounded-2xl">
            <BookOpen size={32} className="mx-auto mb-3 text-gray-300 dark:text-slate-700" />
            <p className="text-xs font-bold text-gray-400 dark:text-slate-500">لا توجد جلسات مراجعة</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((t: TrialSession) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-slate-800/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 bg-[#6C4BFF]/10 text-[#6C4BFF]">
                      {t.studentName?.charAt(0) || 'ط'}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{t.studentName}</h3>
                      <span className={cn("text-[9px] font-bold", statusBg[t.status] || statusBg.pending)}>{statusLabels[t.status]}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {t.status === 'pending' && (
                      <button onClick={() => convertMutation.mutate(t.id)} disabled={convertMutation.isPending} className="w-7 h-7 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all rounded-xl disabled:opacity-40 disabled:cursor-not-allowed" title="تحويل لطالب مقيد"><ArrowLeftRight size={13} /></button>
                    )}
                    <button onClick={() => openEdit(t)} className="w-7 h-7 flex items-center justify-center bg-gray-50 dark:bg-slate-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all rounded-xl" aria-label="تعديل"><X size={13} className="rotate-45" /></button>
                    <button onClick={() => setConfirmId(t.id)} className="w-7 h-7 flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all rounded-xl" aria-label="حذف"><Trash size={13} /></button>
                  </div>
                </div>
                <div className="px-4 py-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 dark:text-slate-400">
                      <Phone size={11} className="text-[#6C4BFF] shrink-0" />
                      <span className="truncate">{t.parentPhone}</span>
                    </div>
                    {t.subject && (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 dark:text-slate-400">
                        <BookOpen size={11} className="text-[#6C4BFF] shrink-0" />
                        <span className="truncate">{t.subject}</span>
                      </div>
                    )}
                    {t.teacherName && (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 dark:text-slate-400">
                        <GraduationCap size={11} className="text-amber-500 shrink-0" />
                        <span className="truncate">{t.teacherName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 dark:text-slate-400">
                      <Calendar size={11} className="text-emerald-500 shrink-0" />
                      <span>{t.date}</span>
                    </div>
                    {t.time && (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 dark:text-slate-400">
                        <Clock size={11} className="text-sky-500 shrink-0" />
                        <span>{t.time}</span>
                      </div>
                    )}
                  </div>
                  {t.notes && (
                    <div className="mt-3 bg-amber-50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/20 px-3 py-1.5 rounded-xl">
                      <span className="text-[8px] font-bold text-amber-600 dark:text-amber-400 tracking-widest ml-1.5">ملاحظات</span>
                      <span className="text-[11px] font-medium text-gray-600 dark:text-slate-400">{t.notes}</span>
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
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 shadow-xl w-full max-w-lg border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-br from-[#6C4BFF] to-[#8B5CF6] px-5 py-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">{editingId ? 'تعديل جلسة مراجعة' : 'إضافة جلسة مراجعة'}</h3>
                <button onClick={() => { setShowModal(false); setEditingId(null); resetForm(); }} className="w-7 h-7 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all" aria-label="إغلاق"><X size={16} /></button>
              </div>
              <form onSubmit={e => { e.preventDefault(); addMutation.mutate(form); }} className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">اسم الطالب</label><input required value={form.studentName} onChange={e => setForm({ ...form, studentName: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-[#6C4BFF] focus:ring-1 focus:ring-[#6C4BFF]/20 transition-all" /></div>
                  <div><label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">رقم ولي الأمر</label><input required value={form.parentPhone} onChange={e => setForm({ ...form, parentPhone: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-[#6C4BFF] focus:ring-1 focus:ring-[#6C4BFF]/20 transition-all" /></div>
                  <div><label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">المادة</label><input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-[#6C4BFF] focus:ring-1 focus:ring-[#6C4BFF]/20 transition-all" /></div>
                  <div><label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">المعلمة</label>
                    <select value={form.teacherName} onChange={e => {
                      const t = (Array.isArray(teachers) ? teachers : []).find((t: { id: string; name: string }) => t.name === e.target.value);
                      setForm({ ...form, teacherName: e.target.value, teacherId: t?.id || '' });
                    }} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-[#6C4BFF] focus:ring-1 focus:ring-[#6C4BFF]/20 transition-all appearance-none">
                      <option value="" className="text-slate-900 dark:text-slate-200">اختر معلمة</option>
                      {(Array.isArray(teachers) ? teachers : []).map((t: { id: string; name: string }) => (
                        <option key={t.id} value={t.name} className="text-slate-900 dark:text-slate-200">{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div><label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">التاريخ</label><input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-[#6C4BFF] focus:ring-1 focus:ring-[#6C4BFF]/20 transition-all" /></div>
                  <div><label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">الوقت</label><input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-[#6C4BFF] focus:ring-1 focus:ring-[#6C4BFF]/20 transition-all" /></div>
                </div>
                <div><label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">ملاحظات</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-[#6C4BFF] focus:ring-1 focus:ring-[#6C4BFF]/20 transition-all" /></div>
                <button type="submit" disabled={addMutation.isPending} className="w-full py-3 bg-gradient-to-l from-[#6C4BFF] to-[#8B5CF6] hover:shadow-lg hover:shadow-purple-500/25 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">{addMutation.isPending ? 'جاري الحفظ...' : editingId ? 'تحديث' : 'إضافة جلسة مراجعة'}</button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Confirm Delete */}
        {confirmId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" dir="rtl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 shadow-xl w-full max-w-sm border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-rose-500 to-rose-600 px-5 py-4 flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/10">
                  <AlertTriangle size={20} className="text-white" />
                </div>
                <h3 className="text-sm font-bold text-white">حذف جلسة المراجعة</h3>
              </div>
              <div className="p-5">
                <p className="text-sm font-bold text-gray-700 dark:text-slate-300">هل أنت متأكد من الحذف؟</p>
              </div>
              <div className="flex gap-2 px-5 pb-5">
                <button onClick={() => setConfirmId(null)} className="flex-1 py-3 text-xs font-bold text-gray-500 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-all active:scale-[0.98]">إلغاء</button>
                <button onClick={() => { if (confirmId) deleteMutation.mutate(confirmId); }} disabled={deleteMutation.isPending} className="flex-1 py-3 text-xs font-bold text-white bg-gradient-to-l from-rose-500 to-rose-600 hover:shadow-lg hover:shadow-rose-500/25 rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50">{deleteMutation.isPending ? 'جاري الحذف...' : 'حذف'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
