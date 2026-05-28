import React, { useState } from 'react';
import {
  Search, Plus, X, Phone, Clock, Trash, AlertTriangle, ArrowLeftRight, GraduationCap, Calendar, BookOpen
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { PageContainer } from '../components/layout/PageContainer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

const StatCard = ({ title, value, color, icon: Icon }: { title: string; value: string | number; color: string; icon: React.ComponentType<{ size?: number }> }) => (
  <div className="flex items-center gap-3 shadow-sm p-4 transition-all hover:shadow-md rounded-none dark:brightness-[0.65]" style={{ backgroundColor: color }}>
    <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }}>
      <Icon size={20} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-white/70 leading-none">{title}</p>
      <p className="text-xl font-black text-white tabular-nums mt-1">{value}</p>
    </div>
  </div>
);

export const TrialSessions = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ studentName: '', parentPhone: '', subject: '', teacherName: '', date: '', time: '', notes: '' });
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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trial-sessions'] }); queryClient.invalidateQueries({ queryKey: ['trial-sessions-stats'] }); setShowModal(false); setEditingId(null); resetForm(); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/trial-sessions/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trial-sessions'] }); queryClient.invalidateQueries({ queryKey: ['trial-sessions-stats'] }); setConfirmId(null); }
  });

  const convertMutation = useMutation({
    mutationFn: (id: string) => api.post(`/trial-sessions/${id}/convert`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trial-sessions'] }); queryClient.invalidateQueries({ queryKey: ['trial-sessions-stats'] }); queryClient.invalidateQueries({ queryKey: ['students'] }); }
  });

  const resetForm = () => setForm({ studentName: '', parentPhone: '', subject: '', teacherName: '', date: '', time: '', notes: '' });

  const openEdit = (t: TrialSession) => {
    setForm({ studentName: t.studentName, parentPhone: t.parentPhone, subject: t.subject || '', teacherName: t.teacherName || '', date: t.date, time: t.time || '', notes: t.notes || '' });
    setEditingId(t.id); setShowModal(true);
  };

  const filtered = trials.filter((t: TrialSession) => {
    const matchSearch = !search || t.studentName.toLowerCase().includes(search.toLowerCase()) || t.parentPhone.includes(search);
    const matchStatus = !filterStatus || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <PageContainer title="جلسات المراجعة" subtitle="تسجيل ومتابعة جلسات الطلاب الغير مقيدين" icon={BookOpen}>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard title="الإجمالي" value={stats?.total || 0} color="#2563EB" icon={BookOpen} />
        <StatCard title="تمت" value={stats?.completed || 0} color="#22C55E" icon={Calendar} />
        <StatCard title="قيد الانتظار" value={stats?.pending || 0} color="#F59E0B" icon={Clock} />
        <StatCard title="ملغية" value={stats?.cancelled || 0} color="#F43F5E" icon={X} />
      </div>

      {/* Search & Filters */}
      <div className="shadow-sm mb-6 p-3 rounded-none" style={{ backgroundColor: '#2563EB' }}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث باسم الطالب أو رقم ولي الأمر..." className="w-full pr-9 pl-3 py-2 bg-white/15 border border-white/20 text-[11px] font-bold text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 rounded-none" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 bg-white/15 border border-white/20 text-[11px] font-bold text-white focus:outline-none focus:border-white/40 rounded-none">
            <option value="">جميع الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="completed">تمت</option>
            <option value="cancelled">ملغية</option>
            <option value="converted">تم التسجيل</option>
          </select>
          <button onClick={() => { setEditingId(null); resetForm(); setShowModal(true); }} className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-[#2563EB] text-[11px] font-bold transition-all shadow-sm active:scale-95 rounded-none">
            <Plus size={14} /> جلسة مراجعة
          </button>
        </div>
      </div>

      {/* List */}
      {isLoading ? <div className="text-center py-16 bg-white dark:bg-slate-900 shadow-sm border border-slate-100/50 dark:border-slate-800/50 rounded-none"><Clock size={32} className="mx-auto mb-3 text-slate-200 dark:text-slate-700" /><p className="text-xs font-bold text-slate-400">جاري التحميل...</p></div> :
      filtered.length === 0 ? <div className="text-center py-16 bg-white dark:bg-slate-900 shadow-sm border border-slate-100/50 dark:border-slate-800/50 rounded-none"><BookOpen size={32} className="mx-auto mb-3 text-slate-200 dark:text-slate-700" /><p className="text-xs font-bold text-slate-400">لا توجد جلسات مراجعة</p></div> :
      <div className="space-y-3">
        {filtered.map((t: TrialSession) => (
          <div key={t.id} className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 rounded-none p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white truncate">{t.studentName}</h3>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-none", statusBg[t.status] || statusBg.pending)} style={{ backgroundColor: t.status === 'completed' ? '#22C55E12' : t.status === 'pending' ? '#F59E0B12' : t.status === 'cancelled' ? '#F43F5E12' : t.status === 'converted' ? '#2563EB12' : '#F59E0B12' }}>{statusLabels[t.status]}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                  <span className="flex items-center gap-1"><div className="w-4 h-4 rounded flex items-center justify-center" style={{ backgroundColor: '#2563EB12' }}><Phone size={9} style={{ color: '#2563EB' }} /></div>{t.parentPhone}</span>
                  {t.subject && <span className="flex items-center gap-1"><div className="w-4 h-4 rounded flex items-center justify-center" style={{ backgroundColor: '#8B5CF612' }}><BookOpen size={9} style={{ color: '#8B5CF6' }} /></div>{t.subject}</span>}
                  {t.teacherName && <span className="flex items-center gap-1"><div className="w-4 h-4 rounded flex items-center justify-center" style={{ backgroundColor: '#F59E0B12' }}><GraduationCap size={9} style={{ color: '#F59E0B' }} /></div>{t.teacherName}</span>}
                  <span className="flex items-center gap-1"><div className="w-4 h-4 rounded flex items-center justify-center" style={{ backgroundColor: '#22C55E12' }}><Calendar size={9} style={{ color: '#22C55E' }} /></div>{t.date}</span>
                  {t.time && <span className="flex items-center gap-1"><div className="w-4 h-4 rounded flex items-center justify-center" style={{ backgroundColor: '#38BDF812' }}><Clock size={9} style={{ color: '#38BDF8' }} /></div>{t.time}</span>}
                </div>
                {t.notes && <p className="text-[11px] font-bold text-slate-400 mt-1">{t.notes}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {t.status === 'pending' && (
                  <button onClick={() => convertMutation.mutate(t.id)} className="p-2 rounded-none bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all" title="تحويل لطالب مقيد"><ArrowLeftRight size={14} /></button>
                )}
                <button onClick={() => openEdit(t)} className="p-2 rounded-none bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"><X size={14} className="rotate-45" /></button>
                <button onClick={() => setConfirmId(t.id)} className="p-2 rounded-none bg-rose-50 dark:bg-rose-900/20 text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all"><Trash size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>}

      {/* Add/Edit Modal */}
      {showModal && <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50  p-4" dir="rtl">
        <div className="bg-white dark:bg-slate-900 shadow-sm w-full max-w-lg border border-slate-100/50 dark:border-slate-800/50 max-h-[90vh] overflow-y-auto rounded-none">
          <div className="bg-[#172554] px-5 py-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">{editingId ? 'تعديل جلسة مراجعة' : 'إضافة جلسة مراجعة'}</h3>
            <button onClick={() => { setShowModal(false); setEditingId(null); resetForm(); }} className="text-white/70 hover:text-white rounded-none"><X size={18} /></button>
          </div>
          <form onSubmit={e => { e.preventDefault(); addMutation.mutate(form); }} className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">اسم الطالب</label><input required value={form.studentName} onChange={e => setForm({ ...form, studentName: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30" /></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">رقم ولي الأمر</label><input required value={form.parentPhone} onChange={e => setForm({ ...form, parentPhone: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30" /></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">المادة</label><input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30" /></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">المعلمة</label><select value={form.teacherName} onChange={e => setForm({ ...form, teacherName: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                <option value="">اختر معلمة</option>
                {(Array.isArray(teachers) ? teachers : []).map((t: { id: string; name: string }) => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">التاريخ</label><input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30" /></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">الوقت</label><input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30" /></div>
            </div>
            <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">ملاحظات</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30" /></div>
            <button type="submit" className="w-full py-3 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 rounded-none">{editingId ? 'تحديث' : 'إضافة جلسة مراجعة'}</button>
          </form>
        </div>
      </div>}

      {/* Confirm Delete */}
      {confirmId && <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50  p-4" dir="rtl">
        <div className="bg-white dark:bg-slate-900 shadow-sm w-full max-w-sm border border-slate-100/50 dark:border-slate-800/50 rounded-none">
          <div className="bg-[#172554] px-5 py-4 flex items-center gap-3"><div className="w-9 h-9 flex items-center justify-center rounded-none" style={{ backgroundColor: '#F43F5E12' }}><AlertTriangle size={20} style={{ color: '#F43F5E' }} /></div><h3 className="text-sm font-bold text-white">حذف جلسة المراجعة</h3></div>
          <div className="p-6"><p className="text-sm font-bold text-slate-700 dark:text-slate-300">هل أنت متأكد من الحذف؟</p></div>
          <div className="flex border-t border-slate-100 dark:border-slate-800">
            <button onClick={() => setConfirmId(null)} className="flex-1 py-3 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">إلغاء</button>
            <button onClick={() => { if (confirmId) deleteMutation.mutate(confirmId); }} className="flex-1 py-3 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 border-r border-slate-100 dark:border-slate-800">حذف</button>
          </div>
        </div>
      </div>}
    </PageContainer>
  );
};
