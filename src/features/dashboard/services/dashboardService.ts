import { api } from '../../../lib/api';
import type { Student, Teacher, Parent, Session, TeacherInvoice, StudentInvoice } from '../../../types';

export const dashboardService = {
    async getRawData() {
        const [students, teachers, parents, sessions, teacherInvoices, studentInvoices] = await Promise.all([
            api.get<Student[]>('/students'),
            api.get<Teacher[]>('/teachers'),
            api.get<Parent[]>('/parents'),
            api.get<Session[]>('/sessions'),
            api.get<TeacherInvoice[]>('/invoices'),
            api.get<StudentInvoice[]>('/studentInvoices'),
        ]);

        return {
            students: Array.isArray(students) ? students : [],
            teachers: Array.isArray(teachers) ? teachers : [],
            parents: Array.isArray(parents) ? parents : [],
            sessions: Array.isArray(sessions) ? sessions : [],
            teacherInvoices: Array.isArray(teacherInvoices) ? teacherInvoices : [],
            studentInvoices: Array.isArray(studentInvoices) ? studentInvoices : [],
        };
    },

    async updateSessionStatus(id: string, newStatus: 'scheduled' | 'completed' | 'cancelled') {
        return api.patch(`/sessions/${id}`, { status: newStatus });
    }
};
