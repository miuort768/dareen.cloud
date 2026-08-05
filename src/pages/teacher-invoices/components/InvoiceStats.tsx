import { motion } from 'framer-motion';
import { Users, DollarSign, CheckCircle2, AlertCircle, CreditCard, Percent } from 'lucide-react';
import { CURRENCY_SYMBOL } from '../../../config/constants';
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
        <KpiCard title="الإجمالي" value={`${stats.totalAmount.toLocaleString()} ${CURRENCY_SYMBOL}`} icon={DollarSign} accent="success" />
        <KpiCard title="المدفوع" value={`${stats.paidAmount.toLocaleString()} ${CURRENCY_SYMBOL}`} icon={CheckCircle2} accent="info" />
        <KpiCard title="المعلق" value={`${stats.unpaidAmount.toLocaleString()} ${CURRENCY_SYMBOL}`} icon={AlertCircle} accent="error" />
        <KpiCard title="مصاريف" value={`${stats.personalExpenses.toLocaleString()} ${CURRENCY_SYMBOL}`} icon={CreditCard} accent="warning" />
        <KpiCard title="النسبة" value={`${stats.unpaidPercentage}%`} icon={Percent} accent="error" />
    </motion.div>
);