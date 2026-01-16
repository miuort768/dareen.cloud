import { api } from '../../../lib/api';
import type { ReportData } from '../types';
import type { Student, Session, StudentInvoice } from '../../../types';

export const reportsService = {
    async getReportData(): Promise<ReportData> {
        const [students, sessions, invoices] = await Promise.all([
            api.get<Student[]>('/students'),
            api.get<Session[]>('/sessions'),
            api.get<StudentInvoice[]>('/invoices')
        ]);

        return {
            students,
            sessions,
            invoices
        };
    }
};
