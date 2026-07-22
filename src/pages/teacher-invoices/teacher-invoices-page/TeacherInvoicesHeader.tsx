import { Search, Calendar, GraduationCap, Plus, X, UserPlus, Trash2, Printer } from 'lucide-react';
import { INVOICE_STATUS } from '../../../types/invoice';
import { PrimaryBtn, SecondaryBtn, DangerBtn } from '../components/InvoiceUI';

interface TeacherInvoicesHeaderProps {
    stats: { totalAmount: number };
    searchTerm: string;
    onSearchChange: (v: string) => void;
    filterStatus: string;
    onFilterChange: (v: string) => void;
    startDate: string;
    onStartDateChange: (v: string) => void;
    endDate: string;
    onEndDateChange: (v: string) => void;
    showForm: boolean;
    onToggleForm: () => void;
    onImport: () => void;
    onDeleteAll: () => void;
    onPrint: () => void;
    isTeacher: boolean;
}

export const TeacherInvoicesHeader = ({
    stats, searchTerm, onSearchChange, filterStatus, onFilterChange,
    startDate, onStartDateChange, endDate, onEndDateChange,
    showForm, onToggleForm, onImport, onDeleteAll, onPrint, isTeacher
}: TeacherInvoicesHeaderProps) => (
    <div className="bg-surface border border-border/50 rounded-2xl p-3 md:p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
                    <GraduationCap size={16} className="text-primary" />
                </div>
                <div>
                    <h1 className="text-sm md:text-base font-bold text-main">فواتير المعلمات</h1>
                    <p className="text-[10px] font-bold text-muted">إدارة مستحقات المعلمات المالية</p>
                </div>
            </div>
            <span className="text-[10px] font-bold text-success bg-success-soft px-2.5 py-1 rounded-lg whitespace-nowrap">
                {stats.totalAmount.toLocaleString()} ج.م
            </span>
        </div>
        <div className="flex flex-col lg:flex-row gap-2 items-center">
            <div className="flex-1 flex gap-2 items-center w-full">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={13} />
                    <input aria-label="بحث باسم المعلمة" placeholder="بحث باسم المعلمة..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full rounded-xl ps-8 pe-3 py-2 text-xs font-bold outline-none bg-card border border-border text-main placeholder:text-muted focus:ring-2 focus:ring-focus transition-all" />
                </div>
                <div className="flex items-center gap-2 rounded-xl px-3 py-2 bg-card border border-border">
                    <Calendar size={13} className="text-muted" />
                    <div className="flex items-center gap-1">
                        <input type="date" aria-label="تاريخ البداية" className="bg-transparent border-none p-0 text-xs font-bold text-main outline-none cursor-pointer"
                            value={startDate} onChange={(e) => onStartDateChange(e.target.value)} />
                        <span className="text-[10px] font-bold text-muted">إلى</span>
                        <input type="date" aria-label="تاريخ النهاية" className="bg-transparent border-none p-0 text-xs font-bold text-main outline-none cursor-pointer"
                            value={endDate} onChange={(e) => onEndDateChange(e.target.value)} />
                    </div>
                </div>
                <select value={filterStatus} onChange={(e) => onFilterChange(e.target.value)}
                    aria-label="تصفية حسب الحالة"
                    className="w-auto min-w-[120px] rounded-xl px-3 py-2 text-xs font-bold outline-none bg-card border border-border text-main focus:ring-2 focus:ring-focus transition-all">
                    <option value="all">جميع الحالات</option>
                    {Object.values(INVOICE_STATUS).map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>
            <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                {!isTeacher && (
                    <>
                        <PrimaryBtn onClick={onToggleForm} className="whitespace-nowrap">
                            {showForm ? <X size={14} /> : <Plus size={14} />}
                            {showForm ? 'إلغاء' : 'إضافة فاتورة'}
                        </PrimaryBtn>
                        <SecondaryBtn onClick={onImport} title="استيراد من الحصص">
                            <UserPlus size={14} /> استيراد
                        </SecondaryBtn>
                        <DangerBtn onClick={onDeleteAll} title="حذف الكل">
                            <Trash2 size={14} />
                        </DangerBtn>
                    </>
                )}
                <SecondaryBtn onClick={onPrint} title="طباعة السجل">
                    <Printer size={14} />
                </SecondaryBtn>
            </div>
        </div>
    </div>
);
