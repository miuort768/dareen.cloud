import { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { User, Users, Plus, Award, Star, TrendingUp, Filter, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, safeArray } from '../../../lib/api';
import { useCurrentUser } from '../../../context/AppContext';
import { confirm } from '../../../lib/confirmDialog';
import { EvaluationsHeader } from '../components/EvaluationsHeader';
import { EvaluationCard } from '../components/EvaluationCard';
import { EvaluationDrawer } from '../components/EvaluationDrawer';
import { EvaluationFormModal } from '../components/EvaluationFormModal';
import type { Student, Evaluation } from '../../../types';
import { cn } from '../../../lib/utils';

const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 5 + 2, duration: Math.random() * 6 + 4, delay: Math.random() * 3,
}));

export const Evaluations = () => {
    useEffect(() => { document.title = 'التقييمات | دارين السابعة للتعليم والتدريب'; }, []);
    const currentUser = useCurrentUser();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [profileStudent, setProfileStudent] = useState<Student | null>(null);
    const [formData, setFormData] = useState({ studentId: '', rating: 'ممتاز', points: 0, notes: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [fabOpen, setFabOpen] = useState(false);
    const resetForm = () => setFormData({ studentId: '', rating: 'ممتاز', points: 0, notes: '' });

    const { data, isLoading } = useQuery({
        queryKey: ['evaluations-data', currentUser?.id, currentUser?.role],
        queryFn: async () => {
            if (currentUser?.role === 'parent') {
                const myChildren = await api.get<Student[]>('/parents/my-children');
                const children = safeArray<Student>(myChildren);
                const evalsPromises = children.map(c =>
                    api.get<Evaluation[]>(`/evaluations/student/${c.id}`).catch(() => [] as Evaluation[])
                );
                const allEvalsResults = await Promise.all(evalsPromises);
                return { students: children, evaluations: allEvalsResults.flat() };
            }
            const studentsRes = await api.get<Student[]>('/students');
            const studentsList = safeArray<Student>(studentsRes);
            let evalsUrl = '/evaluations';
            if (currentUser?.role === 'teacher') evalsUrl = `/evaluations/teacher/${currentUser.id}`;
            const evalsRes = await api.get<Evaluation[]>(evalsUrl);
            return { students: studentsList, evaluations: evalsRes };
        },
        enabled: !!currentUser,
    });

    const evaluations = data?.evaluations ?? [];
    const students = data?.students ?? [];

    const createMutation = useMutation({
        mutationFn: async (payload: Record<string, unknown>) => api.post('/evaluations', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['evaluations-data'] });
            setIsModalOpen(false);
            resetForm();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/evaluations/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['evaluations-data'] }),
    });

    const teacherStudents = useMemo(() => {
        if (!currentUser) return [];
        if (currentUser.role === 'admin') return students;
        if (currentUser.role === 'teacher') {
            return students.filter(s =>
                s.enrollments?.some(e =>
                    e.teacherId === currentUser.id ||
                    e.teacher === (currentUser.teacherName || currentUser.name)
                )
            );
        }
        return students;
    }, [students, currentUser]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (createMutation.isPending) return;
        const payload = { ...formData, teacherId: currentUser?.id, teacherName: currentUser?.teacherName || currentUser?.name };
        createMutation.mutate(payload);
    };

    const handleDelete = async (id: string) => {
        if (!(await confirm({ title: 'حذف التقييم', description: 'هل أنت متأكد من حذف هذا التقييم؟ سيتم خصم النقاط من الطالب.', confirmText: 'حذف', cancelText: 'إلغاء' }))) return;
        deleteMutation.mutate(id);
    };

    const sortedStudents = useMemo(() => {
        if (!teacherStudents.length) return [];
        let filtered = teacherStudents.filter(s =>
            !searchTerm ||
            (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.grade || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (filterStatus === 'evaluated') {
            const evaluatedIds = new Set(evaluations.map(ev => ev.studentId));
            filtered = filtered.filter(s => evaluatedIds.has(s.id));
        } else if (filterStatus === 'not-evaluated') {
            const evaluatedIds = new Set(evaluations.map(ev => ev.studentId));
            filtered = filtered.filter(s => !evaluatedIds.has(s.id));
        } else if (filterStatus === 'highest-xp') {
            filtered = [...filtered].sort((a, b) => {
                const xpA = evaluations.filter(ev => ev.studentId === a.id).reduce((s, ev) => s + (ev.points || 0), 0);
                const xpB = evaluations.filter(ev => ev.studentId === b.id).reduce((s, ev) => s + (ev.points || 0), 0);
                return xpB - xpA;
            });
        } else if (filterStatus === 'lowest-xp') {
            filtered = [...filtered].sort((a, b) => {
                const xpA = evaluations.filter(ev => ev.studentId === a.id).reduce((s, ev) => s + (ev.points || 0), 0);
                const xpB = evaluations.filter(ev => ev.studentId === b.id).reduce((s, ev) => s + (ev.points || 0), 0);
                return xpA - xpB;
            });
        } else {
            filtered = [...filtered].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
        }
        return filtered;
    }, [teacherStudents, searchTerm, filterStatus, evaluations]);

    const totalXP = useMemo(() => evaluations.reduce((sum, ev) => sum + (ev.points || 0), 0), [evaluations]);

    const stats = useMemo(() => {
        const evaluatedIds = new Set(evaluations.map(ev => ev.studentId));
        const evaluatedCount = teacherStudents.filter(s => evaluatedIds.has(s.id)).length;
        const notEvaluatedCount = teacherStudents.filter(s => !evaluatedIds.has(s.id)).length;
        const rMap: Record<string, number> = { 'ممتاز': 5, 'جيد جدًا': 4, 'جيد': 3, 'يحتاج تحسين': 2 };
        const avg = evaluations.length > 0
            ? Math.round((evaluations.reduce((s, ev) => s + (rMap[ev.rating] || 3), 0) / evaluations.length) * 10) / 10
            : 0;
        return {
            totalStudents: teacherStudents.length,
            evaluatedCount,
            notEvaluatedCount,
            avgRating: avg > 0 ? avg.toFixed(1) : '—',
            totalXP,
        };
    }, [teacherStudents, evaluations, totalXP]);

    const kpiCards = useMemo(() => [
        { label: 'إجمالي الطلاب', value: stats.totalStudents, icon: Users, gradient: 'from-primary/20 to-primary/5', iconBg: 'bg-primary/10 text-primary', accent: 'bg-primary' },
        { label: 'تم تقييمهم', value: stats.evaluatedCount, icon: Star, gradient: 'from-success/20 to-success/5', iconBg: 'bg-success/10 text-success', accent: 'bg-success' },
        { label: 'إجمالي XP', value: stats.totalXP, icon: Award, gradient: 'from-warning/20 to-warning/5', iconBg: 'bg-warning/10 text-warning', accent: 'bg-warning' },
        { label: 'متوسط التقييم', value: stats.avgRating, icon: TrendingUp, gradient: 'from-info/20 to-info/5', iconBg: 'bg-info/10 text-info', accent: 'bg-info' },
    ], [stats]);

    const fabActions = useMemo(() => [
        { icon: Plus, label: 'إضافة تقييم', onClick: () => setIsModalOpen(true) },
        { icon: BarChart3, label: 'تصفية متقدمة', onClick: () => document.querySelector('[data-filters]')?.scrollIntoView({ behavior: 'smooth' }) },
        { icon: Award, label: 'أعلى XP', onClick: () => { setFilterStatus('highest-xp'); document.querySelector('[data-cards]')?.scrollIntoView({ behavior: 'smooth' }); } },
    ], []);

    if (currentUser?.role === 'teacher') return <Navigate to="/" replace />;

    if (isLoading) return (
        <div className="space-y-3 p-4 bg-background min-h-full">
            <div className="h-52 bg-card rounded-2xl animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {[...Array(8)].map((_, i) => <div key={`eval-${i}`} className="h-52 bg-card rounded-2xl animate-pulse" />)}
            </div>
        </div>
    );

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative font-sans bg-background" dir="rtl">
            <div className="relative z-10 max-w-page mx-auto px-2 space-y-3">
                <div className="relative overflow-hidden rounded-2xl">
                    {particles.map(p => (
                        <motion.div key={p.id} className="absolute rounded-full bg-white/10 pointer-events-none z-10"
                            style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
                            animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }} />
                    ))}
                    <EvaluationsHeader stats={stats} showAddButton={currentUser?.role !== 'parent'}
                        searchTerm={searchTerm} onSearchChange={setSearchTerm} filterStatus={filterStatus}
                        onFilterStatusChange={setFilterStatus} onAddClick={() => setIsModalOpen(true)} />
                </div>

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
                                    <p className="text-2xl font-bold text-main">{kpi.value}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} data-cards>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {sortedStudents.map((student, idx) => (
                            <motion.div key={student.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * idx }}>
                                <EvaluationCard student={student} evaluations={evaluations} isParent={currentUser?.role === 'parent'}
                                    onAddEvaluation={(studentId) => { setFormData({ ...formData, studentId }); setIsModalOpen(true); }}
                                    onViewHistory={setProfileStudent} onViewProfile={setProfileStudent} />
                            </motion.div>
                        ))}
                        {sortedStudents.length === 0 && (
                            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-surface border border-dashed border-border rounded-2xl">
                                <div className="w-12 h-12 mx-auto flex items-center justify-center mb-3 rounded-xl bg-primary-soft">
                                    <User size={20} className="text-primary" />
                                </div>
                                <h3 className="text-xs font-bold text-main mb-1">{searchTerm ? 'لا توجد نتائج للبحث' : 'لا يوجد طلاب مسجلون'}</h3>
                                <p className="text-[10px] text-muted">{searchTerm ? 'جرب كلمات مختلفة' : 'سيظهر الطلاب هنا بعد التسجيل'}</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                <EvaluationFormModal isOpen={isModalOpen} formData={formData} students={students}
                    teacherStudents={teacherStudents} isSubmitting={createMutation.isPending}
                    onClose={() => { setIsModalOpen(false); resetForm(); }} onChange={setFormData} onSubmit={onSubmit} />

                <EvaluationDrawer student={profileStudent} evaluations={evaluations}
                    canDelete={(ev: Evaluation) => currentUser?.role === 'admin' || currentUser?.id === ev.teacherId}
                    onDelete={handleDelete} onClose={() => setProfileStudent(null)} />
            </div>

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

export default Evaluations;
