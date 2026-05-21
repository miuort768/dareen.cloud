import { api } from '../../../lib/api';
import type { Session, Student } from '../types';

export const attendanceService = {
    getSessions: async (): Promise<Session[]> => {
        const data = await api.get<{ data: Session[] } | Session[]>('/sessions');
        return Array.isArray(data) ? data : data.data;
    },

    getStudents: async (): Promise<Student[]> => {
        const data = await api.get<{ data: Student[] } | Student[]>('/students');
        return Array.isArray(data) ? data : data.data;
    },

    updateSessionStatus: async (id: string, status: Session['status']): Promise<void> => {
        await api.patch(`/sessions/${id}`, { status });
    },

    createSession: async (session: Omit<Session, 'id'>): Promise<Session> => {
        return api.post<Session>('/sessions', session);
    },

    updateStudent: async (student: Student): Promise<void> => {
        await api.put(`/students/${student.id}`, student);
    }
};
