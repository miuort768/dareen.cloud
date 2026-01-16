import type { Student, Session, StudentInvoice } from '../../types';

export interface ReportData {
    students: Student[];
    sessions: Session[];
    invoices: StudentInvoice[];
}

export type ReportType = 'academic' | 'attendance' | 'financial' | 'enrollment';

export const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
