import { API_BASE_URL } from '../../../config/api';
import type { Teacher } from '../types';

export const teacherService = {
    getAll: async (): Promise<Teacher[]> => {
        const res = await fetch(`${API_BASE_URL}/teachers`);
        if (!res.ok) throw new Error('Failed to fetch teachers');
        return res.json();
    },

    create: async (teacher: Omit<Teacher, 'id'>): Promise<Teacher> => {
        const res = await fetch(`${API_BASE_URL}/teachers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(teacher)
        });
        if (!res.ok) throw new Error('Failed to create teacher');
        return res.json();
    },

    update: async (teacher: Teacher): Promise<Teacher> => {
        const res = await fetch(`${API_BASE_URL}/teachers/${teacher.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(teacher)
        });
        if (!res.ok) throw new Error('Failed to update teacher');
        return res.json();
    },

    delete: async (id: string): Promise<void> => {
        const res = await fetch(`${API_BASE_URL}/teachers/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete teacher');
    }
};
