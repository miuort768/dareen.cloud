import { useState, useEffect } from 'react';
import { Receipt, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useCurrentUser } from '../../context/AppContext';
import { CURRENCY_SYMBOL } from '@/config/constants';

interface StudentInvoice {
    id: string;
    studentId: string;
    amount: number;
    description: string;
    date: string;
    dueDate: string;
    status: 'paid' | 'pending' | 'overdue';
    currency?: string;
}

export const InvoicesCard = () => {
    const navigate = useNavigate();
    const currentUser = useCurrentUser();
    const [invoices, setInvoices] = useState<StudentInvoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const fetchInvoices = async () => {
            try {
                const data = await api.get<StudentInvoice[]>('/invoices/me/student');
                const all = Array.isArray(data) ? data : [];
                const mine = all.filter(inv => inv.studentId === currentUser?.id);
                if (!cancelled) setInvoices(mine);
            } catch {
                // silent — invoices are non-critical
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        if (currentUser?.id) fetchInvoices();
        return () => { cancelled = true; };
    }, [currentUser?.id]);

    if (isLoading || invoices.length === 0) return null;

    const pending = invoices.filter(i => i.status === 'pending' || i.status === 'overdue');
    const totalPending = pending.reduce((sum, i) => sum + i.amount, 0);

    return (
        <div className="bg-card dark:bg-[#0d0d0f] border border-border dark:border-[#D4AF37]/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-info-soft dark:bg-[#D4AF37]/15 flex items-center justify-center">
                        <Receipt size={14} className="text-info dark:text-[#D4AF37]" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-main dark:text-white">الفواتير</h3>
                        <p className="text-micro text-muted dark:text-zinc-400">{pending.length} فاتورة معلقة</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/student-invoices')}
                    className="text-primary dark:text-[#D4AF37] text-xs font-bold flex items-center gap-1"
                >
                    عرض الكل <ArrowLeft size={10} />
                </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-surface dark:bg-[#0a0a0c] rounded-xl">
                <span className="text-micro text-muted dark:text-zinc-400">المبلغ المطلوب</span>
                <span className="text-sm font-bold text-error">{totalPending.toFixed(3)} {CURRENCY_SYMBOL}</span>
            </div>
        </div>
    );
};
