import { api } from '../../../lib/api';
import type { Session, TeacherInvoice, Transaction, FixedExpense, Student, Teacher } from '../../../types';

export const financeService = {
    async getFinanceData() {
        const [rawSessions, rawInvoices, rawStudents, rawTeachers, rawTransactions, rawFixedExpenses] = await Promise.all([
            api.get<Session[]>('/sessions').catch(() => []),
            api.get<TeacherInvoice[]>('/invoices').catch(() => []),
            api.get<Student[]>('/students').catch(() => []),
            api.get<Teacher[]>('/teachers').catch(() => []),
            api.get<Transaction[]>('/finance/transactions').catch(() => []),
            api.get<FixedExpense[]>('/finance/fixed-expenses').catch(() => [])
        ]);

        const sessions = Array.isArray(rawSessions) ? rawSessions : [];
        const invoices = Array.isArray(rawInvoices) ? rawInvoices : [];
        const students = Array.isArray(rawStudents) ? rawStudents : [];
        const teachers = Array.isArray(rawTeachers) ? rawTeachers : [];
        const transactions = Array.isArray(rawTransactions) ? rawTransactions : [];
        const fixedExpenses = Array.isArray(rawFixedExpenses) ? rawFixedExpenses : [];

        // Process sessions to include effective price
        const processedSessions = sessions.map(session => {
            let price = Number(session.price) || 0;
            if (price === 0) {
                const studentId = session.studentId;
                const student = students.find(s => s && s.id === studentId);
                price = Number(student?.sessionPrice) || 0;

                if (price === 0) {
                    const teacherName = session.teacherName;
                    const teacher = teachers.find(t => t && (t.id === session.teacherId || t.name === teacherName));
                    price = Number(teacher?.price) || 0;
                }
            }
            return { ...session, price };
        });

        return {
            sessions: processedSessions,
            invoices,
            transactions,
            fixedExpenses: fixedExpenses.length > 0 ? fixedExpenses : [
                { id: 1, name: 'إيجار المركز', amount: 0 },
                { id: 2, name: 'كهرباء وإنترنت', amount: 0 },
                { id: 3, name: 'نثريات وتسويق', amount: 0 },
                { id: 4, name: 'حصص ملغية', amount: 0 },
                { id: 5, name: 'أخرى', amount: 0 }
            ]
        };
    },

    async updateFixedExpense(id: number, amount: number) {
        return api.put<FixedExpense>(`/finance/fixed-expenses/${id}`, { amount });
    },

    async addTransaction(data: Omit<Transaction, 'id' | 'status'>) {
        return api.post<Transaction>('/finance/transactions', data);
    },

    async resetFixedExpenses() {
        return api.post<FixedExpense[]>('/finance/fixed-expenses/reset', {});
    },

    async deleteAllTransactions() {
        return api.delete('/finance/transactions');
    },

    async deleteTransaction(id: string) {
        return api.delete(`/finance/transactions/${id}`);
    }
};
