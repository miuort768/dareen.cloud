import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { api, safeArray } from '../../../lib/api';
import { useCurrentUser } from '../../../context/AppContext';
import { EvaluationsHeader } from '../components/EvaluationsHeader';
import { EvaluationCard } from '../components/EvaluationCard';
import { EvaluationDrawer } from '../components/EvaluationDrawer';
import { EvaluationFormModal } from '../components/EvaluationFormModal';
import type { Student, Evaluation } from '../../../types';

export const Evaluations = () => {
    useEffect(() => { document.title = 'التقييمات | دارين السابعة للتعليم والتدريب'; }, []);
    const currentUser = useCurrentUser();
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [profileStudent, setProfileStudent] = useState<Student | null>(null);
    const [formData, setFormData] = useState({ studentId: '', rating: 'ممتاز', points: 0, notes: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const mountedRef = useRef(true);
    const resetForm = () => setFormData({ studentId: '', rating: 'ممتاز', points: 0, notes: '' });

    const fetchData = useCallback(async () => {
        if (!mountedRef.current) return;
        try {
            setIsLoading(true);
            if (currentUser?.role === 'parent') {
                const myChildren = await api.get<Student[]>('/parents/my-children');
                if (!mountedRef.current) return;
                setStudents(safeArray<Student>(myChildren));
                const evalsPromises = myChildren.map(c => api.get<Evaluation[]>(`/evaluations/student/${c.id}`).catch(() => [] as Evaluation[]));
                const allEvalsResults = await Promise.all(evalsPromises);
                if (!mountedRef.current) return;
                setEvaluations(allEvalsResults.flat());
            } else {
                const studentsRes = await api.get<Student[]>('/students');
                if (!mountedRef.current) return;
                setStudents(safeArray<Student>(studentsRes));
                let evalsUrl = '/evaluations';
                if (currentUser?.role === 'teacher') evalsUrl = `/evaluations/teacher/${currentUser.id}`;
                const evalsRes = await api.get<Evaluation[]>(evalsUrl);
                if (!mountedRef.current) return;
                setEvaluations(evalsRes);
            }
        } catch (error) {
            console.error('Error fetching evaluations:', error);
        } finally {
            if (mountedRef.current) setIsLoading(false);
        }
    }, [currentUser]);

    useEffect(() => { mountedRef.current = true; fetchData(); return () => { mountedRef.current = false; }; }, [currentUser, fetchData]);

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
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const payload = { ...formData, teacherId: currentUser?.id, teacherName: currentUser?.teacherName || currentUser?.name };
            await api.post('/evaluations', payload);
            setIsModalOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('Error submitting evaluation', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا التقييم؟ سيتم خصم النقاط من الطالب.')) return;
        try { await api.delete(`/evaluations/${id}`); fetchData(); }
        catch (error) { console.error('Error deleting evaluation', error); }
    };

    const sortedStudents = useMemo(() => {
        if (!teacherStudents.length) return [];
        let filtered = teacherStudents.filter(s =>
            !searchTerm ||
            (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.grade || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
        // Apply filter chips
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
            // Default: sort by XP descending
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
                <EvaluationsHeader
                    stats={stats}
                    showAddButton={currentUser?.role !== 'parent'}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    filterStatus={filterStatus}
                    onFilterStatusChange={setFilterStatus}
                    onAddClick={() => setIsModalOpen(true)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {sortedStudents.map((student) => (
                        <EvaluationCard
                            key={student.id}
                            student={student}
                            evaluations={evaluations}
                            isParent={currentUser?.role === 'parent'}
                            onAddEvaluation={(studentId) => { setFormData({ ...formData, studentId }); setIsModalOpen(true); }}
                            onViewHistory={setProfileStudent}
                            onViewProfile={setProfileStudent}
                        />
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

                <EvaluationFormModal
                    isOpen={isModalOpen}
                    formData={formData}
                    students={students}
                    teacherStudents={teacherStudents}
                    isSubmitting={isSubmitting}
                    onClose={() => { setIsModalOpen(false); resetForm(); }}
                    onChange={setFormData}
                    onSubmit={onSubmit}
                />

                <EvaluationDrawer
                    student={profileStudent}
                    evaluations={evaluations}
                    canDelete={(ev: Evaluation) => currentUser?.role === 'admin' || currentUser?.id === ev.teacherId}
                    onDelete={handleDelete}
                    onClose={() => setProfileStudent(null)}
                />
            </div>
        </div>
    );
};

export default Evaluations;