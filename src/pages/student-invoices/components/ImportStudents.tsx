import { api } from '../../../lib/api';

interface ConfirmModalState {
    isOpen: boolean;
    title?: string;
    message?: string;
    onConfirm?: () => void | Promise<void>;
}

interface StudentRecord {
    id: string;
    name: string;
    sessionPrice?: number;
}

interface SessionRecord {
    studentId: string;
    status: string;
    subject: string;
    teacherName: string;
    price?: number;
    date: string;
}

interface InvoiceRecord {
    studentId: string;
}

interface UseImportStudentsProps {
    setLoading: (v: boolean) => void;
    showNotification: (msg: string, type: 'success' | 'error') => void;
    fetchData: () => void;
    setConfirmModal: React.Dispatch<React.SetStateAction<ConfirmModalState>>;
}

export const useImportStudents = ({ setLoading, showNotification, fetchData, setConfirmModal }: UseImportStudentsProps) => {
    const handleImportStudents = async () => {
        try {
            setLoading(true);
            const [studentsList, allSessionsData, currentInvoices] = await Promise.all([
                api.get<StudentRecord[]>('/students'),
                api.get<SessionRecord[]>('/sessions'),
                api.get<InvoiceRecord[]>('/studentInvoices')
            ]);

            const currentStudentIds = new Set(
                (Array.isArray(currentInvoices) ? currentInvoices : (currentInvoices as { data: InvoiceRecord[] }).data || [])
                    .map((inv) => inv.studentId)
            );

            const studentsToImport = studentsList.filter((s) => {
                const hasNoInvoice = !currentStudentIds.has(s.id);
                const hasSessions = allSessionsData.some((sess) =>
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
                    onConfirm: () => { setConfirmModal((prev) => ({ ...prev, isOpen: false })); }
                });
                setLoading(false);
                return;
            }

            setConfirmModal({
                isOpen: true,
                title: 'استيراد الطلاب',
                message: `سيتم استيراد ${studentsToImport.length} طالب جديد وإصدار كشوفات حضور لهم بناءً على الحصص المسجلة. هل تريد الاستمرار؟`,
                onConfirm: async () => {
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                    try {
                        setLoading(true);
                        const importPromises = studentsToImport.map((s) => {
                            const studentSessions = allSessionsData.filter((sess) =>
                                sess.studentId === s.id &&
                                (sess.status === 'completed' || sess.status === 'cancelled')
                            );

                            const items = studentSessions.map((sess) => ({
                                description: `${sess.subject} - ${sess.teacherName} (${sess.status === 'completed' ? 'حضور' : 'غياب'})`,
                                amount: sess.price || s.sessionPrice || 0,
                                date: sess.date
                            }));

                            const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);
                            const subjects = Array.from(new Set(studentSessions.map((sess) => sess.subject))).join(' + ');

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
