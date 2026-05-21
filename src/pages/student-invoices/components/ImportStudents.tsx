import { api } from '../../../lib/api';

interface UseImportStudentsProps {
    setLoading: (v: boolean) => void;
    showNotification: (msg: string, type: 'success' | 'error') => void;
    fetchData: () => void;
    setConfirmModal: React.Dispatch<React.SetStateAction<any>>;
}

export const useImportStudents = ({ setLoading, showNotification, fetchData, setConfirmModal }: UseImportStudentsProps) => {
    const handleImportStudents = async () => {
        try {
            setLoading(true);
            const [studentsList, allSessionsData, currentInvoices] = await Promise.all([
                api.get<any[]>('/students'),
                api.get<any[]>('/sessions'),
                api.get<any[]>('/studentInvoices')
            ]);

            const currentStudentIds = new Set(
                (Array.isArray(currentInvoices) ? currentInvoices : (currentInvoices as any).data || [])
                    .map((inv: any) => inv.studentId)
            );

            const studentsToImport = studentsList.filter((s: any) => {
                const hasNoInvoice = !currentStudentIds.has(s.id);
                const hasSessions = allSessionsData.some((sess: any) =>
                    sess.studentId === s.id &&
                    (sess.status === 'completed' || sess.status === 'cancelled')
                );
                return hasNoInvoice && hasSessions;
            });

            if (studentsToImport.length === 0) {
                setConfirmModal({
                    isOpen: true,
                    title: 'لا توجد بيانات جديدة',
                    message: 'جميع الطلاب المسجلين لديهم فواتير بالفعل في القائمة الحالية.',
                    onConfirm: () => { setConfirmModal((prev: any) => ({ ...prev, isOpen: false })); }
                });
                setLoading(false);
                return;
            }

            setConfirmModal({
                isOpen: true,
                title: 'استيراد الطلاب',
                message: `سيتم استيراد ${studentsToImport.length} طالب جديد وإصدار كشوفات حضور لهم بناءً على الحصص المسجلة. هل تريد الاستمرار؟`,
                onConfirm: async () => {
                    setConfirmModal((prev: any) => ({ ...prev, isOpen: false }));
                    try {
                        setLoading(true);
                        const importPromises = studentsToImport.map((s: any) => {
                            const studentSessions = allSessionsData.filter((sess: any) =>
                                sess.studentId === s.id &&
                                (sess.status === 'completed' || sess.status === 'cancelled')
                            );

                            const items = studentSessions.map((sess: any) => ({
                                description: `${sess.subject} - ${sess.teacherName} (${sess.status === 'completed' ? 'حضور' : 'غياب'})`,
                                amount: sess.price || s.sessionPrice || 0,
                                date: sess.date
                            }));

                            const totalAmount = items.reduce((sum: number, i: any) => sum + i.amount, 0);
                            const subjects = Array.from(new Set(studentSessions.map((sess: any) => sess.subject))).join(' + ');

                            return api.post('/studentInvoices', {
                                studentId: s.id,
                                studentName: s.name,
                                amount: totalAmount,
                                description: subjects ? `رسوم حصص: ${subjects}` : 'رسوم شهرية',
                                date: new Date().toLocaleDateString('en-CA'),
                                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA'),
                                status: 'pending',
                                paymentMethod: 'نقدي',
                                notes: 'استيراد تلقائي من سجل الحصص',
                                items: items
                            });
                        });

                        await Promise.all(importPromises);
                        fetchData();
                        showNotification(`تم استيراد ${studentsToImport.length} طالب بنجاح`, 'success');
                    } catch (error) {
                        console.error('Error importing students:', error);
                        showNotification('حدث خطأ أثناء الاستيراد', 'error');
                    } finally {
                        setLoading(false);
                    }
                }
            });
        } catch (error) {
            console.error('Error during import process:', error);
        } finally {
            setLoading(false);
        }
    };

    return { handleImportStudents };
};
