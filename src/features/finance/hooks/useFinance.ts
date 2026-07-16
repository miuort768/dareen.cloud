import { useState, useEffect, useMemo } from 'react';
import { financeService } from '../services/financeService';
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
    const [serverStats, setServerStats] = useState<Record<string, unknown> | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [data, stats] = await Promise.all([
                financeService.getFinanceData(),
                financeService.getFinanceStats().catch(() => null),
            ]);
            setSessions(data.sessions);
            setInvoices(data.invoices);
            setManualTransactions(data.transactions);
            setFixedExpenses(data.fixedExpenses);
            setServerStats(stats as Record<string, unknown> | null);
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
        if (!window.confirm('هل أنت متأكد من حذف جميع المعاملات اليدوية؟ لا يمكن التراجع عن هذا الإجراء.')) return;
        try {
            await financeService.deleteAllTransactions();
            setManualTransactions([]);
        } catch (error) {
            console.error("Error deleting all transactions", error);
        }
    };

    // Derived Data
    const reportCurrency = useMemo(() => {
        if (serverStats?.reportCurrency) return serverStats.reportCurrency as string;
        return 'KWD';
    }, [serverStats]);

    const stats = useMemo(() => {
        const now = new Date();
        const currentMonthStr = now.toISOString().slice(0, 7);

        const isSameMonth = (dateStr: string) => {
            if (!dateStr) return false;
            try {
                const d = new Date(dateStr);
                return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
            } catch {
                return dateStr.startsWith(currentMonthStr);
            }
        };
        if (serverStats && filterMonth === 'all') {
            const fixedExpensesTotal = fixedExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
            const laborCost = sessions.filter(s => s.status === 'completed').reduce((sum, s) => sum + (Number(s.teacherPrice) || 0), 0);
            return { ...serverStats, totalFixedExpenses: fixedExpensesTotal, automatedLaborCost: laborCost };
        }

        const completedSessions = sessions.filter(s => s.status === 'completed');
        const monthSessions = completedSessions.filter(s => isSameMonth(s.date));

        // Income: Sessions Revenue + Manual Income
        const automatedIncome = completedSessions.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
        const manualIncome = manualTransactions.filter(t => t.type === 'income' && t.status === 'completed').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const totalIncome = automatedIncome + manualIncome;

        const monthIncome = monthSessions.reduce((sum, s) => sum + (Number(s.price) || 0), 0) +
            manualTransactions.filter(t => t.type === 'income' && t.status === 'completed' && isSameMonth(t.date)).reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        const manualExpenses = invoices.filter(inv => 
            ['paid', 'مدفوعة', 'تم الدفع'].includes(inv.status?.toLowerCase())
        ).reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
        
        const extraManualExpenses = manualTransactions.filter(t => t.type === 'expense' && t.status === 'completed').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const totalFixedExpenses = fixedExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

        const totalExpenses = manualExpenses + extraManualExpenses + totalFixedExpenses;

        const monthManualExpenses = invoices.filter(inv => 
            ['paid', 'مدفوعة', 'تم الدفع'].includes(inv.status?.toLowerCase()) && 
            isSameMonth(inv.date)
        ).reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
        
        const monthExtraManualExpenses = manualTransactions.filter(t => t.type === 'expense' && t.status === 'completed' && isSameMonth(t.date)).reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        const automatedLaborCost = completedSessions.reduce((sum, s) => sum + (Number(s.teacherPrice) || 0), 0);
        const monthExpensesValue = monthManualExpenses + monthExtraManualExpenses + totalFixedExpenses;

        const netProfit = totalIncome - totalExpenses;
        const monthProfit = monthIncome - monthExpensesValue;
        const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';

        return {
            totalIncome,
            monthIncome,
            totalExpenses,
            monthExpenses: monthExpensesValue,
            totalFixedExpenses,
            automatedLaborCost,
            netProfit,
            monthProfit,
            profitMargin,
            reportCurrency
        };
    }, [sessions, invoices, manualTransactions, fixedExpenses, serverStats, filterMonth]);

    const allTransactions = useMemo(() => {
        const combined: Transaction[] = [
            ...manualTransactions,
            ...sessions
                .filter(s => s.status === 'completed' || s.status === 'scheduled')
                .flatMap(s => {
                    const trans = [];
                    // Revenue
                    trans.push({
                        id: `session-rev-${s.id}`,
                        type: 'income' as const,
                        category: 'حصة دراسية',
                        amount: Number(s.price) || 0,
                        date: s.date || '',
                        description: `(دفق مالي) ${s.studentName} - ${s.subject}`,
                        status: s.status === 'completed' ? 'completed' : 'pending' as const
                    });
                    // Labor Cost (Accrued) - Only if completed
                    if (s.status === 'completed') {
                        trans.push({
                            id: `session-cost-${s.id}`,
                            type: 'expense' as const,
                            category: 'تكلفة المعلمة',
                            amount: Number(s.teacherPrice) || 0,
                            date: s.date || '',
                            description: `(أجر معلمة - مستحق) ${s.teacherName} - عن ${s.studentName}`,
                            status: 'completed' as const
                        });
                    }
                    return trans;
                }),
            ...invoices.map(inv => ({
                id: `invoice-${inv.id}`,
                type: 'expense' as const,
                category: 'راتب معلمة',
                amount: (Number(inv.amount) || 0),
                date: inv.date || '',
                description: `فاتورة مدفوعة: ${inv.teacher} ${inv.personalExpenses ? `(بعد خصم ${inv.personalExpenses} نثريات)` : ''}`,
                status: ['paid', 'مدفوعة', 'تم الدفع'].includes(inv.status?.toLowerCase()) ? 'completed' : 
                        ['pending', 'معلقة', 'قيد المعالجة'].includes(inv.status?.toLowerCase()) ? 'pending' : 'cancelled' as const
            }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return combined;
    }, [manualTransactions, sessions, invoices]);

    const filteredTransactions = useMemo(() => {
        return allTransactions.filter(t => {
            const matchesSearch = (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.category || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'all' || t.type === filterType;

            const isMatchingMonth = (dateStr: string) => {
                if (filterMonth === 'all') return true;
                const [y, m] = filterMonth.split('-').map(Number);
                const d = new Date(dateStr);
                return d.getFullYear() === y && (d.getMonth() + 1) === m;
            };

            return matchesSearch && matchesType && isMatchingMonth(t.date);
        });
    }, [allTransactions, searchTerm, filterType, filterMonth]);

    const uniqueMonths = useMemo(() => {
        return Array.from(new Set(allTransactions.map(t => t.date.slice(0, 7)))).sort().reverse();
    }, [allTransactions]);

    const chartData = useMemo(() => {
        if (serverStats && filterMonth === 'all') {
            return {
                monthlyData: serverStats.monthlyData,
                pieData: serverStats.pieData
            };
        }

        const months = uniqueMonths.slice(0, 6).reverse();
        const monthlyData = months.map((month: string) => {
            const [y, m] = month.split('-').map(Number);
            const isMonth = (dateStr: string) => {
                const d = new Date(dateStr);
                return d.getFullYear() === y && (d.getMonth() + 1) === m;
            };

            const inc = allTransactions
                .filter(t => t.type === 'income' && t.status === 'completed' && isMonth(t.date))
                .reduce((sum: number, t: { amount: number }) => sum + t.amount, 0);
            const exp = allTransactions
                .filter(t => t.type === 'expense' && t.status === 'completed' && isMonth(t.date))
                .reduce((sum: number, t: { amount: number }) => sum + t.amount, 0);
            return {
                month: new Date(y, m - 1).toLocaleDateString('ar-EG', { month: 'short' }),
                income: inc,
                expense: exp
            };
        });

        const expenseByCategory = allTransactions
            .filter(t => t.type === 'expense' && t.status === 'completed')
            .reduce((acc: Record<string, number>, t: any) => {
                const cat = t.category || 'أخرى';
                acc[cat] = (acc[cat] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

        const pieData = Object.entries(expenseByCategory).map(([name, value], index: number) => ({
            name,
            value,
            fill: CHART_COLORS[index % CHART_COLORS.length]
        }));

        return { monthlyData, pieData };
    }, [allTransactions, uniqueMonths, serverStats, filterMonth]);

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
            refresh: fetchData
        }
    };
};
