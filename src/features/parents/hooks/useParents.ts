import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parentsService } from '../services/parentsService';
import type { Parent, Enrollment } from '../../../types';
import type { FamilyScheduleItem } from '../types';
import { useShowNotification } from '../../../context/AppContext';
import { canonicalPhone } from '../../../lib/phone';

export const useParents = () => {
    const queryClient = useQueryClient();
    const showNotification = useShowNotification();

    // UI Local State
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [newParent, setNewParent] = useState<{ name: string; phone: string; email: string; username?: string; password?: string }>({
        name: '',
        phone: '',
        email: '',
        username: '',
        password: ''
    });

    const [confirmModal, setConfirmModal] = useState<{
        show: boolean;
        title?: string;
        message: string;
        confirmText?: string;
        variant?: 'danger' | 'primary';
        action: ((password?: string) => void) | null;
    }>({ show: false, message: '', action: null });

    // React Query
    const { data: parents = [], isLoading: isLoadingParents } = useQuery({
        queryKey: ['parents'],
        queryFn: parentsService.getParents
    });

    const { data: students = [], isLoading: isLoadingStudents } = useQuery({
        queryKey: ['students'],
        queryFn: parentsService.getStudents
    });

    const addMutation = useMutation({
        mutationFn: parentsService.addParent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parents'] });
            showNotification('تمت العملية بنجاح', 'success');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<Parent> }) => parentsService.updateParent(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parents'] });
            showNotification('تم التحديث بنجاح', 'success');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: ({ id, password }: { id: string, password?: string }) => parentsService.deleteParent(id, password),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parents'] });
            showNotification('تم الحذف بنجاح', 'success');
        }
    });

    // Handlers
    const handleAddParent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editId) {
                await updateMutation.mutateAsync({ id: editId, data: newParent });
                setEditId(null);
            } else {
                await addMutation.mutateAsync(newParent);
            }
            setShowAddForm(false);
            setNewParent({ name: '', phone: '', email: '', username: '', password: '' });
        } catch (error) {
            console.error("Error saving parent", error);
            showNotification(error.response?.data?.details || error.message || 'فشل في حفظ البيانات', 'error');
        }
    };

    const handleEditParent = (parent: Parent) => {
        setNewParent({
            name: parent.name,
            phone: parent.phone,
            email: parent.email || '',
            username: (parent as { username?: string }).username || parent.phone,
            password: ''
        });
        setEditId(parent.id);
        setShowAddForm(true);
    };

    const handleDeleteParent = (id: string) => {
        setConfirmModal({
            show: true,
            title: 'تأكيد عملية الحذف',
            message: 'هذا الإجراء سيحذف ولي الأمر نهائياً. أدخل كلمة المرور التحذيرية للمتابعة.',
            confirmText: 'نعم، حذف',
            variant: 'danger',
            action: async (password) => {
                await deleteMutation.mutateAsync({ id, password });
                if (selectedParent?.id === id) setShowDetails(false);
            }
        });
    };

    const samePhone = (a?: string | null, b?: string | null) => {
        const ca = canonicalPhone(a);
        const cb = canonicalPhone(b);
        return ca.length > 0 && ca === cb;
    };

    const handleImportParents = async () => {
        const existingPhones = new Set(parents.map(p => canonicalPhone(p.phone)).filter(Boolean));
        const newParentsList: Omit<Parent, 'id'>[] = [];
        const seenPhones = new Set();

        // Grade ranking map
        const gradeRank: Record<string, number> = {
            'تمهيدي': 0, 'روضة': 0, 'kg1': 0, 'kg2': 0,
            'الأول': 1, 'الصف الأول': 1, '1': 1,
            'الثاني': 2, 'الصف الثاني': 2, '2': 2,
            'الثالث': 3, 'الصف الثالث': 3, '3': 3,
            'الرابع': 4, 'الصف الرابع': 4, '4': 4,
            'الخامس': 5, 'الصف الخامس': 5, '5': 5,
            'السادس': 6, 'الصف السادس': 6, '6': 6,
            'السابع': 7, 'الصف السابع': 7, '7': 7,
            'الثامن': 8, 'الصف الثامن': 8, '8': 8,
            'التاسع': 9, 'الصف التاسع': 9, '9': 9,
            'العاشر': 10, 'الصف العاشر': 10, '10': 10,
            'الحادي عشر': 11, 'الصف الحادي عشر': 11, '11': 11,
            'الثاني عشر': 12, 'الصف الثاني عشر': 12, '12': 12, 'توجيهي': 12
        };

        const getGradeRank = (grade: string = '') => {
            const normalized = grade.trim();
            if (gradeRank[normalized] !== undefined) return gradeRank[normalized];
            // Try to extract number
            const match = normalized.match(/\d+/);
            return match ? parseInt(match[0]) : -1;
        };

        // Group students by normalized parent phone
        const studentsByPhone: Record<string, typeof students> = {};
        for (const s of students) {
            const canonical = canonicalPhone(s.parentPhone || '');
            if (canonical && !existingPhones.has(canonical)) {
                if (!studentsByPhone[canonical]) {
                    studentsByPhone[canonical] = [];
                }
                studentsByPhone[canonical].push(s);
            }
        }

        // Create parents from groups
        for (const [phone, familyStudents] of Object.entries(studentsByPhone)) {
            if (!seenPhones.has(phone)) {
                seenPhones.add(phone);
                // Find oldest student
                const oldestStudent = familyStudents.reduce((prev, current) => {
                    return getGradeRank(current.grade) > getGradeRank(prev.grade) ? current : prev;
                });

                newParentsList.push({
                    name: `ولي أمر ${oldestStudent.name}`,
                    phone: phone,
                    email: ''
                });
            }
        }

        if (newParentsList.length === 0) {
            setConfirmModal({
                show: true,
                title: 'الاستيراد من الطلاب',
                message: 'لا يوجد أولياء أمور جدد للاستيراد من قائمة الطلاب حالياً.',
                confirmText: 'حسناً',
                variant: 'primary',
                action: null
            });
            return;
        }

        setConfirmModal({
            show: true,
            title: 'تأكيد الاستيراد',
            message: `تم العثور على ${newParentsList.length} ولي أمر جديد في قائمة الطلاب. هل تريد استيرادهم تلقائياً؟`,
            confirmText: 'بدء الاستيراد',
            variant: 'primary',
            action: async () => {
                const { successCount, failCount, errors } = await parentsService.importParents(newParentsList);
                queryClient.invalidateQueries({ queryKey: ['parents'] });
                queryClient.invalidateQueries({ queryKey: ['students'] });

                setTimeout(() => {
                    let message = failCount === 0
                        ? `تم استيراد ${successCount} ولي أمر بنجاح.`
                        : `تم استيراد ${successCount} ولي أمر، وفشل استيراد ${failCount}.`;
                    if (failCount > 0 && errors.length > 0) {
                        const firstErrors = Array.from(new Set(errors)).slice(0, 3);
                        message += `\nالأسباب: ${firstErrors.join(' | ')}`;
                    }
                    setConfirmModal({
                        show: true,
                        title: 'نتيجة الاستيراد',
                        message,
                        confirmText: 'إغلاق',
                        variant: 'primary',
                        action: null
                    });
                }, 300);
            }
        });
    };

    const handleExportParents = () => {
        try {
            const dataStr = JSON.stringify(parents, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `parents_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showNotification('تم تصدير بيانات أولياء الأمور بنجاح', 'success');
        } catch (e) {
            console.error(e);
            showNotification('حدث خطأ أثناء تصدير البيانات', 'error');
        }
    };

    // Derived Data
    const filteredParents = useMemo(() => {
        return parents.filter(p =>
            (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.phone || '').includes(searchTerm) ||
            (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [parents, searchTerm]);

    const stats = useMemo(() => {
        const linkedStudents = students.filter(s =>
            parents.some(p => samePhone(p.phone, s.parentPhone) || (p.id && s.parent?.id === p.id))
        );
        return {
            totalParents: parents.length,
            totalLinkedStudents: linkedStudents.length
        };
    }, [parents, students]);

    const selectedParentData = useMemo(() => {
        if (!selectedParent) return null;

        const children = students.filter(s =>
            samePhone(selectedParent.phone, s.parentPhone) || s.parent?.id === selectedParent.id
        );

        const DAY_ORDER = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
        const toMinutes = (h: string) => {
            const [hh, mm = '0'] = String(h || '').split(':');
            const mins = parseInt(hh, 10) * 60 + parseInt(mm, 10);
            return Number.isNaN(mins) ? 0 : mins;
        };
        const teacherNameOf = (en: Enrollment) => {
            const t = en.teacher;
            if (typeof t === 'string') return t;
            if (t && typeof t === 'object' && t.name) return t.name;
            return en.teacherFallback || '';
        };

        const familySchedule: FamilyScheduleItem[] = children.flatMap(child =>
            (child.enrollments || []).flatMap(en =>
                (en.schedule || []).map(sch => ({
                    ...sch,
                    studentName: child.name,
                    subject: en.subject || 'بدون عنوان',
                    teacherName: teacherNameOf(en)
                }))
            )
        ).sort((a, b) => {
            const dayDiff = DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day);
            if (dayDiff !== 0) return dayDiff;
            return toMinutes(a.hour) - toMinutes(b.hour);
        });

        const totalEnrollments = children.reduce((sum, child) => sum + (child.enrollments?.length || 0), 0);
        const totalSessions = children.reduce((sum, child) =>
            sum + (child.enrollments || []).reduce((s, en) => s + en.sessionsTotal, 0), 0);
        const completedSessions = children.reduce((sum, child) =>
            sum + (child.enrollments || []).reduce((s, en) => s + en.sessionsUsed, 0), 0);
        const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

        return {
            children,
            familySchedule,
            totalEnrollments,
            totalSessions,
            completedSessions,
            completionRate
        };
    }, [selectedParent, students]);

    return {
        state: {
            parents,
            students,
            searchTerm,
            loading: isLoadingParents || isLoadingStudents,
            showAddForm,
            selectedParent,
            showDetails,
            editId,
            confirmModal,
            newParent,
            filteredParents,
            ...stats,
            selectedParentData
        },
        actions: {
            setSearchTerm,
            setShowAddForm,
            setSelectedParent,
            setShowDetails,
            setEditId,
            setConfirmModal,
            setNewParent,
            handleAddParent,
            handleEditParent,
            handleDeleteParent,
            handleImportParents,
            handleExportParents,
            refresh: () => {
                queryClient.invalidateQueries({ queryKey: ['parents'] });
                queryClient.invalidateQueries({ queryKey: ['students'] });
            }
        }
    };
};
