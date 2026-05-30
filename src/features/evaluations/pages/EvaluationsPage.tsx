import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { User } from 'lucide-react';
import { api } from '../../../lib/api';
import { useCurrentUser } from '../../../context/AppContext';
import { EvaluationsHeader } from '../components/EvaluationsHeader';
import { EvaluationCard } from '../components/EvaluationCard';
import { EvaluationFormModal } from '../components/EvaluationFormModal';
import { HistoryModal } from '../components/HistoryModal';
import type { Student, Evaluation } from '../../../types';

export const Evaluations = () => {
    const currentUser = useCurrentUser();
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const mountedRef = useRef(true);

    const fetchData = useCallback(async () => {
        if (!mountedRef.current) return;
        try {
            setIsLoading(true);
            if (currentUser?.role === 'parent') {
                const myChildren = await api.get<Student[]>('/parents/my-children');
                if (!mountedRef.current) return;
                setStudents(myChildren);
                const evalsPromises = myChildren.map(c => api.get<Evaluation[]>(`/evaluations/student/${c.id}`));
                const allEvalsResults = await Promise.all(evalsPromises);
                if (!mountedRef.current) return;
                setEvaluations(allEvalsResults.flat());
            } else {
                const studentsRes = await api.get<Student[]>('/students');
                if (!mountedRef.current) return;
                setStudents(studentsRes);
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
        try {
            const payload = { ...formData, teacherId: currentUser?.id, teacherName: currentUser?.teacherName || currentUser?.name };
            await api.post('/evaluations', payload);
            setIsModalOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('Error submitting evaluation', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا التقييم؟ سيتم خصم النقاط من الطالب.')) return;
        try { await api.delete(`/evaluations/${id}`); fetchData(); }
        catch (error) { console.error('Error deleting evaluation', error); }
    };

    const totalXP = useMemo(() => evaluations.reduce((sum, ev) => sum + (ev.points || 0), 0), [evaluations]);

    if (isLoading) return (
        <div className="space-y-4 p-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-none" />)}
        </div>
    );

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative font-sans" dir="rtl">
            <div className="relative z-10 max-w-[1600px] mx-auto px-2">
                <EvaluationsHeader
                    totalXP={totalXP}
                    showAddButton={currentUser?.role !== 'parent'}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onAddClick={() => setIsModalOpen(true)}
                />
                <div className="px-2 md:px-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {teacherStudents.filter(s =>
                            !searchTerm ||
                            (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (s.grade || '').toLowerCase().includes(searchTerm.toLowerCase())
                        ).map((student) => (
                            <EvaluationCard
                                key={student.id}
                                student={student}
                                evaluations={evaluations}
                                isParent={currentUser?.role === 'parent'}
                                onAddEvaluation={(studentId) => { setFormData({ ...formData, studentId }); setIsModalOpen(true); }}
                                onViewHistory={setHistoryModalStudent}
                            />
                        ))}
                        {teacherStudents.length === 0 && (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm rounded-none">
                                <div className="w-20 h-20 mx-auto flex items-center justify-center mb-4 rounded-none" style={{ backgroundColor: '#00542F08', border: '2px dashed', borderColor: '#00542F30' }}>
                                    <User size={36} style={{ color: '#00542F' }} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-700 dark:text-white mb-1">لا يوجد طلاب مسجلون حالياً</h3>
                                <p className="text-sm font-medium text-slate-400 max-w-xs">بمجرد تعيين طلاب لكِ، سيظهرون هنا تلقائياً.</p>
                            </div>
                        )}
                    </div>
                </div>
                <EvaluationFormModal
                    isOpen={isModalOpen}
                    formData={formData}
                    students={students}
                    teacherStudents={teacherStudents}
                    onClose={() => { setIsModalOpen(false); resetForm(); }}
                    onChange={setFormData}
                    onSubmit={onSubmit}
                />
                <HistoryModal
                    student={historyModalStudent}
                    evaluations={evaluations}
                    canDelete={(ev: Evaluation) => currentUser?.role === 'admin' || currentUser?.id === ev.teacherId}
                    onDelete={handleDelete}
                    onClose={() => setHistoryModalStudent(null)}
                />
            </div>
        </div>
    );
};
