import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parentsService } from '../services/parentsService';
import type { Parent } from '../../../types';
import type { FamilyScheduleItem } from '../types';
import { useApp } from '../../../context/AppContext';

export const useParents = () => {
    const queryClient = useQueryClient();
    const { showNotification } = useApp();

    // UI Local State
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [newParent, setNewParent] = useState({ name: '', phone: '', email: '' });

    const [confirmModal, setConfirmModal] = useState<{
        show: boolean;
        message: string;
        confirmText?: string;
        variant?: 'danger' | 'primary';
        action: (() => void) | null;
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
        mutationFn: parentsService.deleteParent,
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
            setNewParent({ name: '', phone: '', email: '' });
        } catch (error) {
            console.error("Error saving parent", error);
        }
    };

    const handleEditParent = (parent: Parent) => {
        setNewParent({ name: parent.name, phone: parent.phone, email: parent.email || '' });
        setEditId(parent.id);
        setShowAddForm(true);
    };

    const handleDeleteParent = (id: string) => {
        setConfirmModal({
            show: true,
            message: 'هل أنت متأكد من حذف هذا الولي أمر؟',
            confirmText: 'نعم، حذف',
            variant: 'danger',
            action: async () => {
                await deleteMutation.mutateAsync(id);
                if (selectedParent?.id === id) setShowDetails(false);
            }
        });
    };

    const handleImportParents = async () => {
        const existingPhones = new Set(parents.map(p => p.phone));
        const newParentsList: Omit<Parent, 'id'>[] = [];
        const seenPhones = new Set();

        for (const s of students) {
            if (s.parentPhone && !existingPhones.has(s.parentPhone) && !seenPhones.has(s.parentPhone)) {
                seenPhones.add(s.parentPhone);
                newParentsList.push({ name: `ولي أمر ${s.name}`, phone: s.parentPhone, email: '' });
            }
        }

        if (newParentsList.length === 0) {
            setConfirmModal({
                show: true,
                message: 'لا يوجد أولياء أمور جدد للاستيراد من قائمة الطلاب حالياً.',
                confirmText: 'حسناً',
                variant: 'primary',
                action: null
            });
            return;
        }

        setConfirmModal({
            show: true,
            message: `تم العثور على ${newParentsList.length} ولي أمر جديد في قائمة الطلاب. هل تريد استيرادهم تلقائياً؟`,
            confirmText: 'بدء الاستيراد',
            variant: 'primary',
            action: async () => {
                const { successCount, failCount } = await parentsService.importParents(newParentsList);
                queryClient.invalidateQueries({ queryKey: ['parents'] });

                setTimeout(() => {
                    setConfirmModal({
                        show: true,
                        message: failCount === 0
                            ? `تم استيراد ${successCount} ولي أمر بنجاح.`
                            : `تم استيراد ${successCount} ولي أمر، وفشل استيراد ${failCount}.`,
                        confirmText: 'إغلاق',
                        variant: 'primary',
                        action: null
                    });
                }, 300);
            }
        });
    };

    // Derived Data
    const filteredParents = useMemo(() => {
        return parents.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.phone.includes(searchTerm) ||
            (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [parents, searchTerm]);

    const stats = useMemo(() => {
        const linkedStudents = students.filter(s => parents.some(p => p.phone === s.parentPhone));
        return {
            totalParents: parents.length,
            totalLinkedStudents: linkedStudents.length
        };
    }, [parents, students]);

    const selectedParentData = useMemo(() => {
        if (!selectedParent) return null;

        const children = students.filter(s => s.parentPhone === selectedParent.phone);

        const familySchedule: FamilyScheduleItem[] = children.flatMap(child =>
            (child.enrollments || []).flatMap(en =>
                (en.schedule || []).map(sch => ({
                    ...sch,
                    studentName: child.name,
                    subject: en.subject || 'بدون عنوان'
                }))
            )
        ).sort((a, b) => {
            if (a.day !== b.day) return a.day.localeCompare(b.day);
            return Number(a.hour) - Number(b.hour);
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
            refresh: () => {
                queryClient.invalidateQueries({ queryKey: ['parents'] });
                queryClient.invalidateQueries({ queryKey: ['students'] });
            }
        }
    };
};
