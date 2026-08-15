import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../services/studentService';
import { useShowNotification } from '../../../context/AppContext';

export const useStudents = (searchTerm?: string) => {
    const queryClient = useQueryClient();
    const showNotification = useShowNotification();

    const studentsQuery = useQuery({
        queryKey: ['students', searchTerm],
        queryFn: () => studentService.getAll(searchTerm),
    });

    const createMutation = useMutation({
        mutationFn: studentService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            showNotification('تم إضافة الطالب بنجاح', 'success');
        },
        onError: (error: Error) => {
            showNotification(error.message || 'فشل في إضافة الطالب', 'error');
        }
    });

    const updateMutation = useMutation({
        mutationFn: studentService.update,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            showNotification('تم تحديث بيانات الطالب بنجاح', 'success');
        },
        onError: (error: Error) => {
            showNotification(error.message || 'فشل في تحديث بيانات الطالب', 'error');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: studentService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            showNotification('تم حذف الطالب بنجاح', 'success');
        },
        onError: (error: Error) => {
            showNotification(error.message || 'فشل في حذف الطالب', 'error');
        }
    });

    const deleteAllMutation = useMutation({
        mutationFn: (password?: string) => studentService.deleteAll(password),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            showNotification('تم حذف جميع الطلاب بنجاح', 'success');
        },
        onError: (error: Error) => {
            showNotification(error.message || 'فشل حذف جميع الطلاب', 'error');
        }
    });

    return {
        students: studentsQuery.data || [],
        isLoading: studentsQuery.isLoading,
        createStudent: createMutation.mutate,
        createStudentAsync: createMutation.mutateAsync,
        updateStudent: updateMutation.mutate,
        deleteStudent: deleteMutation.mutate,
        deleteAllStudents: deleteAllMutation.mutate,
        deleteAllStudentsAsync: deleteAllMutation.mutateAsync
    };
};
