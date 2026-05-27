import { useState, useEffect } from 'react';
import { CalendarDays, CheckCircle2, Save, Search, User } from 'lucide-react';
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
    <div className="min-h-full pb-24 overflow-x-hidden relative" dir="rtl">
      <div className="mx-auto px-2 space-y-4 max-w-[1400px]">

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-800/50 px-4 md:px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#2563EB12' }}>
              <CalendarDays size={22} style={{ color: '#2563EB' }} />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black text-slate-900 dark:text-white leading-tight">جدول المواعيد المتاحة</h1>
              <p className="text-[11px] font-bold text-slate-400 mt-0.5">إدارة أوقات عمل المعلمات</p>
            </div>
          </div>
          {availableNow && availableNow.length > 0 && (
            <div className="flex items-center gap-2 text-[11px] font-bold px-3 py-2 whitespace-nowrap rounded-xl" style={{ backgroundColor: '#10B98112', color: '#059669', border: '1px solid #10B98120' }}>
              <CheckCircle2 size={13} />
              {availableNow.length} متاحة الآن
            </div>
          )}
        </div>

        {availableNow && availableNow.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 p-3 flex flex-wrap items-center gap-2 rounded-2xl shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 ml-1">المتاحات الآن:</span>
            {availableNow.slice(0, 8).map((t: { teacherId: string; teacherName: string; subject: string }) => (
              <span key={t.teacherId} className="text-[10px] font-bold px-2 py-1.5 rounded-lg" style={{ backgroundColor: '#10B98112', color: '#059669' }}>
                {t.teacherName} ({t.subject})
              </span>
            ))}
            {availableNow.length > 8 && <span className="text-[10px] font-bold px-2 py-1.5 rounded-lg" style={{ backgroundColor: '#2563EB12', color: '#2563EB' }}>+{availableNow.length - 8}</span>}
          </div>
        )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-72 shrink-0">
          <div className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 rounded-2xl shadow-sm p-4">
            <div className="relative mb-3">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="بحث عن معلمة..." className="w-full pr-9 pl-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-[#2563EB] transition-all" />
            </div>
            <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
              {filteredTeachers.map((t: { id: string; name: string; subject: string }) => (
                <button key={t.id} onClick={() => setSelectedTeacher(t.id)} className={cn("w-full text-right px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border", selectedTeacher === t.id ? 'text-[#2563EB] border-[#2563EB20]' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700')} style={selectedTeacher === t.id ? { backgroundColor: '#2563EB12' } : undefined}>
                  <User size={12} className={cn(selectedTeacher === t.id ? 'text-[#2563EB]' : 'text-slate-400')} />
                  <div className="text-right">
                    <span className="text-xs font-bold">{t.name}</span>
                    {t.subject && <span className="text-[10px] font-bold text-slate-400 mr-1 block leading-tight">{t.subject}</span>}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100/50 dark:border-slate-800/50">
              <p className="text-[10px] font-bold text-slate-500 mb-2">الحالة</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#10B98120', border: '1px solid #10B98150' }} />متاحة</div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#F43F5E20', border: '1px solid #F43F5E50' }} />غير متاحة</div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400"><div className="w-3 h-3 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-sm" />بدون تحديد</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          {!selTeacher ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 rounded-2xl shadow-sm p-12 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: '#64748B12' }}>
                <User size={26} className="text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-500">اختر معلمة من القائمة</p>
              <p className="text-xs font-bold text-slate-400 mt-1">لعرض وتعديل أوقات العمل</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 rounded-2xl shadow-sm p-4 md:p-5 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: '#2563EB12' }}>
                      <User size={18} style={{ color: '#2563EB' }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selTeacher.name}</h3>
                      {selTeacher.subject && <p className="text-[11px] font-bold text-slate-500">{selTeacher.subject}</p>}
                    </div>
                  </div>
                  <button onClick={() => { if (selTeacher) saveMutation.mutate({ teacherId: selTeacher.id, teacherName: selTeacher.name, slots: editingSlots }); }} disabled={!hasChanges || saveMutation.isPending} className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95", hasChanges && !saveMutation.isPending ? 'bg-[#2563EB] hover:bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed')}>
                    <Save size={14} /> حفظ التغييرات
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 rounded-2xl shadow-sm p-12 text-center">
                  <div className="w-8 h-8 border-2 border-slate-200 border-t-[#2563EB] rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-400">جاري التحميل...</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 rounded-2xl shadow-sm overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-4">
                    {dayNumbers.map(day => {
                      const slot = getSlotsForDay(day);
                      const isAvail = slot?.isAvailable;
                      const dayColor = isAvail === 1 ? '#10B981' : isAvail === 0 ? '#F43F5E' : '#94A3B8';
                      const dayBg = isAvail === 1 ? '#10B98108' : isAvail === 0 ? '#F43F5E08' : 'transparent';
                      const dayBorder = isAvail === 1 ? '#10B98120' : isAvail === 0 ? '#F43F5E20' : '#E2E8F0';
                      return (
                        <div key={day} className="rounded-2xl border p-4 transition-all bg-white dark:bg-slate-800" style={{ borderColor: dayBorder, backgroundColor: dayBg }}>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-bold" style={{ color: dayColor }}>{days[day]}</span>
                            <button onClick={() => toggleDay(day)} className="px-3 py-1 rounded-xl text-[10px] font-bold transition-all border shadow-sm active:scale-95" style={{ backgroundColor: isAvail !== undefined ? `${dayColor}12` : '#F1F5F9', color: isAvail !== undefined ? dayColor : '#64748B', borderColor: `${dayColor}20` }}>
                              {isAvail === 1 ? 'متاح' : isAvail === 0 ? 'غير متاح' : 'إعداد'}
                            </button>
                          </div>
                          {slot ? (
                            <div className="flex items-center gap-2">
                              <input type="time" value={slot.startTime} onChange={e => updateSlot(day, 'startTime', e.target.value)} className="flex-1 px-2 py-1.5 rounded-xl text-xs font-bold border outline-none focus:border-[#2563EB] transition-all" style={{ backgroundColor: '#FFFFFF', borderColor: `${dayColor}30` }} />
                              <span className="text-slate-400 text-xs font-bold">–</span>
                              <input type="time" value={slot.endTime} onChange={e => updateSlot(day, 'endTime', e.target.value)} className="flex-1 px-2 py-1.5 rounded-xl text-xs font-bold border outline-none focus:border-[#2563EB] transition-all" style={{ backgroundColor: '#FFFFFF', borderColor: `${dayColor}30` }} />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-9 rounded-xl border border-dashed" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                              <span className="text-[11px] font-bold text-slate-400">غير محدد</span>
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
