import { API_BASE_URL } from '../../../config/api';
import type { Student, StudentInvoice } from '../types';

export const studentService = {
    getAll: async (searchTerm?: string): Promise<Student[]> => {
        let url = `${API_BASE_URL}/students`;
        if (searchTerm) {
            url += `?q=${encodeURIComponent(searchTerm)}`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch students');
        const data = await res.json();
        return data.data || data; // Handle both paginated and non-paginated fallbacks
    },

    create: async (student: Omit<Student, 'id'>): Promise<Student> => {
        const res = await fetch(`${API_BASE_URL}/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...student, enrollments: student.enrollments || [] })
        });
        if (!res.ok) throw new Error('Failed to create student');
        return res.json();
    },

    update: async (student: Student): Promise<Student> => {
        const res = await fetch(`${API_BASE_URL}/students/${student.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student)
        });
        if (!res.ok) throw new Error('Failed to update student');
        return res.json();
    },

    delete: async (id: string): Promise<void> => {
        const res = await fetch(`${API_BASE_URL}/students/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete student');
    },

    deleteAll: async (): Promise<void> => {
        const res = await fetch(`${API_BASE_URL}/students`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete all students');
    },

    createInvoice: async (invoice: Omit<StudentInvoice, 'id'>): Promise<StudentInvoice> => {
        const res = await fetch(`${API_BASE_URL}/studentInvoices`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invoice)
        });
        if (!res.ok) throw new Error('Failed to create invoice');
        return res.json();
    }
};
