import { API_BASE_URL } from '../../../config/api';
import type { Session, Student } from '../types';

export const attendanceService = {
    getSessions: async (): Promise<Session[]> => {
        const res = await fetch(`${API_BASE_URL}/sessions`);
        if (!res.ok) throw new Error('Failed to fetch sessions');
        return res.json();
    },

    getStudents: async (): Promise<Student[]> => {
        const res = await fetch(`${API_BASE_URL}/students`);
        if (!res.ok) throw new Error('Failed to fetch students');
        return res.json();
    },

    updateSessionStatus: async (id: string, status: Session['status']): Promise<void> => {
        const res = await fetch(`${API_BASE_URL}/sessions/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (!res.ok) throw new Error('Failed to update session status');
    },

    createSession: async (session: Omit<Session, 'id'>): Promise<Session> => {
        const res = await fetch(`${API_BASE_URL}/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(session)
        });
        if (!res.ok) throw new Error('Failed to create session');
        return res.json();
    },

    updateStudent: async (student: Student): Promise<void> => {
        const res = await fetch(`${API_BASE_URL}/students/${student.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student)
        });
        if (!res.ok) throw new Error('Failed to update student');
    }
};
