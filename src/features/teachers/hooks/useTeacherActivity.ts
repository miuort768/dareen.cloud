import { useQuery } from '@tanstack/react-query';
import { teacherService } from '../services/teacherService';

export const useTeacherActivity = (teacherId?: string | null) => {
    return useQuery({
        queryKey: ['teacher-activity', teacherId],
        queryFn: () => teacherService.getActivity(teacherId as string),
        enabled: Boolean(teacherId),
        staleTime: 30_000,
    });
};
