import { motion } from 'framer-motion';
import { Users, DollarSign, CheckCircle2, AlertCircle, CreditCard, Percent } from 'lucide-react';
import { KpiCard } from './InvoiceUI';

interface TeacherStats {
    totalTeachers: number;
    totalAmount: number;
    paidAmount: number;
    unpaidAmount: number;
    personalExpenses: number;
    unpaidPercentage: number;
}

interface InvoiceStatsProps {
    stats: TeacherStats;
}

export const InvoiceStats = ({ stats }: InvoiceStatsProps) => (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-6 gap-2.5">
        <KpiCard title="المعلمات" value={stats.totalTeachers} icon={Users} accent="primary" />
        <KpiCard title="الإجمالي" value={`${stats.totalAmount.toLocaleString()} ج.م`} icon={DollarSign} accent="success" />
        <KpiCard title="المدفوع" value={`${stats.paidAmount.toLocaleString()} ج.م`} icon={CheckCircle2} accent="info" />
        <KpiCard title="المعلق" value={`${stats.unpaidAmount.toLocaleString()} ج.م`} icon={AlertCircle} accent="error" />
        <KpiCard title="مصاريف" value={`${stats.personalExpenses.toLocaleString()} ج.م`} icon={CreditCard} accent="warning" />
        <KpiCard title="النسبة" value={`${stats.unpaidPercentage}%`} icon={Percent} accent="error" />
    </motion.div>
);