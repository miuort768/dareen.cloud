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

export const CHART_COLORS = ['var(--bg-info)', 'var(--bg-success)', 'var(--bg-warning)', 'var(--bg-error)', 'var(--bg-primary)', 'var(--bg-error)'];
