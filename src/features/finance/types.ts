import type { Session, TeacherInvoice, Transaction, FixedExpense } from '../../types';

export interface FinanceData {
    sessions: Session[];
    invoices: TeacherInvoice[];
    transactions: Transaction[];
    fixedExpenses: FixedExpense[];
}

export interface FinanceState {
    loading: boolean;
    sessions: Session[];
    invoices: TeacherInvoice[];
    transactions: Transaction[];
    fixedExpenses: FixedExpense[];
    searchTerm: string;
    filterType: 'all' | 'income' | 'expense';
    filterMonth: string;
    showAddModal: boolean;
}

export const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
