import { useState, useEffect, useMemo } from 'react';
import { financeService } from '../services/financeService';
import { api } from '../../../lib/api';
import type { Session, TeacherInvoice, Transaction, FixedExpense } from '../../../types';
import { CHART_COLORS } from '../types';

export const useFinance = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [invoices, setInvoices] = useState<TeacherInvoice[]>([]);
    const [manualTransactions, setManualTransactions] = useState<Transaction[]>([]);
    const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
    const [filterMonth, setFilterMonth] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await financeService.getFinanceData();
            setSessions(data.sessions);
            setInvoices(data.invoices);
            setManualTransactions(data.transactions);
            setFixedExpenses(data.fixedExpenses);
        } catch (error) {
            console.error("Error fetching finance data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateFixedExpense = async (id: number, amount: string) => {
        try {
            const updatedItem = await financeService.updateFixedExpense(id, Number(amount));
            setFixedExpenses(prev => prev.map(item => item.id === id ? updatedItem : item));
        } catch (error) {
            console.error("Error updating fixed expense", error);
        }
    };

    const handleAddTransaction = async (data: Omit<Transaction, 'id' | 'status'>) => {
        try {
            const newTransaction = await financeService.addTransaction(data);
            setManualTransactions(prev => [newTransaction, ...prev]);
            setShowAddModal(false);
            // Refresh to ensure everything is in sync if needed, but locally update is usually enough
        } catch (error) {
            console.error("Error adding transaction", error);
        }
    };

    const handleConvertAllFixedExpenses = async () => {
        const transactionsToAdd = fixedExpenses.filter(exp => exp.amount > 0);
        if (transactionsToAdd.length === 0) return;

        try {
            await Promise.all(transactionsToAdd.map(exp =>
                financeService.addTransaction({
                    type: 'expense',
                    category: exp.name,
                    amount: exp.amount,
                    date: new Date().toISOString().split('T')[0],
                    description: `تحويل تلقائي من المصاريف الثابتة: ${exp.name}`
                })
            ));
            fetchData();
        } catch (error) {
            console.error("Error converting fixed expenses", error);
        }
    };

    const handleClearAllFixedExpenses = async () => {
        if (!window.confirm('هل أنت متأكد من تصفير جميع المبالغ؟')) return;
        try {
            const resetData = await financeService.resetFixedExpenses();
            setFixedExpenses(resetData);
        } catch (error) {
            console.error("Error resetting fixed expenses", error);
        }
    };

    const handleDeleteAllTransactions = async () => {
        const confirmMsg = 'تحذير! هذا الإجراء سيقوم بحذف جميع المعاملات اليدوية نهائياً. هل أنت متأكد؟';
        if (!window.confirm(confirmMsg)) return;
        try {
            await financeService.deleteAllTransactions();
            setManualTransactions([]);
            alert('تم حذف جميع المعاملات اليدوية بنجاح');
            fetchData(); // Refresh all data to stay in sync
        } catch (error) {
            console.error("Error deleting all transactions", error);
            alert('حدث خطأ أثناء مسح السجل المالي');
        }
    };

    const handleDeleteTransaction = async (id: string) => {
        const isSession = id.startsWith('session-');
        const isInvoice = id.startsWith('invoice-');
        const actualId = id.replace('session-', '').replace('invoice-', '');

        const confirmMsg = isSession
            ? 'هذه معاملة ناتجة عن "حصة دراسية". حذفها سيؤدي لحذف تسجيل الحصة من النظام بالكامل. هل أنت متأكد؟'
            : isInvoice
                ? 'هذه معاملة ناتجة عن "فاتورة معلمة". حذف المعاملة سيحذف الفاتورة. هل أنت متأكد؟'
                : 'هل أنت متأكد من حذف هذه المعاملة؟';

        if (!window.confirm(confirmMsg)) return;

        try {
            if (isSession) {
                await api.delete(`/sessions/${actualId}`);
                setSessions(prev => prev.filter(s => s.id !== actualId));
            } else if (isInvoice) {
                await api.delete(`/invoices/teacher/${actualId}`);
                setInvoices(prev => prev.filter(inv => inv.id !== actualId));
            } else {
                await financeService.deleteTransaction(id);
                setManualTransactions(prev => prev.filter(t => t.id !== id));
            }
            alert('تم الحذف بنجاح');
        } catch (error) {
            console.error("Error deleting transaction", error);
            alert('حدث خطأ أثناء الحذف. يرجى التأكد من صلاحياتك أو اتصال السيرفر.');
        }
    };

    // Derived Data
    const currentMonth = new Date().toISOString().slice(0, 7);

    const stats = useMemo(() => {
        const automatedIncome = sessions
            .filter(s => s.status === 'completed')
            .reduce((sum, s) => sum + (Number(s.price) || 0), 0);

        const manualIncome = manualTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalIncome = automatedIncome + manualIncome;

        const monthIncome = sessions
            .filter(s => s.status === 'completed' && s.date?.startsWith(currentMonth))
            .reduce((sum, s) => sum + (Number(s.price) || 0), 0) +
            manualTransactions
                .filter(t => t.type === 'income' && t.date.startsWith(currentMonth))
                .reduce((sum, t) => sum + t.amount, 0);

        const automatedExpenses = invoices
            .filter(inv => inv.status === 'مدفوعة' || inv.status === 'paid') // Handle both localized and raw status
            .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

        const manualExpenses = manualTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = automatedExpenses + manualExpenses;

        const monthExpenses = invoices
            .filter(inv => (inv.status === 'مدفوعة' || inv.status === 'paid') && inv.date?.startsWith(currentMonth))
            .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0) +
            manualTransactions
                .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
                .reduce((sum, t) => sum + t.amount, 0);

        const totalFixedExpenses = fixedExpenses.reduce((sum, item) => sum + item.amount, 0);
        const netProfit = totalIncome - totalExpenses - totalFixedExpenses;
        const monthProfit = monthIncome - monthExpenses;
        const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';

        return {
            totalIncome,
            monthIncome,
            totalExpenses,
            monthExpenses,
            totalFixedExpenses,
            netProfit,
            monthProfit,
            profitMargin
        };
    }, [sessions, invoices, manualTransactions, fixedExpenses, currentMonth]);

    const allTransactions = useMemo(() => {
        const combined: Transaction[] = [
            ...manualTransactions,
            ...sessions
                .filter(s => s.status === 'completed' || s.status === 'scheduled')
                .map(s => ({
                    id: `session-${s.id}`,
                    type: 'income' as const,
                    category: 'حصة دراسية',
                    amount: Number(s.price) || 0,
                    date: s.date || '',
                    description: `${s.studentName} - ${s.subject}`,
                    status: s.status === 'completed' ? 'completed' : 'pending' as any
                })),
            ...invoices.map(inv => ({
                id: `invoice-${inv.id}`,
                type: 'expense' as const,
                category: 'راتب معلمة',
                amount: (Number(inv.amount) || 0) + (Number(inv.personalExpenses) || 0),
                date: inv.date || '',
                description: `فاتورة: ${inv.teacher}`,
                status: inv.status === 'مدفوعة' ? 'completed' : inv.status === 'قيد المعالجة' ? 'pending' : 'cancelled' as any
            }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return combined;
    }, [manualTransactions, sessions, invoices]);

    const filteredTransactions = useMemo(() => {
        return allTransactions.filter(t => {
            const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.category.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'all' || t.type === filterType;
            const matchesMonth = filterMonth === 'all' || t.date.startsWith(filterMonth);
            return matchesSearch && matchesType && matchesMonth;
        });
    }, [allTransactions, searchTerm, filterType, filterMonth]);

    const uniqueMonths = useMemo(() => {
        return Array.from(new Set(allTransactions.map(t => t.date.slice(0, 7)))).sort().reverse();
    }, [allTransactions]);

    const chartData = useMemo(() => {
        const months = uniqueMonths.slice(0, 6).reverse();
        const monthlyData = months.map(month => {
            const inc = allTransactions
                .filter(t => t.type === 'income' && t.status === 'completed' && t.date.startsWith(month))
                .reduce((sum, t) => sum + t.amount, 0);
            const exp = allTransactions
                .filter(t => t.type === 'expense' && t.status === 'completed' && t.date.startsWith(month))
                .reduce((sum, t) => sum + t.amount, 0);
            return {
                month: new Date(month + '-01').toLocaleDateString('ar-EG', { month: 'short' }),
                income: inc,
                expense: exp
            };
        });

        const expenseByCategory = allTransactions
            .filter(t => t.type === 'expense' && t.status === 'completed')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

        const pieData = Object.entries(expenseByCategory).map(([name, value], index) => ({
            name,
            value,
            fill: CHART_COLORS[index % CHART_COLORS.length]
        }));

        return { monthlyData, pieData };
    }, [allTransactions, uniqueMonths]);

    return {
        state: {
            loading,
            sessions,
            invoices,
            manualTransactions,
            fixedExpenses,
            searchTerm,
            filterType,
            filterMonth,
            showAddModal,
            ...stats,
            filteredTransactions,
            uniqueMonths,
            ...chartData
        },
        actions: {
            setSearchTerm,
            setFilterType,
            setFilterMonth,
            setShowAddModal,
            handleUpdateFixedExpense,
            handleAddTransaction,
            handleConvertAllFixedExpenses,
            handleClearAllFixedExpenses,
            handleDeleteAllTransactions,
            handleDeleteTransaction,
            refresh: fetchData
        }
    };
};
