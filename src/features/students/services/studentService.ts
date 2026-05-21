import { api } from '../../../lib/api';
import type { Student, StudentInvoice } from '../types';

export const studentService = {
    getAll: async (searchTerm?: string): Promise<Student[]> => {
        const data = await api.get<Student[] | { data: Student[] }>(`/students${searchTerm ? `?q=${encodeURIComponent(searchTerm)}` : ''}`);
        return data.data || data; // Handle both paginated and non-paginated fallbacks
    },

    create: async (student: Omit<Student, 'id'>): Promise<Student> => {
        return api.post<Student>('/students', { ...student, enrollments: student.enrollments || [] });
    },

    update: async (student: Student): Promise<Student> => {
        return api.put<Student>(`/students/${student.id}`, student);
    },

    delete: async (id: string): Promise<void> => {
        return api.delete(`/students/${id}`);
    },

    deleteAll: async (): Promise<void> => {
        return api.delete('/students');
    },

    createInvoice: async (invoice: Omit<StudentInvoice, 'id'>): Promise<StudentInvoice> => {
        return api.post<StudentInvoice>('/studentInvoices', invoice);
    }
};
