import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCurrentUser, useShowNotification, useAcademyName, useLogout } from '../context/AppContext';
import { api } from '../lib/api';
import { PageLoader } from '../components/ui/PageLoader';
import { ErrorBanner } from '../shared/components/ui/ErrorState';
import { MobileAppointments } from '../features/appointments/components/MobileAppointments';
import { AppointmentsFilters, DAYS_OF_WEEK, AppointmentScheduleGrid, AppointmentDetailPanel } from './appointments-page';
import { Plus, Calendar, CheckCircle, Clock, BarChart3, Filter, Home, ListTodo, MessageCircle, MessageSquare, Wallet, Moon, Bell, LogOut, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useDarkMode } from '../shared/hooks/useDarkMode';
import { confirm } from '../lib/confirmDialog';
import { IconButton } from '../shared/components/ui/IconButton';

interface AppointmentEvent {
    id: string; studentName: string; studentGrade: string; teacherName: string;
    subject: string; curriculum: string; day: string; hour: string; period: string; time: string; isPM: boolean;
}

const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 5 + 2, duration: Math.random() * 6 + 4, delay: Math.random() * 3,
}));

export const Appointments = () => {
    const academyName = useAcademyName();
    useEffect(() => { document.title = `المواعيد | ${academyName}`; }, [academyName]);
    const currentUser = useCurrentUser();
    const showNotification = useShowNotification();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const location = useLocation();
    const logout = useLogout();
    const [theme, setTheme] = useDarkMode();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterDay, setFilterDay] = useState<string>('all');
    const [filterTeacher, setFilterTeacher] = useState<string>('all');
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentEvent | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [fabOpen, setFabOpen] = useState(false);

    const { data: students = [], isLoading: loading, error: queryError } = useQuery({
        queryKey: ['appointments-students'],
        queryFn: async () => {
            const data = await api.get('/students');
            return Array.isArray(data) ? data : (data.data || []);
        },
    });

    const { data: completedSessionIds = [] } = useQuery({
        queryKey: ['completed-sessions'],
        queryFn: async () => {
            if (currentUser?.role === 'admin') {
                const settings = await api.get('/system/settings');
                const lastResetDate = settings?.last_appointment_reset;
                const todayStr = new Date().toDateString();
                if (lastResetDate !== todayStr) {
                    await api.delete('/appointments/completed-sessions/reset');
                    await api.post('/system/settings', { key: 'last_appointment_reset', value: todayStr });
                    return [];
                }
            }
            const sessions = await api.get('/appointments/completed-sessions');
            return sessions || [];
        },
        refetchInterval: 15000,
    });

    const completeMutation = useMutation({
        mutationFn: (id: string) => api.post('/appointments/completed-sessions', { id }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['completed-sessions'] }),
        onError: () => {
            showNotification('عذراً، حدث خطأ في تسجيل إتمام الحصة. يرجى المحاولة مرة أخرى.', 'error');
        },
    });

    const handleCompleteSession = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        completeMutation.mutate(id);
    };

    const error = queryError ? 'حدث خطأ في تحميل البيانات' : null;

    const teacherToMatch = (currentUser?.teacherName || currentUser?.name || '').trim();
    const allAppointments: AppointmentEvent[] = (students || []).flatMap(student =>
        (student.enrollments || [])
            .filter(enrollment => currentUser?.role !== 'teacher' || (enrollment.teacher || '').trim() === teacherToMatch || enrollment.teacherId === currentUser.id)
            .flatMap(enrollment =>
                (enrollment.schedule || []).map(slot => {
                    const normalizedPeriod = (slot.period === 'am' || slot.period === 'صباحاً' || slot.period === 'صباحا' || slot.period === 'ص') ? 'ص' : 'م';
                    const isPM = !(slot.period === 'am' || slot.period === 'صباحاً' || slot.period === 'صباحا' || slot.period === 'ص');
                    const normHour = String(parseInt(String(slot.hour).trim(), 10) || '');
                    return {
                        id: `${student.id}-${enrollment.teacher}-${slot.day}-${slot.hour}-${slot.period}`,
                        studentName: student.name,
                        studentGrade: student.grade,
                        teacherName: (enrollment.teacher || '').trim(),
                        subject: enrollment.subject,
                        curriculum: enrollment.curr,
                        day: (slot.day || '').trim(),
                        hour: normHour,
                        period: slot.period,
                        time: `${normHour} ${normalizedPeriod}`,
                        isPM
                    };
                })
            )
    );

    const uniqueTeachers = Array.from(new Set(allAppointments.map(a => a.teacherName)));

    const filteredAppointments = allAppointments.filter(appointment => {
        const isCompleted = completedSessionIds.includes(appointment.id);
        if (isCompleted) return false;
        const matchesSearch =
            appointment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.subject.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDay = filterDay === 'all' || appointment.day === filterDay;
        const matchesTeacher = filterTeacher === 'all' || appointment.teacherName === filterTeacher;
        return matchesSearch && matchesDay && matchesTeacher;
    });

    const appointmentsByDay = DAYS_OF_WEEK.map(day => ({
        day,
        appointments: filteredAppointments
            .filter(a => a.day === day)
            .sort((a, b) => {
                const timeA = Number(a.hour) + (a.isPM && Number(a.hour) !== 12 ? 12 : 0);
                const timeB = Number(b.hour) + (b.isPM && Number(b.hour) !== 12 ? 12 : 0);
                return timeA - timeB;
            })
    })).filter(dayObj => filterDay === 'all' || dayObj.day === filterDay);

    const totalAppointments = allAppointments.length;
    const todayAppointments = allAppointments.filter(a => {
        const today = new Date().toLocaleDateString('ar-EG', { weekday: 'long' });
        return a.day === today;
    }).length;

    const remainingToday = allAppointments.filter(a => {
        const today = new Date().toLocaleDateString('ar-EG', { weekday: 'long' });
        return a.day === today && !completedSessionIds.includes(a.id);
    }).length;

    const completedCount = completedSessionIds.length;
    const hasActiveFilters = searchTerm || filterDay !== 'all' || filterTeacher !== 'all';

    const handleSelectAppointment = (appointment: AppointmentEvent) => {
        setSelectedAppointment(appointment);
        setShowDetails(true);
    };

    const handleCloseDetails = () => setShowDetails(false);

    const handleResetFilters = () => {
        setSearchTerm('');
        setFilterDay('all');
        setFilterTeacher('all');
    };

    const kpiCards = useMemo(() => [
        { label: 'إجمالي المواعيد', value: totalAppointments, icon: Calendar, gradient: 'from-primary/20 to-primary/5', iconBg: 'bg-primary/10 text-primary', accent: 'bg-primary' },
        { label: 'مواعيد اليوم', value: todayAppointments, icon: Clock, gradient: 'from-success/20 to-success/5', iconBg: 'bg-success/10 text-success', accent: 'bg-success' },
        { label: 'المتبقي اليوم', value: remainingToday, icon: BarChart3, gradient: 'from-warning/20 to-warning/5', iconBg: 'bg-warning/10 text-warning', accent: 'bg-warning' },
        { label: 'تم الإنجاز', value: completedCount, icon: CheckCircle, gradient: 'from-info/20 to-info/5', iconBg: 'bg-info/10 text-info', accent: 'bg-info' },
    ], [totalAppointments, todayAppointments, remainingToday, completedCount]);

    const fabActions = useMemo(() => [
        { icon: Calendar, label: 'مواعيد اليوم', onClick: () => { const today = new Date().toLocaleDateString('ar-EG', { weekday: 'long' }); setFilterDay(today); } },
        { icon: CheckCircle, label: 'إتمام الكل', onClick: () => { showNotification('تم تسجيل جميع الحصص الحالية', 'success'); } },
    ], []);

    if (loading) return <PageLoader />;

    if (error) {
        return (
            <div className="min-h-full pb-24 relative" dir="rtl">
                <div className="hidden md:block max-w-page mx-auto px-2">
                    <ErrorBanner className="mt-6 md:mt-10" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full pb-24 relative" dir="rtl">
            <div className="max-w-page mx-auto px-2 border-b border-border/30 mb-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/teacher-dashboard')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/15 transition-all"
                            aria-label="الرئيسية"
                        >
                            <Home size={14} className="text-primary" />
                           الرئيسية
                        </button>
                        <button
                            onClick={() => navigate('/attendance')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-muted hover:text-main dark:hover:text-main transition-all"
                            aria-label="الحضور والغياب"
                        >
                            <UserCheck size={14} className="text-muted" />
                            الحضور والغياب
                        </button>
                        <button
                            onClick={() => navigate('/tasks')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-muted hover:text-main dark:hover:text-main transition-all"
                            aria-label="المهام"
                        >
                            <ListTodo size={14} className="text-muted" />
                            المهام
                        </button>
                        <button
                            onClick={() => navigate('/forum')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-muted hover:text-main dark:hover:text-main transition-all"
                            aria-label="المنتدى"
                        >
                            <MessageCircle size={14} className="text-muted" />
                            المنتدى
                        </button>
                        <button
                            onClick={() => navigate('/chat')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-muted hover:text-main dark:hover:text-main transition-all"
                            aria-label="الرسائل"
                        >
                            <MessageSquare size={14} className="text-muted" />
                            الرسائل
                        </button>
                        <button
                            onClick={() => navigate('/teacher-payment-history')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/15 transition-all"
                            aria-label="سجل الدفع"
                        >
                            <Wallet size={14} className="text-primary" />
                            سجل الدفع
                        </button>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary-soft text-primary text-[11px] font-bold rounded-lg">
                            أهلاً بك افكار
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <IconButton
                            icon={<Moon size={16} strokeWidth={1.5} />}
                            label="الوضع النهاري"
                            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                        />
                        <IconButton
                            icon={<Bell size={16} strokeWidth={1.5} />}
                            label="الإشعارات"
                            onClick={() => navigate('/announcements')}
                        />
                        <IconButton
                            icon={<LogOut size={16} strokeWidth={1.5} />}
                            label="تسجيل الخروج"
                            variant="error"
                            onClick={async () => { if (await confirm('هل أنت متأكد من تسجيل الخروج؟')) logout(); }}
                        />
                    </div>
                </div>
            </div>
            <div className="hidden md:block max-w-page mx-auto px-2">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-6 md:p-8 mb-4">
                    {particles.map(p => (
                        <motion.div key={p.id} className="absolute rounded-full bg-white/10 pointer-events-none"
                            style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
                            animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }} />
                    ))}
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-xl bg-white/15 backdrop-blur-sm"><Calendar className="text-white" size={20} /></div>
                                <span className="text-white/70 text-xs font-medium">المواعيد الدراسية</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-on-primary mb-1">المواعيد</h1>
                            <p className="text-white/70 text-sm">جدولة ومتابعة الحصص الأكاديمية للطلاب</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                            <div className="text-center">
                                <p className="text-white/60 text-xs mb-1">اليوم</p>
                                <p className="text-2xl font-bold text-white">{todayAppointments}</p>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-center">
                                <p className="text-white/60 text-xs mb-1">المتبقي</p>
                                <p className="text-2xl font-bold text-white">{remainingToday}</p>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-center">
                                <p className="text-white/60 text-xs mb-1">الإجمالي</p>
                                <p className="text-2xl font-bold text-white">{totalAppointments}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {kpiCards.map((kpi, i) => {
                            const Icon = kpi.icon;
                            return (
                                <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.06 }}
                                    whileHover={{ scale: 1.02, y: -2 }} className={cn("relative overflow-hidden rounded-xl bg-gradient-to-br border border-border/50 p-4", kpi.gradient)}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={cn("p-2 rounded-lg", kpi.iconBg)}><Icon size={16} /></div>
                                        <div className={cn("h-1 w-12 rounded-full", kpi.accent)} />
                                    </div>
                                    <p className="text-xs text-muted mb-1">{kpi.label}</p>
                                    <p className="text-2xl font-bold text-main">{kpi.value}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <AppointmentsFilters searchTerm={searchTerm} onSearchChange={setSearchTerm}
                        filterDay={filterDay} onDayChange={setFilterDay} filterTeacher={filterTeacher}
                        onTeacherChange={setFilterTeacher} uniqueTeachers={uniqueTeachers}
                        hasActiveFilters={hasActiveFilters} onReset={handleResetFilters} />
                </motion.div>

                <div className={`grid gap-4 ${showDetails ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                        className={showDetails ? 'lg:col-span-2' : ''} data-schedule-grid>
                        <AppointmentScheduleGrid appointmentsByDay={appointmentsByDay} onSelectAppointment={handleSelectAppointment} onCompleteSession={handleCompleteSession} />
                    </motion.div>
                    <AppointmentDetailPanel appointment={selectedAppointment} showDetails={showDetails} onClose={handleCloseDetails} />
                </div>
            </div>
            <div className="block md:hidden">
                <MobileAppointments />
            </div>

            <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
                <AnimatePresence>
                    {fabOpen && fabActions.map((action, i) => (
                        <motion.div key={action.label} initial={{ opacity: 0, scale: 0.3, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.3, y: 20 }} transition={{ delay: 0.05 * (fabActions.length - 1 - i) }} className="flex items-center gap-2">
                            <span className="bg-card border border-border text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap">{action.label}</span>
                            <button onClick={() => { action.onClick(); setFabOpen(false); }}
                                className="w-10 h-10 rounded-lg bg-primary text-on-primary shadow-lg hover:shadow-xl hover:bg-primary-hover transition-all flex items-center justify-center">
                                <action.icon size={18} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
<motion.button onClick={() => setFabOpen(!fabOpen)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className={cn("w-12 h-12 rounded-lg shadow-xl text-on-primary flex items-center justify-center transition-all", fabOpen ? "bg-error rotate-45" : "bg-primary")}>
                        <Plus size={24} />
                </motion.button>
            </div>
        </div>
    );
};
