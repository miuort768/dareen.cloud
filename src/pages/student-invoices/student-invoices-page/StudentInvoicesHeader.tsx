import { Search, FileText, Sparkles, Plus, X, UserPlus, Printer, Trash2 } from 'lucide-react';
import { PrimaryBtn, SecondaryBtn, DangerBtn } from '../components/InvoiceUI';

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
    <>
        <div className="bg-primary rounded-2xl px-4 md:px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-white/20">
                    <FileText size={22} className="text-on-primary" />
                </div>
                <div>
                    <h1 className="text-lg md:text-xl font-black text-on-primary leading-tight">فواتير الطلاب</h1>
                    <p className="text-xs font-bold text-on-primary opacity-70 mt-0.5">إدارة الفواتير والمستحقات المالية للطلاب</p>
                </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold px-3 py-2 whitespace-nowrap rounded-xl bg-success text-on-success">
                <Sparkles size={13} />
                {totalRevenue.toLocaleString()} د.ك إيرادات مسددة
            </div>
        </div>
        <div className="bg-primary rounded-2xl p-3">
            <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
                <div className="flex-1 flex gap-3 items-center w-full">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-on-primary opacity-50" size={14} />
                        <input placeholder="بحث باسم الطالب أو البيان..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full rounded-xl px-9 py-2 text-xs font-bold outline-none text-on-primary placeholder:text-on-primary placeholder:opacity-50 bg-white/15" />
                    </div>
                    <select value={filterStatus} onChange={(e) => onFilterChange(e.target.value)}
                        aria-label="تصفية حسب الحالة"
                        className="rounded-xl px-3 py-2 text-xs font-bold outline-none text-on-primary bg-white/15">
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
    </>
);
