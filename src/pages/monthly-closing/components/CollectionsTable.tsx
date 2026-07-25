import React from 'react';
import { Wallet } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { SectionCard, SectionTitle } from './ClosingUI';
import { cn } from '../../../lib/utils';
import { api } from '../../../lib/api';

interface StudentInvoice {
    id: string;
    studentName: string;
    description?: string;
    amount: number;
    date: string;
    status: string;
}

interface CollectionsTableProps {
    studentInvoices: StudentInvoice[];
    startDate: string;
    endDate: string;
}

export const CollectionsTable: React.FC<CollectionsTableProps> = ({ studentInvoices, startDate, endDate }) => {
    const queryClient = useQueryClient();

    return (
        <SectionCard>
            <div className="p-4 border-b border-border/50 dark:border-border/50">
                <SectionTitle icon={Wallet} label="سجل التحصيلات النقدية" sub="مدفوعات الطلاب المسجلة" color="var(--bg-success)" />
            </div>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-start">
                    <thead className="bg-gradient-to-l from-primary to-primary">
                        <tr>
                            <th className="px-4 py-3 font-bold text-micro text-on-primary uppercase tracking-wider">الطالب</th>
                            <th className="px-4 py-3 font-bold text-micro text-on-primary text-center">المبلغ</th>
                            <th className="px-4 py-3 font-bold text-micro text-on-primary text-center">التاريخ</th>
                            <th className="px-4 py-3 font-bold text-micro text-on-primary text-center">الحالة</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border dark:divide-border">
                        {(studentInvoices || []).filter((inv) => inv.date >= startDate && inv.date <= endDate).map((item) => (
                            <tr key={item.id} className="hover:bg-surface/50 dark:hover:bg-primary-active/30 transition-colors">
                                <td className="px-4 py-4">
                                    <span className="block font-bold text-xs text-main dark:text-main mb-0.5">{item.studentName}</span>
                                    <span className="text-micro text-muted font-medium line-clamp-1">{item.description}</span>
                                </td>
                                <td className="px-4 py-4 text-center font-bold text-xs text-success">
                                    {item.amount.toLocaleString()} ج.م
                                </td>
                                <td className="px-4 py-4 text-center text-micro text-muted font-mono">{item.date}</td>
                                <td className="px-4 py-4 text-center">
                                    <button
                                        onClick={async () => {
                                            const newStatus = item.status === 'paid' ? 'pending' : 'paid';
                                            await api.patch(`/studentInvoices/${item.id}`, { status: newStatus });
                                            queryClient.invalidateQueries({ queryKey: ['student-invoices-closing'] });
                                        }}
                                        className={cn(
                                            "px-3 py-1 font-bold text-micro uppercase transition-all shadow-sm active:scale-95 rounded-xl",
                                            item.status === 'paid' ? "bg-success text-on-success" : "text-error border border-error bg-error-light"
                                        )}
                                    >
                                        {item.status === 'paid' ? 'تم التحصيل' : 'انتظار'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Mobile cards */}
            <div className="md:hidden space-y-3 p-4">
                {(studentInvoices || []).filter((inv) => inv.date >= startDate && inv.date <= endDate).map((item) => (
                    <div key={item.id} className="bg-surface dark:bg-card rounded-xl p-4 space-y-2">
                        <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                                <span className="block font-bold text-xs text-main leading-tight truncate">{item.studentName}</span>
                                <span className="text-micro text-muted font-medium line-clamp-1">{item.description}</span>
                            </div>
                            <span className="text-xs font-bold text-success me-2">{item.amount.toLocaleString()} ج.م</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-micro text-muted font-mono">{item.date}</span>
                            <button
                                onClick={async () => {
                                    const newStatus = item.status === 'paid' ? 'pending' : 'paid';
                                    await api.patch(`/studentInvoices/${item.id}`, { status: newStatus });
                                    queryClient.invalidateQueries({ queryKey: ['student-invoices-closing'] });
                                }}
                                className={cn(
                                    "px-3 py-1 font-bold text-micro uppercase transition-all shadow-sm active:scale-95 rounded-xl",
                                    item.status === 'paid' ? "bg-success text-on-success" : "text-error border border-error bg-error-light"
                                )}
                            >
                                {item.status === 'paid' ? 'تم التحصيل' : 'انتظار'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </SectionCard>
    );
};
