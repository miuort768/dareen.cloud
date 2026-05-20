import { useState, useEffect } from 'react';
import { CalendarDays, Clock, CheckCircle2, XCircle, Plus, Save, Search, GraduationCap } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { PageContainer } from '../components/layout/PageContainer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
    queryFn: () => api.get<any[]>('/teachers')
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
      return api.get<any[]>('/teacher-availability/available-at', { params: { day: String(now.getDay()), time: `${h}:${m}` } });
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

  const updateSlot = (dayOfWeek: number, field: keyof Slot, value: any) => {
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

  const filteredTeachers = Array.isArray(teachers) ? teachers.filter((t: any) => t.name.toLowerCase().includes(searchTerm.toLowerCase())) : [];
  const selTeacher = Array.isArray(teachers) ? teachers.find((t: any) => t.id === selectedTeacher) : null;
  const getSlotsForDay = (day: number) => editingSlots.find(s => s.dayOfWeek === day);

  return (
    <PageContainer title="جدول المعلمات المتاحات" subtitle="إدارة أوقات فراغ المعلمات" icon={CalendarDays}>
      {/* Available Now */}
      {availableNow && availableNow.length > 0 && (
        <div className="bg-gradient-to-l from-emerald-500 to-emerald-600 rounded-2xl p-4 shadow-lg text-white mb-6">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={16} />
            <p className="text-[11px] font-black uppercase tracking-widest text-white/80">المتاحات الآن</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {availableNow.slice(0, 6).map((t: any) => (
              <span key={t.teacherId} className="text-xs font-bold bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">{t.teacherName} ({t.subject})</span>
            ))}
            {availableNow.length > 6 && <span className="text-xs font-bold bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">+{availableNow.length - 6}</span>}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Teacher List */}
        <div className="lg:w-72 shrink-0">
          <div className="relative mb-3">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="بحث عن معلمة..." className="w-full pr-9 pl-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
          </div>
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {filteredTeachers.map((t: any) => (
              <button key={t.id} onClick={() => setSelectedTeacher(t.id)} className={cn("w-full text-right px-3 py-2 rounded-xl text-xs font-bold transition-all", selectedTeacher === t.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800')}>
                <span>{t.name}</span>
                {t.subject && <span className="text-[10px] text-slate-400 mr-2">{t.subject}</span>}
              </button>
            ))}
          </div>
          {/* Legend */}
          <div className="mt-4 p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">الوسوم</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400"><div className="w-4 h-4 rounded bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700" />متاحة</div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400"><div className="w-4 h-4 rounded bg-rose-100 dark:bg-rose-900/40 border border-rose-300 dark:border-rose-700" />غير متاحة</div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400"><div className="w-4 h-4 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />بدون تحديد</div>
            </div>
          </div>
        </div>

        {/* Availability Grid */}
        <div className="flex-1">
          {!selTeacher ? <div className="text-center py-12 text-slate-400 text-sm font-bold">اختر معلمة من القائمة</div> :
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">{selTeacher.name}</h3>
                {selTeacher.subject && <p className="text-[11px] text-slate-500 font-bold">{selTeacher.subject}</p>}
              </div>
              <button onClick={() => { if (selTeacher) saveMutation.mutate({ teacherId: selTeacher.id, teacherName: selTeacher.name, slots: editingSlots }); }} disabled={!hasChanges || saveMutation.isPending} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95", hasChanges && !saveMutation.isPending ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed')}>
                <Save size={14} /> حفظ التغييرات
              </button>
            </div>

            {isLoading ? <div className="text-center py-8 text-slate-400 text-sm font-bold">جاري التحميل...</div> :
            <div className="space-y-2">
              {dayNumbers.map(day => {
                const slot = getSlotsForDay(day);
                const isAvail = slot?.isAvailable;
                return (
                  <div key={day} className={cn("flex items-center gap-3 p-3 rounded-2xl border transition-all", isAvail === 1 ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30' : isAvail === 0 ? 'bg-rose-50/50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-900/30' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800')}>
                    <button onClick={() => toggleDay(day)} className={cn("shrink-0 p-1.5 rounded-xl transition-all", isAvail === 1 ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' : isAvail === 0 ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400')}>
                      {isAvail === 1 ? <CheckCircle2 size={16} /> : isAvail === 0 ? <XCircle size={16} /> : <Clock size={16} />}
                    </button>
                    <span className={cn("text-sm font-black w-20 shrink-0", isAvail === 1 ? 'text-emerald-700 dark:text-emerald-400' : isAvail === 0 ? 'text-rose-700 dark:text-rose-400' : 'text-slate-500')}>{days[day]}</span>
                    {slot ? <>
                      <input type="time" value={slot.startTime} onChange={e => updateSlot(day, 'startTime', e.target.value)} className={cn("w-24 px-2 py-1.5 rounded-xl text-xs font-bold border focus:outline-none", isAvail === 1 ? 'bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-900' : isAvail === 0 ? 'bg-white dark:bg-slate-800 border-rose-200 dark:border-rose-900' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700')} />
                      <span className="text-slate-400 text-xs">–</span>
                      <input type="time" value={slot.endTime} onChange={e => updateSlot(day, 'endTime', e.target.value)} className={cn("w-24 px-2 py-1.5 rounded-xl text-xs font-bold border focus:outline-none", isAvail === 1 ? 'bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-900' : isAvail === 0 ? 'bg-white dark:bg-slate-800 border-rose-200 dark:border-rose-900' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700')} />
                    </> : <span className="text-[11px] text-slate-400 font-bold">غير محدد</span>}
                  </div>
                );
              })}
            </div>}
          </>}
        </div>
      </div>
    </PageContainer>
  );
};
