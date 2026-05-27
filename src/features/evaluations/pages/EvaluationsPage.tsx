import { useState, useEffect, useMemo, useCallback } from 'react';
import { User } from 'lucide-react';
import { api } from '../../../lib/api';
import { useCurrentUser } from '../../../context/AppContext';
import { EvaluationsHeader } from '../components/EvaluationsHeader';
import { EvaluationCard } from '../components/EvaluationCard';
import { EvaluationFormModal } from '../components/EvaluationFormModal';
import { HistoryModal } from '../components/HistoryModal';

export const Evaluations = () => {
    const currentUser = useCurrentUser();
    const [evaluations, setEvaluations] = useState<Record<string, unknown>[]>([]);
    const [students, setStudents] = useState<Record<string, unknown>[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [historyModalStudent, setHistoryModalStudent] = useState<Record<string, unknown> | null>(null);

    const [formData, setFormData] = useState({
        studentId: '', rating: 'ممتاز', points: 0, notes: ''
    });
    const [searchTerm, setSearchTerm] = useState('');

    const resetForm = () => setFormData({ studentId: '', rating: 'ممتاز', points: 0, notes: '' });

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            if (currentUser?.role === 'parent') {
                const myChildren = await api.get<Record<string, unknown>[]>('/parents/my-children');
                setStudents(myChildren);
                const evalsPromises = myChildren.map(c => api.get<Record<string, unknown>[]>(`/evaluations/student/${c.id}`));
                const allEvalsResults = await Promise.all(evalsPromises);
                setEvaluations(allEvalsResults.flat());
            } else {
                const studentsRes = await api.get<Record<string, unknown>[]>('/students');
                setStudents(studentsRes);
                let evalsUrl = '/evaluations';
                if (currentUser?.role === 'teacher') evalsUrl = `/evaluations/teacher/${currentUser.id}`;
                const evalsRes = await api.get<Record<string, unknown>[]>(evalsUrl);
                setEvaluations(evalsRes);
            }
        } catch (error) {
            console.error('Error fetching evaluations:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    useEffect(() => { fetchData(); }, [currentUser, fetchData]);

    const teacherStudents = useMemo(() => {
        if (!currentUser) return [];
        if (currentUser.role === 'admin') return students;
        if (currentUser.role === 'teacher') {
            return students.filter(s =>
                (s.enrollments as Record<string, unknown>[])?.some((e: Record<string, unknown>) =>
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

    const totalXP = useMemo(() => evaluations.reduce((sum, ev) => sum + ((ev.points as number) || 0), 0), [evaluations]);

    if (isLoading) return (
        <div className="space-y-4 p-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-xl" />)}
        </div>
    );

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative bg-gradient-to-br from-slate-50 via-white to-rose-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-rose-950/20 font-sans" dir="rtl">
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] opacity-50 pointer-events-none" />
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
                            ((s.name as string) || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            ((s.grade as string) || '').toLowerCase().includes(searchTerm.toLowerCase())
                        ).map((student) => (
                            <EvaluationCard
                                key={student.id as string}
                                student={student}
                                evaluations={evaluations}
                                isParent={currentUser?.role === 'parent'}
                                onAddEvaluation={(studentId) => { setFormData({ ...formData, studentId }); setIsModalOpen(true); }}
                                onViewHistory={setHistoryModalStudent}
                            />
                        ))}
                        {teacherStudents.length === 0 && (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                <div className="w-20 h-20 mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-sm flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700">
                                    <User size={36} className="text-slate-300" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-700 dark:text-white mb-1">لا يوجد طلاب مسجلون حالياً</h3>
                                <p className="text-sm text-slate-400 max-w-xs">بمجرد تعيين طلاب لكِ، سيظهرون هنا تلقائياً.</p>
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
                    canDelete={(ev) => currentUser?.role === 'admin' || currentUser?.id === ev.teacherId}
                    onDelete={handleDelete}
                    onClose={() => setHistoryModalStudent(null)}
                />
            </div>
        </div>
    );
};
