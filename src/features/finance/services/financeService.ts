import { api } from '../../../lib/api';
import type { Session, TeacherInvoice, Transaction, FixedExpense, Student, Teacher } from '../../../types';

export const financeService = {
    async getFinanceData() {
        const [sessions, invoices, students, teachers, transactions, fixedExpenses] = await Promise.all([
            api.get<Session[]>('/sessions'),
            api.get<TeacherInvoice[]>('/invoices'),
            api.get<Student[]>('/students'),
            api.get<Teacher[]>('/teachers'),
            api.get<Transaction[]>('/finance/transactions'),
            api.get<FixedExpense[]>('/finance/fixed-expenses')
        ]);

        // Process sessions to include effective price
        const processedSessions = sessions.map(session => {
            let price = Number(session.price) || 0;
            if (price === 0) {
                const student = students.find(s => s.id === session.studentId);
                price = Number(student?.sessionPrice) || 0;
            }

            let teacherPrice = Number(session.teacherPrice) || 0;
            if (teacherPrice === 0) {
                const teacher = teachers.find(t =>
                    (t.id && session.teacherId === t.id) ||
                    (t.name.trim().toLowerCase() === session.teacherName.trim().toLowerCase())
                );
                teacherPrice = Number(teacher?.price) || 0;
            }

            return { ...session, price, teacherPrice };
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
    }
};
