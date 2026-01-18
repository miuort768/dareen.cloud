import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherService } from '../services/teacherService';
import { useApp } from '../../../context/AppContext';

export const useTeachers = () => {
    const queryClient = useQueryClient();
    const { showNotification } = useApp();

    const teachersQuery = useQuery({
        queryKey: ['teachers'],
        queryFn: teacherService.getAll
    });

    const createMutation = useMutation({
        mutationFn: teacherService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
            showNotification('تم إضافة المعلمة بنجاح', 'success');
        },
        onError: (error: Error) => {
            showNotification(error.message || 'فشل في إضافة المعلمة', 'error');
        }
    });

    const updateMutation = useMutation({
        mutationFn: teacherService.update,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
            showNotification('تم تحديث بيانات المعلمة بنجاح', 'success');
        },
        onError: (error: Error) => {
            showNotification(error.message || 'فشل في تحديث بيانات المعلمة', 'error');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: teacherService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
            showNotification('تم حذف المعلمة بنجاح', 'success');
        },
        onError: (error: Error) => {
            showNotification(error.message || 'فشل في حذف المعلمة', 'error');
        }
    });

    return {
        teachers: teachersQuery.data || [],
        isLoading: teachersQuery.isLoading,
        createTeacher: createMutation.mutate,
        createTeacherAsync: createMutation.mutateAsync,
        updateTeacher: updateMutation.mutate,
        deleteTeacher: deleteMutation.mutate
    };
};
