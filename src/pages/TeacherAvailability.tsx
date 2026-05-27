import { useState, useEffect } from 'react';
import { CalendarDays, Clock, CheckCircle2, XCircle, Save, Search, ChevronDown, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';

const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const dayNumbers = [0, 1, 2, 3, 4, 5, 6];

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
  const [searchTerm, setSearchTerm] = useState('');
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
        const defaultSlots = dayNumbers.map(d => ({ dayOfWeek: d, startTime: '09:00', endTime: '17:00', isAvailable: 1 }));
        setEditingSlots(defaultSlots);
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
  const filteredTeachers = Array.isArray(teachers) ? teachers.filter((t: { name: string }) => t.name.toLowerCase().includes(searchTerm.toLowerCase())) : [];

  const selTeacher = Array.isArray(teachers) ? teachers.find((t: { id: string }) => t.id === selectedTeacher) : null;
  const getSlotsForDay = (day: number) => editingSlots.find(s => s.dayOfWeek === day);

  return (
    <div className="min-h-full pb-24 overflow-x-hidden relative bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-blue-950/20" dir="rtl">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-400/10 dark:bg-indigo-500/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-teal-400/10 dark:bg-teal-500/5 blur-3xl pointer-events-none" />
      <div className="relative z-10 mx-auto px-2 space-y-4 max-w-[1400px]">

        <div className="bg-gradient-to-br from-[#2563EB] via-[#3B82F6] to-[#1D4ED8] shadow-lg shadow-blue-600/20 px-5 md:px-7 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-white/15 backdrop-blur-sm text-white rounded-xl border border-white/20">
              <CalendarDays size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">جدول المواعيد المتاحة</h1>
              <p className="text-[10px] text-white/70 font-medium leading-none mt-1">إدارة أوقات عمل المعلمات</p>
            </div>
          </div>
          {availableNow && availableNow.length > 0 && (
            <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-300 bg-emerald-500/15 px-3 py-2 border border-emerald-500/20 whitespace-nowrap rounded-xl backdrop-blur-sm">
              <CheckCircle2 size={13} className="text-emerald-300" />
              {availableNow.length} متاحة الآن
            </div>
          )}
        </div>

        {availableNow && availableNow.length > 0 && (
          <div className="border border-blue-100 dark:border-blue-800/30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-3 flex flex-wrap items-center gap-2 rounded-2xl shadow-sm">
            <span className="text-[10px] font-medium text-slate-500 ml-1">المتاحات الآن:</span>
            {availableNow.slice(0, 8).map((t: { teacherId: string; teacherName: string; subject: string }) => (
              <span key={t.teacherId} className="text-[10px] font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-1.5 border border-blue-100 dark:border-blue-800 rounded-lg">
                {t.teacherName} ({t.subject})
              </span>
            ))}
            {availableNow.length > 8 && <span className="text-[10px] font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1.5 border border-blue-100 dark:border-blue-800 rounded-lg">+{availableNow.length - 8}</span>}
          </div>
        )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-72 shrink-0">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4">
            <div className="relative mb-3">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="بحث عن معلمة..." className="w-full pr-9 pl-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-normal focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
            </div>
            <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
              {filteredTeachers.map((t: { id: string; name: string; subject: string }) => (
                <button key={t.id} onClick={() => setSelectedTeacher(t.id)} className={cn("w-full text-right px-3 py-2.5 rounded-xl text-xs font-normal transition-all flex items-center gap-2", selectedTeacher === t.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700')}>
                  <User size={12} className={cn(selectedTeacher === t.id ? 'text-blue-500' : 'text-slate-400')} />
                  <div className="text-right">
                    <span className="text-xs">{t.name}</span>
                    {t.subject && <span className="text-[10px] text-slate-400 mr-1 block leading-tight">{t.subject}</span>}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-medium text-slate-500 mb-2">الحالة</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[11px] font-normal text-slate-600 dark:text-slate-400"><div className="w-3 h-3 bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700 rounded-sm" />متاحة</div>
                <div className="flex items-center gap-2 text-[11px] font-normal text-slate-600 dark:text-slate-400"><div className="w-3 h-3 bg-rose-100 dark:bg-rose-900/40 border border-rose-300 dark:border-rose-700 rounded-sm" />غير متاحة</div>
                <div className="flex items-center gap-2 text-[11px] font-normal text-slate-600 dark:text-slate-400"><div className="w-3 h-3 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-sm" />بدون تحديد</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          {!selTeacher ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                <User size={28} className="text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-500">اختر معلمة من القائمة</p>
              <p className="text-xs text-slate-400 mt-1">لعرض وتعديل أوقات العمل</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 md:p-5 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-sm">
                      <User size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-900 dark:text-white">{selTeacher.name}</h3>
                      {selTeacher.subject && <p className="text-[11px] text-slate-500 font-normal">{selTeacher.subject}</p>}
                    </div>
                  </div>
                  <button onClick={() => { if (selTeacher) saveMutation.mutate({ teacherId: selTeacher.id, teacherName: selTeacher.name, slots: editingSlots }); }} disabled={!hasChanges || saveMutation.isPending} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-normal transition-all shadow-sm active:scale-95", hasChanges && !saveMutation.isPending ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed')}>
                    <Save size={14} /> حفظ التغييرات
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-12 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="text-sm text-slate-400">جاري التحميل...</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-4">
                    {dayNumbers.map(day => {
                      const slot = getSlotsForDay(day);
                      const isAvail = slot?.isAvailable;
                      return (
                        <div key={day} className={cn("rounded-2xl border p-4 transition-all hover:shadow-md", isAvail === 1 ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30' : isAvail === 0 ? 'bg-rose-50/50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-900/30' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700')}>
                          <div className="flex items-center justify-between mb-3">
                            <span className={cn("text-sm font-medium", isAvail === 1 ? 'text-emerald-700 dark:text-emerald-400' : isAvail === 0 ? 'text-rose-700 dark:text-rose-400' : 'text-slate-500')}>{days[day]}</span>
                            <button onClick={() => toggleDay(day)} className={cn("px-3 py-1 rounded-lg text-[10px] font-medium transition-all border", isAvail === 1 ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 border-emerald-200 dark:border-emerald-800' : isAvail === 0 ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 border-rose-200 dark:border-rose-800' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 border-slate-200 dark:border-slate-600')}>
                              {isAvail === 1 ? 'متاح' : isAvail === 0 ? 'غير متاح' : 'إعداد'}
                            </button>
                          </div>
                          {slot ? (
                            <div className="flex items-center gap-2">
                              <input type="time" value={slot.startTime} onChange={e => updateSlot(day, 'startTime', e.target.value)} className={cn("flex-1 px-2 py-1.5 rounded-xl text-xs font-normal border focus:outline-none focus:ring-2 focus:ring-blue-500/20", isAvail === 1 ? 'bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-800' : isAvail === 0 ? 'bg-white dark:bg-slate-800 border-rose-200 dark:border-rose-800' : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600')} />
                              <span className="text-slate-400 text-xs">–</span>
                              <input type="time" value={slot.endTime} onChange={e => updateSlot(day, 'endTime', e.target.value)} className={cn("flex-1 px-2 py-1.5 rounded-xl text-xs font-normal border focus:outline-none focus:ring-2 focus:ring-blue-500/20", isAvail === 1 ? 'bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-800' : isAvail === 0 ? 'bg-white dark:bg-slate-800 border-rose-200 dark:border-rose-800' : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600')} />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-9 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-600">
                              <span className="text-[11px] text-slate-400 font-normal">غير محدد</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};
