import { useState, useEffect } from 'react';
import { CalendarDays, Clock, CheckCircle2, XCircle, Save, Sun, Moon, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const dayNumbers = [0, 1, 2, 3, 4, 5, 6];

const dayColors = ['from-rose-500 to-pink-600', 'from-blue-500 to-indigo-600', 'from-emerald-500 to-teal-600', 'from-violet-500 to-purple-600', 'from-amber-500 to-orange-600', 'from-cyan-500 to-blue-600', 'from-rose-500 to-pink-600'];

interface Slot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable?: number;
}

interface Availability {
  id: string;
  teacherId: string;
  teacherName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: number;
}

export const TeacherAvailability = () => {
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [editingSlots, setEditingSlots] = useState<Slot[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const queryClient = useQueryClient();

  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => api.get<Record<string, unknown>[]>('/teachers')
  });

  const { data: allAvailability = [], isLoading } = useQuery({
    queryKey: ['teacher-availability'],
    queryFn: () => api.get<Availability[]>('/teacher-availability')
  });

  const { data: availableNow } = useQuery({
    queryKey: ['teacher-availability', 'available-at', new Date().getDay(), ''],
    queryFn: () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      return api.get<Record<string, unknown>[]>('/teacher-availability/available-at', { params: { day: String(now.getDay()), time: `${h}:${m}` } });
    },
    refetchInterval: 60000
  });

  const saveMutation = useMutation({
    mutationFn: (data: { teacherId: string; teacherName: string; slots: Slot[] }) => api.post('/teacher-availability/bulk', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['teacher-availability'] }); setHasChanges(false); }
  });

  useEffect(() => {
    if (!selectedTeacher && teachers.length > 0) {
      setSelectedTeacher(teachers[0]?.id || '');
    }
  }, [teachers, selectedTeacher]);

  useEffect(() => {
    if (selectedTeacher) {
      const teacherAvail = allAvailability.filter((a: Availability) => a.teacherId === selectedTeacher);
      if (teacherAvail.length > 0) {
        setEditingSlots(teacherAvail.map((a: Availability) => ({ dayOfWeek: a.dayOfWeek, startTime: a.startTime, endTime: a.endTime, isAvailable: a.isAvailable })));
      } else {
        setEditingSlots(dayNumbers.map(d => ({ dayOfWeek: d, startTime: '09:00', endTime: '17:00', isAvailable: 1 })));
      }
      setHasChanges(false);
    }
  }, [selectedTeacher, allAvailability]);

  const updateSlot = (dayOfWeek: number, field: keyof Slot, value: string | boolean) => {
    setEditingSlots(prev => prev.map(s => s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s));
    setHasChanges(true);
  };

  const toggleDay = (dayOfWeek: number) => {
    const existing = editingSlots.find(s => s.dayOfWeek === dayOfWeek);
    if (existing) {
      updateSlot(dayOfWeek, 'isAvailable', existing.isAvailable ? 0 : 1);
    } else {
      setEditingSlots(prev => [...prev, { dayOfWeek, startTime: '09:00', endTime: '17:00', isAvailable: 1 }]);
    }
    setHasChanges(true);
  };

  const selTeacher = Array.isArray(teachers) ? teachers.find((t: { id: string }) => t.id === selectedTeacher) : null;
  const getSlotsForDay = (day: number) => editingSlots.find(s => s.dayOfWeek === day);

  const availableCount = editingSlots.filter(s => s.isAvailable === 1).length;
  const totalHours = editingSlots.filter(s => s.isAvailable === 1).reduce((sum, s) => {
    const [sh, sm] = s.startTime.split(':').map(Number);
    const [eh, em] = s.endTime.split(':').map(Number);
    return sum + Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60);
  }, 0);

  return (
    <div className="min-h-full pb-24 overflow-x-hidden relative bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-blue-950/20" dir="rtl">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/5 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-400/10 dark:bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-emerald-400/10 dark:bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />
      <div className="relative z-10 mx-auto px-2 space-y-5 max-w-[1400px]">

        <div className="bg-gradient-to-br from-[#2563EB] via-[#3B82F6] to-[#1D4ED8] shadow-lg shadow-blue-600/20 px-5 md:px-7 py-5 md:py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="flex items-center gap-4 relative">
            <div className="w-12 h-12 flex items-center justify-center bg-white/15 backdrop-blur-sm text-white rounded-xl border border-white/20 shadow-lg">
              <CalendarDays size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">جدول المواعيد المتاحة</h1>
              <p className="text-[10px] text-blue-200/80 font-medium leading-none mt-1">إدارة أوقات عمل المعلمات</p>
            </div>
          </div>
          <AnimatePresence>
            {availableNow && availableNow.length > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 text-[11px] font-bold text-emerald-300 bg-emerald-500/15 px-4 py-2.5 border border-emerald-500/20 whitespace-nowrap rounded-xl backdrop-blur-sm relative">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                {availableNow.length} متاحة الآن
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {availableNow && availableNow.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="border border-blue-100 dark:border-blue-800/30 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm p-3 md:p-4 flex flex-wrap items-center gap-2 rounded-2xl shadow-sm">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 ml-2">
              <Clock size={12} />
              المتاحات الآن:
            </div>
            {availableNow.slice(0, 8).map((t: { teacherId: string; teacherName: string; subject: string }, i: number) => (
              <motion.span key={t.teacherId} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="text-[10px] font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                {t.teacherName}
                <span className="text-[9px] text-slate-400 mr-1">{t.subject}</span>
              </motion.span>
            ))}
            {availableNow.length > 8 && <span className="text-[10px] font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800">+{availableNow.length - 8}</span>}
          </motion.div>
        )}

        {Array.isArray(teachers) && teachers.length > 0 && !selTeacher && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-12 md:p-16 text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
              <User size={36} className="text-blue-400 dark:text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">اختر معلمة من القائمة</h3>
            <p className="text-sm text-slate-400">لعرض وتعديل أوقات العمل والأيام المتاحة</p>
          </div>
        )}

        {selTeacher && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-3 md:p-4 overflow-x-auto">
              <div className="flex items-center gap-2 min-w-0">
                {Array.isArray(teachers) && teachers.map((t: { id: string; name: string; subject: string }, i: number) => (
                  <motion.button key={t.id} onClick={() => setSelectedTeacher(t.id)} whileTap={{ scale: 0.97 }} className={cn("flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all border whitespace-nowrap", selectedTeacher === t.id ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700')}>
                    <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold", selectedTeacher === t.id ? 'bg-white/20 text-white' : 'bg-gradient-to-br ' + dayColors[i % 7] + ' text-white')}>{t.name.charAt(0)}</div>
                    <div className="text-right">
                      <div className="text-xs leading-tight">{t.name}</div>
                      {t.subject && <div className="text-[9px] opacity-70 leading-tight">{t.subject}</div>}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center"><CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" /></div>
                  <div><p className="text-[10px] text-slate-500 font-medium">أيام متاحة</p><p className="text-lg font-medium text-slate-900 dark:text-white mt-0.5">{availableCount} / 7</p></div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center"><Clock size={18} className="text-blue-600 dark:text-blue-400" /></div>
                  <div><p className="text-[10px] text-slate-500 font-medium">ساعات أسبوعياً</p><p className="text-lg font-medium text-slate-900 dark:text-white mt-0.5">{totalHours.toFixed(0)}</p></div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center"><Sun size={18} className="text-amber-600 dark:text-amber-400" /></div>
                  <div><p className="text-[10px] text-slate-500 font-medium">أيام غير متاحة</p><p className="text-lg font-medium text-slate-900 dark:text-white mt-0.5">{editingSlots.filter(s => s.isAvailable === 0).length}</p></div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center"><Moon size={18} className="text-slate-500 dark:text-slate-400" /></div>
                  <div><p className="text-[10px] text-slate-500 font-medium">بدون تحديد</p><p className="text-lg font-medium text-slate-900 dark:text-white mt-0.5">{7 - editingSlots.length}</p></div>
                </div>
              </div>
              <div className="col-span-2 md:col-span-4 flex justify-end">
                <button onClick={() => { if (selTeacher) saveMutation.mutate({ teacherId: selTeacher.id, teacherName: selTeacher.name, slots: editingSlots }); }} disabled={!hasChanges || saveMutation.isPending} className={cn("flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-medium transition-all shadow-sm", hasChanges && !saveMutation.isPending ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed')}>
                  {saveMutation.isPending ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save size={14} />}
                  حفظ التغييرات
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-16 text-center mt-5">
                  <div className="animate-spin w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-sm text-slate-400">جاري تحميل الجدول...</p>
                </motion.div>
              ) : (
                <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-3">
                    {dayNumbers.map((day, i) => {
                      const slot = getSlotsForDay(day);
                      const isAvail = slot?.isAvailable;
                      const startHour = slot ? parseInt(slot.startTime) : 9;
                      const fillPercent = slot ? Math.min(100, ((parseInt(slot.endTime) - startHour) / 12) * 100) : 0;
                      return (
                        <motion.div key={day} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                          <div className={cn("rounded-2xl border-2 overflow-hidden transition-all duration-200 cursor-pointer group", isAvail === 1 ? 'bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-lg hover:shadow-emerald-500/10' : isAvail === 0 ? 'bg-rose-50/50 dark:bg-slate-800/50 border-rose-200 dark:border-rose-800/50 hover:border-rose-400 dark:hover:border-rose-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md')} onClick={() => toggleDay(day)}>
                            <div className={cn("px-3 py-2.5 flex items-center justify-between border-b", isAvail === 1 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800' : isAvail === 0 ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800' : 'bg-slate-50 dark:bg-slate-700/50 border-slate-100 dark:border-slate-700')}>
                              <span className={cn("text-xs font-bold", isAvail === 1 ? 'text-emerald-700 dark:text-emerald-400' : isAvail === 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400')}>{days[day]}</span>
                              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center transition-all", isAvail === 1 ? 'bg-emerald-200 dark:bg-emerald-700 text-emerald-700 dark:text-emerald-200' : isAvail === 0 ? 'bg-rose-200 dark:bg-rose-700 text-rose-700 dark:text-rose-200' : 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-300')}>
                                {isAvail === 1 ? <CheckCircle2 size={14} /> : isAvail === 0 ? <XCircle size={14} /> : <Clock size={14} />}
                              </div>
                            </div>
                            <div className="p-3 space-y-2" onClick={e => e.stopPropagation()}>
                              {slot ? (
                                <>
                                  <div className="flex items-center gap-1.5">
                                    <input type="time" value={slot.startTime} onChange={e => updateSlot(day, 'startTime', e.target.value)} className={cn("flex-1 px-2 py-1.5 rounded-lg text-[11px] font-normal border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all", isAvail === 1 ? 'bg-white dark:bg-slate-700 border-emerald-200 dark:border-emerald-700' : isAvail === 0 ? 'bg-white dark:bg-slate-700 border-rose-200 dark:border-rose-700' : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600')} />
                                    <span className="text-slate-300 dark:text-slate-600 text-xs">–</span>
                                    <input type="time" value={slot.endTime} onChange={e => updateSlot(day, 'endTime', e.target.value)} className={cn("flex-1 px-2 py-1.5 rounded-lg text-[11px] font-normal border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all", isAvail === 1 ? 'bg-white dark:bg-slate-700 border-emerald-200 dark:border-emerald-700' : isAvail === 0 ? 'bg-white dark:bg-slate-700 border-rose-200 dark:border-rose-700' : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600')} />
                                  </div>
                                  {isAvail === 1 && (
                                    <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                      <div className="h-full bg-gradient-to-l from-emerald-400 to-emerald-500 rounded-full transition-all" style={{ width: `${fillPercent}%` }} />
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="flex items-center justify-center h-[34px] bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-600">
                                  <span className="text-[10px] text-slate-400">اضغط للإعداد</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};
