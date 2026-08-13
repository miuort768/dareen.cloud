import { useState, useEffect, useMemo } from 'react';
import { useStudents } from '../hooks/useStudents';
import { useTeachers } from '../../teachers/hooks/useTeachers';
import { useShowNotification } from '../../../context/AppContext';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { AlertCircle, TrendingUp, Plus, Users, BookOpen, GraduationCap, Bell, Star, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Skeleton } from '../../../shared/components/ui';
import { SendNotificationModal } from '../../../shared/components/SendNotificationModal';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { StudentStats } from '../components/StudentStats';
import { StudentForm } from '../components/StudentForm';
import { StudentTable } from '../components/StudentTable';
import { StudentDrawer } from '../components/StudentDrawer';
import { StudentsPageHeader } from '../components/StudentsPageHeader';
import { StudentsFilters } from '../components/StudentsFilters';
import { StudentsToolbar } from '../components/StudentsToolbar';
import { generateSessionDates } from '../utils/sessionUtils';
import type { Student, ScheduleSlot } from '../types';
import { cn } from '../../../lib/utils';

function AnimatedCounter({ value }: { value: number }) {
    const [display, setDisplay] = useState('0');
    useEffect(() => {
        let start = 0;
        const end = value;
        if (start === end) { setDisplay(end.toLocaleString('ar-EG')); return; }
        const duration = 800;
        const startTime = performance.now();
        const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            start = Math.round(eased * end);
            setDisplay(start.toLocaleString('ar-EG'));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [value]);
    return <span className="text-2xl font-bold tabular-nums">{display}</span>;
}

const particles = Array.from({ length: 10 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 6 + 2, duration: Math.random() * 6 + 4, delay: Math.random() * 3,
}));

interface EnrollmentFormData {
    teacherId?: string;
    teacher: string;
    subject: string;
    curr: string;
    curriculum?: string;
    totalSessions: number;
    schedule: ScheduleSlot[];
}

export const Students = () => {
    useEffect(() => { document.title = 'الطلاب | دارين السابعة للتعليم والتدريب'; }, []);
    const queryClient = useQueryClient();
    const showNotification = useShowNotification();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterGrade, setFilterGrade] = useState('');
    const [filterCurriculum, setFilterCurriculum] = useState('');
    const [notifyingStudent, setNotifyingStudent] = useState<Student | null>(null);
    const [fabOpen, setFabOpen] = useState(false);
    const { students: allStudents, isLoading: loadingStudents, createStudent, updateStudent, deleteAllStudents } = useStudents();

    const uniqueGrades = useMemo(() =>
        [...new Set(allStudents.map(s => s.grade).filter(Boolean))].sort() as string[],
    [allStudents]);

    const uniqueCurriculums = useMemo(() =>
        [...new Set(allStudents.map(s => s.curriculum).filter(Boolean))].sort() as string[],
    [allStudents]);

    const students = useMemo(() =>
        allStudents.filter(student => {
            const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.parentPhone?.includes(searchTerm) ||
                student.studentPhone?.includes(searchTerm) ||
                student.grade.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesGrade = !filterGrade || student.grade === filterGrade;
            const matchesCurriculum = !filterCurriculum || student.curriculum === filterCurriculum;
            return matchesSearch && matchesGrade && matchesCurriculum;
        }),
    [allStudents, searchTerm, filterGrade, filterCurriculum]);

    const { teachers, isLoading: loadingTeachers } = useTeachers();

    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [drawerStudent, setDrawerStudent] = useState<Student | null>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isDeletingAll, setIsDeletingAll] = useState(false);
    const [isAddingEnrollment, setIsAddingEnrollment] = useState(false);

    const loading = loadingStudents || loadingTeachers;

    const activeEnrollments = useMemo(() =>
        allStudents.reduce((acc, s) => acc + (s.enrollments?.length || 0), 0),
    [allStudents]);
    const totalExpectedSessions = useMemo(() =>
        allStudents.reduce((acc, s) =>
            acc + (s.enrollments?.reduce((enAcc, en) => enAcc + (en.sessionsTotal || 0), 0) || 0), 0
        ),
    [allStudents]);
    const averageSessions = useMemo(() =>
        allStudents.length > 0 ? Math.round(totalExpectedSessions / allStudents.length) : 0,
    [allStudents.length, totalExpectedSessions]);
    const totalEnrollments = useMemo(() =>
        allStudents.reduce((acc, s) => acc + (s.enrollments?.length || 0), 0),
    [allStudents]);
    const completedSessions = useMemo(() =>
        allStudents.reduce((acc, s) => acc + (s.enrollments?.reduce((ea, en) => ea + (en.sessionsUsed || 0), 0) || 0), 0),
    [allStudents]);

    const handleAddOrUpdateStudent = (data: Omit<Student, 'id' | 'enrollments'>) => {
        if (editId) {
            const existing = students.find(s => s.id === editId);
            if (existing) {
                updateStudent({ ...existing, ...data } as Student);
            }
        } else {
            createStudent({ ...data, enrollments: [] } as Omit<Student, 'id'>);
        }
        setShowAddForm(false);
        setEditId(null);
    };

    const handleEditStudent = (student: Student) => {
        setEditId(student.id);
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAddEnrollment = async (student: Student, enrollData: EnrollmentFormData) => {
        if (!student) return;
        setIsAddingEnrollment(true);

        try {
            const created = await api.post('/enrollments', {
                studentId: student.id,
                teacherId: enrollData.teacherId || null,
                teacher: enrollData.teacher,
                subject: enrollData.subject,
                curr: enrollData.curr,
                curriculum: enrollData.curriculum || '',
                sessionsTotal: enrollData.totalSessions,
                schedule: enrollData.schedule,
                sessions: generateSessionDates(enrollData.schedule, enrollData.totalSessions).map(info => ({
                    date: info.date.toISOString().split('T')[0],
                    day: info.slot.day,
                    time: `${info.slot.hour} ${info.slot.period === 'am' ? 'صباحاً' : 'مساءً'}`,
                }))
            });

            queryClient.invalidateQueries({ queryKey: ['students'] });
            const updatedStudent = {
                ...student,
                enrollments: [...(student.enrollments || []), created]
            };
            setSelectedStudent(prev => (prev?.id === student.id ? updatedStudent : prev));
            setDrawerStudent(prev => (prev?.id === student.id ? updatedStudent : prev));
            showNotification('تم إضافة الاشتراك والجلسات بنجاح', 'success');
        } catch (error) {
            console.error('Error adding enrollment:', error);
            showNotification(error?.message || 'فشل إضافة الاشتراك', 'error');
        } finally {
            setIsAddingEnrollment(false);
        }
    };

    const handleAddSessions = async (index: number, amount: number) => {
        if (!selectedStudent) return;
        const enrollment = selectedStudent.enrollments?.[index];
        if (!enrollment) return;

        const updatedEnrollments = [...(selectedStudent.enrollments || [])];
        updatedEnrollments[index] = { ...enrollment, sessionsTotal: enrollment.sessionsTotal + amount };

        const updatedStudent = { ...selectedStudent, enrollments: updatedEnrollments };
        updateStudent(updatedStudent);
        setSelectedStudent(updatedStudent);
        queryClient.invalidateQueries({ queryKey: ['students'] });
        showNotification(`تمت إضافة ${amount} حصة بنجاح`, 'success');
    };

    const handleSendStudentNotification = async (message: string) => {
        if (!notifyingStudent) return;
        try {
            await api.post('/notifications', {
                receiverId: notifyingStudent.id,
                senderName: 'الإدارة',
                title: 'تنبيه من الإدارة',
                message,
                type: 'info',
                time: new Date().toISOString(),
                read: false
            });
            showNotification('تم إرسال التنبيه للطالب بنجاح', 'success');
        } catch (e) {
            console.error(e);
            showNotification('فشل إرسال التنبيه', 'error');
        } finally {
            setNotifyingStudent(null);
        }
    };

    const kpiCards = useMemo(() => [
        { label: 'إجمالي الطلاب', value: allStudents.length, icon: Users, gradient: 'from-primary/20 to-primary/5', iconBg: 'bg-primary/10 text-primary', accent: 'bg-primary' },
        { label: 'الاشتراكات النشطة', value: activeEnrollments, icon: BookOpen, gradient: 'from-success/20 to-success/5', iconBg: 'bg-success/10 text-success', accent: 'bg-success' },
        { label: 'حصص مكتملة', value: completedSessions, icon: Star, gradient: 'from-warning/20 to-warning/5', iconBg: 'bg-warning/10 text-warning', accent: 'bg-warning' },
        { label: 'متوسط الحصص', value: averageSessions, icon: GraduationCap, gradient: 'from-info/20 to-info/5', iconBg: 'bg-info/10 text-info', accent: 'bg-info' },
    ], [allStudents.length, activeEnrollments, completedSessions, averageSessions]);

    const fabActions = useMemo(() => [
        { icon: Plus, label: 'إضافة طالب', onClick: () => { setEditId(null); setShowAddForm(true); } },
        { icon: Bell, label: 'إرسال إشعار', onClick: () => { if (students.length > 0) setNotifyingStudent(students[0]); } },
        { icon: Filter, label: 'تصفية متقدمة', onClick: () => document.querySelector('[data-filters]')?.scrollIntoView({ behavior: 'smooth' }) },
    ], [students]);

    if (loading) {
        return (
            <div className="min-h-full pb-24 overflow-x-hidden relative bg-background" dir="rtl">
                <div className="relative z-10 max-w-page mx-auto px-2 space-y-4">
                    <Skeleton className="h-36 w-full rounded-2xl" />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
                    </div>
                    <Skeleton className="h-10 w-full rounded-2xl" />
                    <Skeleton className="h-96 w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative bg-background" dir="rtl">
            <div className="relative z-10 max-w-page mx-auto px-2 space-y-4">

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-6 md:p-8">
                    {particles.map(p => (
                        <motion.div key={p.id} className="absolute rounded-full bg-white/10" style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
                            animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }} />
                    ))}
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-xl bg-white/15 backdrop-blur-sm"><GraduationCap className="text-white" size={20} /></div>
                                <span className="text-white/70 text-xs font-medium">إدارة الطلاب</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">الطلاب</h1>
                            <p className="text-white/70 text-sm">إدارة بيانات الطلاب والاشتراكات والجلسات</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                            <div className="text-center">
                                <p className="text-white/60 text-xs mb-1">إجمالي الطلاب</p>
                                <div className="text-2xl font-bold text-white"><AnimatedCounter value={allStudents.length} /></div>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-center">
                                <p className="text-white/60 text-xs mb-1">الاشتراكات</p>
                                <div className="text-2xl font-bold text-white"><AnimatedCounter value={activeEnrollments} /></div>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-center">
                                <p className="text-white/60 text-xs mb-1">الحصص المكتملة</p>
                                <div className="text-2xl font-bold text-white"><AnimatedCounter value={completedSessions} /></div>
                            </div>
                        </div>
                    </div>
                    <div className="relative mt-4">
                        <svg className="absolute start-3 top-1/2 -translate-y-1/2 text-white/40" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                        </svg>
                        <input type="text" aria-label="بحث عن طالب" placeholder="ابحث بالاسم أو الهاتف أو المرحلة..." value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-bold ps-9 pe-3 py-2.5 outline-none focus:bg-white/20 focus:border-white/40 rounded-xl transition-all placeholder:text-white/40" />
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                                    <AnimatedCounter value={kpi.value} />
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    {showAddForm && (
                        <div className="bg-card border border-border shadow-elevation-1 p-4 md:p-6 rounded-2xl">
                            <StudentForm
                                initialData={editId ? allStudents.find(s => s.id === editId) : null}
                                teachers={teachers}
                                onSubmit={handleAddOrUpdateStudent}
                                onCancel={() => { setShowAddForm(false); setEditId(null); }}
                            />
                        </div>
                    )}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    {isDeletingAll && (
                        <div className="border border-error-soft bg-error-soft p-4 flex items-center justify-between rounded-2xl">
                            <div className="flex items-center gap-3">
                                <AlertCircle size={18} className="text-error" />
                                <span className="text-xs font-bold text-error">هل أنت متأكد من حذف جميع الطلاب؟</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={async () => { await deleteAllStudents(); setIsDeletingAll(false); }} className="h-8 px-4 bg-error text-on-error text-micro font-bold hover:bg-error-hover transition-all rounded-2xl">تأكيد الحذف</button>
                                <button onClick={() => setIsDeletingAll(false)} className="h-8 px-4 bg-surface text-main text-micro font-bold border border-border transition-all rounded-2xl">إلغاء</button>
                            </div>
                        </div>
                    )}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} data-filters>
                    <StudentsFilters filterGrade={filterGrade} uniqueGrades={uniqueGrades} onGradeChange={setFilterGrade} filterCurriculum={filterCurriculum} uniqueCurriculums={uniqueCurriculums} onCurriculumChange={setFilterCurriculum} />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                    <div className="p-5 md:p-6 bg-card border border-border shadow-elevation-1 rounded-2xl">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 flex items-center justify-center ring-1 ring-success/20 bg-success-soft text-success rounded-xl">
                                <TrendingUp size={16} />
                            </div>
                            <h2 className="text-sm font-bold text-main">إحصائيات الطلاب</h2>
                        </div>
                        <StudentStats
                            totalStudents={allStudents.length}
                            activeEnrollments={activeEnrollments}
                            uniqueGrades={uniqueGrades.length}
                            averageSessionsPerStudent={averageSessions}
                        />
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <StudentsToolbar filteredCount={students.length} totalCount={allStudents.length} onDeleteAll={() => setIsDeletingAll(true)} />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                    {!drawerStudent ? (
                        <StudentTable
                            students={students}
                            onEdit={handleEditStudent}
                            onDelete={(id) => setDeletingId(id)}
                            onSelect={(student) => setDrawerStudent(student)}
                            onNotify={(student) => setNotifyingStudent(student)}
                            selectedId={drawerStudent?.id}
                        />
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                            <StudentDrawer
                                student={drawerStudent}
                                onClose={() => setDrawerStudent(null)}
                                teachers={teachers}
                                isAddingProgram={isAddingEnrollment}
                                onAddProgram={(data) => drawerStudent && handleAddEnrollment(drawerStudent, data)}
                                inline
                            />
                        </motion.div>
                    )}
                </motion.div>
            </div>

            {/* Student details now render inline above */}

            <SendNotificationModal
                isOpen={!!notifyingStudent}
                title="إرسال إشعار للطالب"
                recipientName={notifyingStudent?.name || ''}
                onSend={handleSendStudentNotification}
                onClose={() => setNotifyingStudent(null)}
            />

            <ConfirmModal
                isOpen={!!deletingId}
                title="حذف طالب"
                message="سيتم حذف كافة بيانات الطالب. هل أنت متأكد؟"
                onConfirm={async () => {
                    if (deletingId) {
                        try {
                            await api.delete(`/students/${deletingId}`);
                            queryClient.invalidateQueries({ queryKey: ['students'] });
                            showNotification('تم حذف الطالب بنجاح', 'success');
                        } catch (e) {
                            console.error(e);
                            showNotification('فشل حذف الطالب', 'error');
                        }
                        setDeletingId(null);
                    }
                }}
                onClose={() => setDeletingId(null)}
            />

            <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
                <AnimatePresence>
                    {fabOpen && fabActions.map((action, i) => (
                        <motion.div key={action.label} initial={{ opacity: 0, scale: 0.3, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.3, y: 20 }} transition={{ delay: 0.05 * (fabActions.length - 1 - i) }} className="flex items-center gap-2">
                            <span className="bg-card border border-border text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap">{action.label}</span>
                            <button onClick={() => { action.onClick(); setFabOpen(false); }}
                                className="w-10 h-10 rounded-full bg-primary text-white shadow-lg hover:shadow-xl hover:bg-primary-hover transition-all flex items-center justify-center">
                                <action.icon size={18} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <motion.button onClick={() => setFabOpen(!fabOpen)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className={cn("w-12 h-12 rounded-full shadow-xl text-white flex items-center justify-center transition-all", fabOpen ? "bg-error rotate-45" : "bg-primary")}>
                    <Plus size={24} />
                </motion.button>
            </div>
        </div>
    );
};

export default Students;
