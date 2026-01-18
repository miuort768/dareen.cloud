import { api } from '../../../lib/api';
import type { Teacher } from '../types';

export const teacherService = {
    getAll: async (): Promise<Teacher[]> => {
        return api.get<Teacher[]>('/teachers');
    },

    create: async (teacher: Omit<Teacher, 'id'>): Promise<Teacher> => {
        return api.post<Teacher>('/teachers', teacher);
    },

    update: async (teacher: Teacher): Promise<Teacher> => {
        return api.put<Teacher>(`/teachers/${teacher.id}`, teacher);
    },

    delete: async (id: string): Promise<void> => {
        return api.delete(`/teachers/${id}`);
    }
};
