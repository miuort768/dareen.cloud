import { Search, FileText, Plus, X, UserPlus, Printer, Trash2 } from 'lucide-react';
import { PrimaryBtn, SecondaryBtn, DangerBtn } from '../components/InvoiceUI';
import { CURRENCY_SYMBOL } from '@/config/constants';

interface StudentInvoicesHeaderProps {
    totalRevenue: number;
    searchTerm: string;
    onSearchChange: (v: string) => void;
    filterStatus: string;
    onFilterChange: (v: string) => void;
    showForm: boolean;
    onToggleForm: () => void;
    onImport: () => void;
    onPrint: () => void;
    onDeleteAll: () => void;
}

export const StudentInvoicesHeader = ({
    totalRevenue, searchTerm, onSearchChange, filterStatus, onFilterChange,
    showForm, onToggleForm, onImport, onPrint, onDeleteAll
}: StudentInvoicesHeaderProps) => (
    <div className="bg-surface border border-border rounded-2xl p-3 md:p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-primary" />
                </div>
                <div>
                    <h1 className="text-sm md:text-base font-bold text-main">فواتير الطلاب</h1>
                    <p className="text-[10px] font-bold text-muted">إدارة الفواتير والمستحقات المالية</p>
                </div>
            </div>
            <span className="text-[10px] font-bold text-success bg-success-soft px-2.5 py-1 rounded-lg whitespace-nowrap">
                {totalRevenue.toLocaleString()} {CURRENCY_SYMBOL}
            </span>
        </div>
        <div className="flex flex-col lg:flex-row gap-2 items-center">
            <div className="flex-1 flex gap-2 items-center w-full">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={13} />
                    <input aria-label="بحث باسم الطالب" placeholder="بحث باسم الطالب أو البيان..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full rounded-xl ps-8 pe-3 py-2 text-xs font-bold outline-none bg-card border border-border text-main placeholder:text-muted focus:ring-2 focus:ring-focus transition-all" />
                </div>
                <select value={filterStatus} onChange={(e) => onFilterChange(e.target.value)}
                    aria-label="تصفية حسب الحالة"
                    className="rounded-xl px-3 py-2 text-xs font-bold outline-none bg-card border border-border text-main focus:ring-2 focus:ring-focus transition-all">
                    <option value="all">جميع الحالات</option>
                    <option value="paid">مدفوعة</option>
                    <option value="pending">معلقة</option>
                    <option value="overdue">متأخرة</option>
                </select>
            </div>
            <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                <PrimaryBtn onClick={onToggleForm} className="whitespace-nowrap">
                    {showForm ? <X size={14} /> : <Plus size={14} />}
                    {showForm ? 'إلغاء' : 'إضافة فاتورة'}
                </PrimaryBtn>
                <SecondaryBtn onClick={onImport} title="استيراد من الحصص">
                    <UserPlus size={14} /> استيراد
                </SecondaryBtn>
                <SecondaryBtn onClick={onPrint} title="طباعة السجل">
                    <Printer size={14} />
                </SecondaryBtn>
                <DangerBtn onClick={onDeleteAll} title="حذف الكل">
                    <Trash2 size={14} />
                </DangerBtn>
            </div>
        </div>
    </div>
);
