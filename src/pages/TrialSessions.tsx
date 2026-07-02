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

const statusTextColor: Record<string, string> = {
  pending: 'text-warning',
  completed: 'text-success',
  cancelled: 'text-error',
  converted: 'text-info',
};

const statusLabels: Record<string, string> = {
  pending: 'ﬁÌœ «·«‰ Ÿ«—',
  completed: ' „ ',
  cancelled: '„·€Ì…',
  converted: ' „ «· ”ÃÌ·'
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
    onError: (err: Error) => alert('ÕœÀ Œÿ√ √À‰«¡ Õ›Ÿ «·Ã·”…: ' + err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/trial-sessions/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trial-sessions'] }); queryClient.invalidateQueries({ queryKey: ['trial-sessions-stats'] }); setConfirmId(null); },
    onError: (err: Error) => alert('ÕœÀ Œÿ√ √À‰«¡ «·Õ–›: ' + err.message)
  });

  const convertMutation = useMutation({
    mutationFn: (id: string) => api.post(`/trial-sessions/${id}/convert`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trial-sessions'] }); queryClient.invalidateQueries({ queryKey: ['trial-sessions-stats'] }); queryClient.invalidateQueries({ queryKey: ['students'] }); },
    onError: (err: Error) => alert('ÕœÀ Œÿ√ √À‰«¡  ÕÊÌ· «·Ã·”…: ' + err.message)
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
      className="bg-main min-h-screen pb-24"
      dir="rtl"
    >
      <div className="pt-6 md:pt-10 px-4 md:px-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-primary-hover)] rounded-2xl px-5 md:px-7 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm bg-white/15 backdrop-blur-sm border border-white/10">
              <BookOpen size={22} className="text-on-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-on-primary leading-tight">Ã·”«  «·„—«Ã⁄…</h1>
              <p className="text-[10px] font-bold text-on-primary opacity-70 mt-0.5"> ”ÃÌ· Ê„ «»⁄… Ã·”«  «·ÿ·«» €Ì— «·„ﬁÌœÌ‰</p>
            </div>
          </div>
          <button onClick={() => { setEditingId(null); resetForm(); setShowModal(true); }} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur-sm border border-white/20 text-on-primary text-[11px] font-bold rounded-xl hover:bg-white/25 transition-all shadow-sm active:scale-95">
            <Plus size={14} /> Ã·”… „—«Ã⁄…
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { title: '«·≈Ã„«·Ì', value: stats?.total || 0, icon: BookOpen, bg: 'bg-primary' },
            { title: ' „ ', value: stats?.completed || 0, icon: CheckCircle2, bg: 'bg-success' },
            { title: 'ﬁÌœ «·«‰ Ÿ«—', value: stats?.pending || 0, icon: Clock, bg: 'bg-warning' },
            { title: '„·€Ì…', value: stats?.cancelled || 0, icon: X, bg: 'bg-error' },
          ].map(s => (
            <div key={s.title} className={cn('flex items-center gap-3 p-4 rounded-2xl shadow-sm', s.bg)}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-white/15 backdrop-blur-sm border border-white/10">
                <s.icon size={20} className="text-on-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-on-primary opacity-70 leading-none">{s.title}</p>
                <p className="text-xl font-black text-on-primary tabular-nums mt-1">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="bg-white/80 dark:bg-primary-active/80 backdrop-blur-xl rounded-2xl shadow-sm border border-border p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="«»ÕÀ »«”„ «·ÿ«·» √Ê —ﬁ„ Ê·Ì «·√„—..." className="w-full pr-9 pl-3 py-2 bg-surface dark:bg-card border border-border rounded-xl text-xs font-bold text-main placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-focus transition-all" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 bg-surface dark:bg-card border border-border rounded-xl text-[11px] font-bold text-main focus:outline-none focus:ring-2 focus:ring-focus transition-all">
              <option value="">Ã„Ì⁄ «·Õ«·« </option>
              <option value="pending">ﬁÌœ «·«‰ Ÿ«—</option>
              <option value="completed"> „ </option>
              <option value="cancelled">„·€Ì…</option>
              <option value="converted"> „ «· ”ÃÌ·</option>
            </select>
          </div>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-card border border-dashed border-border rounded-2xl">
            <BookOpen size={32} className="mx-auto mb-3 text-dim" />
            <p className="text-xs font-bold text-dim">·«  ÊÃœ Ã·”«  „—«Ã⁄…</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((t: TrialSession) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 bg-primary-soft text-primary">
                      {t.studentName?.charAt(0) || 'ÿ'}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-main leading-tight">{t.studentName}</h3>
                      <span className={cn("text-[9px] font-bold", statusTextColor[t.status] || statusTextColor.pending)}>{statusLabels[t.status]}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {t.status === 'pending' && (
                      <button onClick={() => convertMutation.mutate(t.id)} disabled={convertMutation.isPending} className="w-7 h-7 flex items-center justify-center bg-info-soft text-info hover:brightness-90 transition-all rounded-xl disabled:opacity-40 disabled:cursor-not-allowed" title=" ÕÊÌ· ·ÿ«·» „ﬁÌœ"><ArrowLeftRight size={13} /></button>
                    )}
                    <button onClick={() => openEdit(t)} className="w-7 h-7 flex items-center justify-center bg-hover text-dim hover:brightness-90 transition-all rounded-xl" aria-label=" ⁄œÌ·"><X size={13} className="rotate-45" /></button>
                    <button onClick={() => setConfirmId(t.id)} className="w-7 h-7 flex items-center justify-center bg-error-soft text-error hover:brightness-90 transition-all rounded-xl" aria-label="Õ–›"><Trash size={13} /></button>
                  </div>
                </div>
                <div className="px-4 py-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted">
                      <Phone size={11} className="text-primary shrink-0" />
                      <span className="truncate">{t.parentPhone}</span>
                    </div>
                    {t.subject && (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted">
                        <BookOpen size={11} className="text-primary shrink-0" />
                        <span className="truncate">{t.subject}</span>
                      </div>
                    )}
                    {t.teacherName && (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted">
                        <GraduationCap size={11} className="text-warning shrink-0" />
                        <span className="truncate">{t.teacherName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted">
                      <Calendar size={11} className="text-success shrink-0" />
                      <span>{t.date}</span>
                    </div>
                    {t.time && (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted">
                        <Clock size={11} className="text-info shrink-0" />
                        <span>{t.time}</span>
                      </div>
                    )}
                  </div>
                  {t.notes && (
                    <div className="mt-3 bg-warning-soft border border-warning px-3 py-1.5 rounded-xl">
                      <span className="text-[8px] font-bold text-warning-dark tracking-widest ml-1.5">„·«ÕŸ« </span>
                      <span className="text-[11px] font-medium text-main">{t.notes}</span>
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
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card shadow-xl w-full max-w-lg border border-border rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-primary-hover)] px-5 py-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-on-primary">{editingId ? ' ⁄œÌ· Ã·”… „—«Ã⁄…' : '≈÷«›… Ã·”… „—«Ã⁄…'}</h3>
                <button onClick={() => { setShowModal(false); setEditingId(null); resetForm(); }} className="w-7 h-7 flex items-center justify-center bg-white/10 hover:bg-white/20 text-on-primary rounded-xl transition-all" aria-label="≈€·«ﬁ"><X size={16} /></button>
              </div>
              <form onSubmit={e => { e.preventDefault(); addMutation.mutate(form); }} className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1 block">«”„ «·ÿ«·»</label><input required value={form.studentName} onChange={e => setForm({ ...form, studentName: e.target.value })} className="w-full px-3 py-2 bg-surface dark:bg-card border border-border rounded-xl text-xs font-bold text-main placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-focus transition-all" /></div>
                  <div><label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1 block">—ﬁ„ Ê·Ì «·√„—</label><input required value={form.parentPhone} onChange={e => setForm({ ...form, parentPhone: e.target.value })} className="w-full px-3 py-2 bg-surface dark:bg-card border border-border rounded-xl text-xs font-bold text-main placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-focus transition-all" /></div>
                  <div><label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1 block">«·„«œ…</label><input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full px-3 py-2 bg-surface dark:bg-card border border-border rounded-xl text-xs font-bold text-main placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-focus transition-all" /></div>
                  <div><label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1 block">«·„⁄·„…</label>
                    <select value={form.teacherName} onChange={e => {
                      const t = (Array.isArray(teachers) ? teachers : []).find((t: { id: string; name: string }) => t.name === e.target.value);
                      setForm({ ...form, teacherName: e.target.value, teacherId: t?.id || '' });
                    }} className="w-full px-3 py-2 bg-surface dark:bg-card border border-border rounded-xl text-xs font-bold text-main placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-focus transition-all appearance-none">
                      <option value="">«Œ — „⁄·„…</option>
                      {(Array.isArray(teachers) ? teachers : []).map((t: { id: string; name: string }) => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div><label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1 block">«· «—ÌŒ</label><input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 bg-surface dark:bg-card border border-border rounded-xl text-xs font-bold text-main placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-focus transition-all" /></div>
                  <div><label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1 block">«·Êﬁ </label><input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="w-full px-3 py-2 bg-surface dark:bg-card border border-border rounded-xl text-xs font-bold text-main placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-focus transition-all" /></div>
                </div>
                <div><label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1 block">„·«ÕŸ« </label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2 bg-surface dark:bg-card border border-border rounded-xl text-xs font-bold text-main placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-focus transition-all" /></div>
                <button type="submit" disabled={addMutation.isPending} className="w-full py-3 bg-gradient-to-l from-[var(--bg-primary)] to-[var(--bg-primary-hover)] text-on-primary text-xs font-bold rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">{addMutation.isPending ? 'Ã«—Ì «·Õ›Ÿ...' : editingId ? ' ÕœÌÀ' : '≈÷«›… Ã·”… „—«Ã⁄…'}</button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Confirm Delete */}
        {confirmId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" dir="rtl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card shadow-xl w-full max-w-sm border border-border rounded-2xl overflow-hidden">
              <div className="bg-error px-5 py-4 flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/10">
                  <AlertTriangle size={20} className="text-on-error" />
                </div>
                <h3 className="text-sm font-bold text-on-error">Õ–› Ã·”… «·„—«Ã⁄…</h3>
              </div>
              <div className="p-5">
                <p className="text-sm font-bold text-main">Â· √‰  „ √ﬂœ „‰ «·Õ–›ø</p>
              </div>
              <div className="flex gap-2 px-5 pb-5">
                <button onClick={() => setConfirmId(null)} className="flex-1 py-3 text-xs font-bold text-muted bg-hover hover:brightness-90 rounded-xl transition-all active:scale-[0.98]">≈·€«¡</button>
                <button onClick={() => { if (confirmId) deleteMutation.mutate(confirmId); }} disabled={deleteMutation.isPending} className="flex-1 py-3 text-xs font-bold text-on-error bg-error rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50">{deleteMutation.isPending ? 'Ã«—Ì «·Õ–›...' : 'Õ–›'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
